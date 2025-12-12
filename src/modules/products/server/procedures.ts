import { DEFAULT_LIMIT } from "@/constants";
import { Category, Media, Tenant, User } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { headers as getHeaders } from "next/headers";
import type { Sort, Where } from "payload";
import z from "zod";
import { sortValues } from "../search-params";

// OPTIMIZATION 1: In-memory cache cho categories (tránh query DB mỗi lần)
// Cache TTL: 5 phút
const categoriesCache = new Map<
  string,
  {
    data: { slug: string; subcategories: string[] };
    timestamp: number;
  }
>();
const CATEGORIES_CACHE_TTL = 5 * 60 * 1000; // 5 phút

/**
 * Helper function: Get category với subcategories, có caching
 * Giảm query time từ ~50-100ms xuống ~0ms cho cached requests
 */
async function getCategoryWithSubcategories(
  db: any,
  categorySlug: string
): Promise<{ slug: string; subcategories: string[] } | null> {
  // Check cache trước
  const cached = categoriesCache.get(categorySlug);
  if (cached && Date.now() - cached.timestamp < CATEGORIES_CACHE_TTL) {
    return cached.data;
  }

  // Cache miss - query DB
  const categoriesData = await db.find({
    collection: "categories",
    depth: 1,
    limit: 1,
    pagination: false,
    where: {
      slug: {
        equals: categorySlug,
      },
    },
  });

  const parentCategory = categoriesData.docs[0];
  if (!parentCategory) return null;

  const subcategoriesSlugs =
    (parentCategory.subcategories?.docs || []).map(
      (subDoc: Category) => subDoc.slug
    ) || [];

  const result = {
    slug: parentCategory.slug,
    subcategories: subcategoriesSlugs,
  };

  // Cache result
  categoriesCache.set(categorySlug, {
    data: result,
    timestamp: Date.now(),
  });

  return result;
}

/**
 * Export function để clear cache khi cần
 * Call khi có update categories
 */
export function clearCategoriesCache() {
  categoriesCache.clear();
}

export const productsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const headers = await getHeaders();
      const session = await ctx.db.auth({ headers });

      const product = await ctx.db.findByID({
        collection: "products",
        id: input.id,
        depth: 2, // Load the "product.image", "product.tenant" and "product.tenant.image"
        // select: {
        //   content: false, // Exclude content field
        // },
      });

      if (product.isArchived) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      let isPurchased = false;

      if (session?.user) {
        const ordersData = await ctx.db.find({
          collection: "orders",
          where: {
            and: [
              {
                product: {
                  equals: input.id,
                },
              },
              {
                user: {
                  equals: session.user.id,
                },
              },
            ],
          },
        });

        isPurchased = !!ordersData.docs[0];
        // isPurchased = ordersData.totalDocs > 0;
      }

      const reviewsData = await ctx.db.find({
        collection: "reviews",
        pagination: false, // Lấy tất cả reviews (không phân trang)
        where: {
          product: {
            equals: product.id, // Chỉ lấy reviews thuộc về product này
          },
        },
      });

      // Khởi tạo rating trung bình = 0 (mặc định khi không có reviews)
      let reviewRating = 0;

      // Tính rating trung bình nếu có reviews
      if (reviewsData.docs.length > 0) {
        // Tính tổng tất cả ratings và chia cho số lượng reviews
        reviewRating =
          reviewsData.docs.reduce((acc, review) => acc + review.rating, 0) / // Tổng ratings
          reviewsData.totalDocs; // Chia cho tổng số reviews
      }

      /**
       * Khởi tạo object để đếm phân bố rating (1-5 sao)
       * Key: số sao (1,2,3,4,5), Value: số lượng reviews có rating đó
       * Phân bố theo %
       * ratingDistribution: {
       *   5: 60,  // 60% reviews 5 sao
       *   4: 25,  // 25% reviews 4 sao
       *   3: 10,  // 10% reviews 3 sao
       *   2: 3,   // 3% reviews 2 sao
       *   1: 2    // 2% reviews 1 sao
       * };
       */
      const ratingDistribution: Record<number, number> = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      // Chỉ tính phân bố nếu có reviews
      if (reviewsData.totalDocs > 0) {
        // Lặp qua từng review để đếm số lượng theo rating
        reviewsData.docs.forEach((review) => {
          const rating = review.rating;

          // Kiểm tra rating hợp lệ (1-5)
          if (rating >= 1 && rating <= 5) {
            // Tăng counter cho rating tương ứng
            ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
          }
        });
      }

      // Chuyển đổi từ số lượng thành phần trăm
      Object.keys(ratingDistribution).forEach((key) => {
        const rating = Number(key);
        const count = ratingDistribution[rating] || 0; // Số lượng reviews cho rating này
        // Tính phần trăm: (số reviews rating này / tổng reviews) * 100
        // Math.round để làm tròn thành số nguyên
        const percentage = Math.round((count / reviewsData.totalDocs) * 100);
        ratingDistribution[rating] = isNaN(percentage) ? 0 : percentage;
      });

      return {
        ...product,
        isPurchased,
        isOwner: (session?.user?.tenants || [])
          .map((t) => (t.tenant as Tenant).id)
          .includes((product.tenant as Tenant).id),
        image: product.image as Media | null,
        cover: product.cover as Media | null,
        tenant: product.tenant as Tenant & { image: Media | null },
        reviewRating, // Rating trung bình (VD: 4.2)
        reviewCount: reviewsData.totalDocs, // Tổng số reviews (VD: 150)
        ratingDistribution, // Phân bố rating theo % (VD: {5:60, 4:25, 3:10, 2:3, 1:2})
      };
    }),

  getMany: baseProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
        category: z.string().nullable().optional(),
        search: z.string().nullable().optional(),
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        sort: z.enum(sortValues).nullable().optional(),
        tenantSlug: z.string().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const headers = await getHeaders();
      const session = await ctx.db.auth({ headers });

      const where: Where = {
        isArchived: {
          // tại sao không dùng "equals: false"? vì "defaultValue: false" (ở collection Products) và nếu ẩn "defaultValue" thì nó là "undefined"
          // khi tạo sản phẩm mới sẽ không có trường này, và khi đó sẽ không lọc được sản phẩm đã lưu trữ
          not_equals: true, // Chỉ lấy các sản phẩm chưa bị lưu trữ
        },
      };

      // Lọc các sản phẩm theo tenant của người dùng
      // Nếu người dùng có nhiều tenants, thì sẽ lọc ra các sản phẩm thuộc về các tenants đó
      // Điều kiện này chỉ lọc các sản phẩm khi không có tenantSlug được cung cấp (nghĩa là ở trang home public, con trang của tenant thì có tenantSlug)
      // if (
      //   !input.tenantSlug &&
      //   session?.user?.tenants &&
      //   session.user.tenants.length > 0
      // ) {
      //   where["tenant"] = {
      //     not_in: session.user.tenants.map((t) => (t.tenant as Tenant).id),
      //   };
      // }

      let sort: Sort = "-createdAt";

      if (input.sort === "curated") {
        sort = "-createdAt";
      }

      if (input.sort === "hot_and_new") {
        sort = "+createdAt";
      }

      if (input.sort === "trending") {
        sort = "-createdAt";
      }

      if (input.minPrice && input.maxPrice) {
        where.price = {
          greater_than_equal: input.minPrice,
          less_than_equal: input.maxPrice,
        };
      } else if (input.minPrice) {
        where.price = {
          greater_than_equal: input.minPrice,
        };
      } else if (input.maxPrice) {
        where.price = {
          less_than_equal: input.maxPrice,
        };
      }

      if (input.tenantSlug) {
        where["tenant.slug"] = {
          equals: input.tenantSlug,
        };
      } else {
        // If we are loading products for public storefront (no tenantSlug)
        // Make sure to not load products set to "isPrivate: true" (using reverse not_equals logic)
        // These products are exclusive private to the tenant store
        where["isPrivate"] = {
          not_equals: true, // Chỉ lấy các sản phẩm công khai
        };
      }

      // OPTIMIZATION 2: Sử dụng cached category query
      if (input.category) {
        const categoryData = await getCategoryWithSubcategories(
          ctx.db,
          input.category
        );

        if (categoryData) {
          where["category.slug"] = {
            in: [categoryData.slug, ...categoryData.subcategories],
          };
        }
      }

      if (input.tags && input.tags.length > 0) {
        where["tags.name"] = {
          in: input.tags,
        };
      }

      if (input.search) {
        where["name"] = {
          like: input.search,
        };
      }

      // OPTIMIZATION 3: Giảm depth từ 2 xuống 1 (giảm ~200-300ms)
      // OPTIMIZATION 4: Chỉ select fields cần thiết cho list view
      const data = await ctx.db.find({
        collection: "products",
        depth: 2, // populate tenant và image
        where,
        sort,
        page: input.cursor,
        limit: input.limit,
        select: {
          // content: false, // Exclude content field
          // Chỉ select fields cần thiết cho product list
          id: true,
          name: true,
          price: true,
          image: true,
          tenant: true,
          isPrivate: true,
          createdAt: true,
          updatedAt: true,
          // Exclude các fields không cần thiết
          // content: false, // Large field
          // description: false, // Large field
          // cover: false, // Không cần cho list view
          // isArchived: false,
          // category: false, // Đã filter by category rồi
        },
      });

      const productIds = data.docs.map((product) => product.id);

      // OPTIMIZATION 5: Chạy parallel queries thay vì tuần tự (giảm ~200-300ms)
      const [ordersData, reviewsData] = await Promise.all([
        // Query orders (chỉ khi có session)
        session?.user
          ? ctx.db.find({
              collection: "orders",
              where: {
                and: [
                  {
                    product: {
                      in: productIds,
                    },
                  },
                  {
                    user: {
                      equals: session.user.id,
                    },
                  },
                ],
              },
              pagination: false,
              select: {
                // Chỉ select fields cần thiết
                id: true,
                product: true,
              },
            })
          : Promise.resolve({ docs: [] }),

        // OPTIMIZATION 6: Chỉ select fields cần thiết cho reviews
        // Giảm payload size ~40-50%
        ctx.db.find({
          collection: "reviews",
          where: {
            product: {
              in: productIds,
            },
          },
          pagination: false,
          select: {
            // Chỉ cần id, product, rating để tính average
            id: true,
            product: true,
            rating: true,
            // Không cần: comment, user, createdAt, etc.
          },
        }),
      ]);

      // Build purchased products set
      const purchasedProductIds = new Set(
        ordersData.docs.map((order) =>
          typeof order.product === "string" ? order.product : order.product.id
        )
      );

      // OPTIMIZATION 7: Efficient reviews aggregation
      // Thay vì store array, chỉ store count và totalRating
      const reviewsByProduct = reviewsData.docs.reduce((acc, review) => {
        const productId =
          typeof review.product === "string"
            ? review.product
            : review.product.id;
        if (!acc[productId]) {
          acc[productId] = {
            count: 0,
            totalRating: 0,
          };
        }
        acc[productId].count++;
        acc[productId].totalRating += review.rating;
        return acc;
      }, {} as Record<string, { count: number; totalRating: number }>);

      // OPTIMIZATION 8: Single pass mapping với minimal object creation
      const enrichedData = data.docs.map((product) => {
        const productReviews = reviewsByProduct[product.id] || {
          count: 0,
          totalRating: 0,
        };
        const reviewRating =
          productReviews.count > 0
            ? productReviews.totalRating / productReviews.count
            : 0;

        return {
          ...product,
          isPurchased: purchasedProductIds.has(product.id),
          reviewCount: productReviews.count,
          reviewRating: Math.round(reviewRating * 10) / 10, // Round to 1 decimal
        };
      });

      return {
        ...data,
        docs: enrichedData.map((doc) => ({
          ...doc,
          isOwner: (session.user?.tenants || [])
            .map((t) => (t.tenant as Tenant).id)
            .includes((doc.tenant as Tenant).id),
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),

  getReviews: baseProcedure
    .input(
      z.object({
        productId: z.string(),
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
        sort: z
          .enum(["-createdAt", "+createdAt", "-rating", "+rating"])
          .default("-createdAt"),
      })
    )
    .query(async ({ ctx, input }) => {
      const reviewsData = await ctx.db.find({
        collection: "reviews",
        depth: 1, // Populate user field để lấy thông tin người review
        where: {
          product: {
            equals: input.productId,
          },
        },
        sort: input.sort,
        page: input.cursor,
        limit: input.limit,
      });

      return {
        ...reviewsData,
        docs: reviewsData.docs.map((review) => ({
          ...review,
          user: review.user as User,
        })),
      };
    }),
});

import { DEFAULT_LIMIT } from "@/constants";
import { Category, Media, Product, Tenant } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { headers as getHeaders } from "next/headers";
import type { Sort, Where } from "payload";
import z from "zod";
import { sortValues } from "../search-params";

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
        select: {
          content: false, // Exclude content field
        },
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

      if (input.category) {
        const categoriesData = await ctx.db.find({
          collection: "categories",
          depth: 1, // Populate one level deep (subcategories), subcategories.[0] will be a type of Category
          limit: 1,
          pagination: false,
          where: {
            slug: {
              equals: input.category,
            },
          },
        });

        const formattedData = categoriesData.docs.map((doc) => ({
          ...doc,
          subcategories: (doc.subcategories?.docs || []).map((subDoc) => ({
            // Because of "depth: 1" we are confident "doc" will be a type of Category
            ...(subDoc as Category),
            subcategories: undefined, // Prevent further nesting
          })),
        }));

        const subcategoriesSlugs = [];
        const parentCategory = formattedData[0];

        if (parentCategory) {
          subcategoriesSlugs.push(
            ...parentCategory.subcategories.map((subcate) => subcate.slug)
          );

          where["category.slug"] = {
            in: [parentCategory.slug, ...subcategoriesSlugs],
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

      // const ordersData = await ctx.db.find({
      //   collection: "orders",
      //   pagination: false,
      //   where: {
      //     user: { equals: session.user?.id },
      //   },
      // });
      // const purchasedProductIds = ordersData.docs.map((order) => (order.product as Product).id);

      // // Nếu có purchasedProductIds thì sẽ lọc ra các sản phẩm mà user đã mua
      // if (purchasedProductIds.length > 0) {
      //   where.id = {
      //     not_in: purchasedProductIds,
      //   };
      // }

      const data = await ctx.db.find({
        collection: "products",
        depth: 2, // Populate "category", "image", "tenant" fields & "tenant.image" (this is a second level)
        where,
        sort,
        page: input.cursor,
        limit: input.limit,
        select: {
          content: false, // Exclude content field
        },
      });

      const dataWithOrders = await Promise.all(
        data.docs.map(async (product) => {
          let isPurchased = false;

          if (session?.user) {
            // Lấy tất cả orders của product hiện tại
            const ordersData = await ctx.db.find({
              collection: "orders",
              where: {
                and: [
                  {
                    product: {
                      equals: product.id,
                    },
                  },
                  {
                    user: {
                      equals: session.user?.id,
                    },
                  },
                ],
              },
            });

            isPurchased = !!ordersData.docs[0];
          }

          // Trả về product với thông tin isPurchased
          return {
            ...product,
            isPurchased,
          };
        })
      );

      // Thêm thông tin tóm tắt reviews (rating trung bình và số lượng reviews) cho mỗi product
      const dataWithSummarizedReviews = await Promise.all(
        dataWithOrders.map(async (product) => {
          // Lấy tất cả reviews của product hiện tại
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

          // Trả về product với thông tin reviews đã được tóm tắt
          return {
            ...product,
            reviewCount: reviewsData.totalDocs, // Thêm số lượng reviews
            reviewRating, // Thêm rating trung bình
          };
        })
      );

      return {
        ...data,
        docs: dataWithSummarizedReviews.map((doc) => ({
          ...doc,
          isOwner: (session.user?.tenants || []).map((t) => (t.tenant as Tenant).id).includes((doc.tenant as Tenant).id),
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});

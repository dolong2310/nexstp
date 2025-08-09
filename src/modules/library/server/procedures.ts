import { DEFAULT_LIMIT } from "@/constants";
import { Media, Tenant } from "@/payload-types";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";
import {
  LaunchpadProduct,
  LaunchpadProductWithSource,
  ProductWithSource,
} from "../types";

export const libraryRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const ordersData = await ctx.db.find({
        collection: "orders",
        limit: 1,
        pagination: false,
        where: {
          and: [
            {
              user: {
                equals: ctx.session.user.id,
              },
            },
            {
              or: [
                {
                  product: {
                    equals: input.productId, // product thường
                  },
                },
                {
                  launchpad: {
                    equals: input.productId, // launchpad
                  },
                },
              ],
            },
          ],
        },
      });

      const order = ordersData.docs[0];

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      let productData: ProductWithSource | LaunchpadProductWithSource | null =
        null;

      // Step 2: Determine if this is a product or launchpad order
      if (order.launchpad) {
        // Product từ launchpad
        const launchpad = await ctx.db.findByID({
          collection: "launchpads",
          id: input.productId,
          depth: 2,
        });

        if (!launchpad) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Launchpad not found",
          });
        }

        // Convert launchpad data to product format
        const launchpadData: LaunchpadProduct = {
          id: launchpad.id,
          name: launchpad.title,
          description: launchpad.description,
          price: launchpad.launchPrice,
          originalPrice: launchpad.originalPrice,
          image: launchpad.image,
          tenant: launchpad.tenant,
          category: launchpad.category,
          tags: launchpad.tags,
          content: launchpad.content,
          refundPolicy: launchpad.refundPolicy,
          createdAt: launchpad.createdAt,
          updatedAt: launchpad.updatedAt,
        };

        const result: LaunchpadProductWithSource = {
          ...launchpadData,
          sourceType: "launchpad",
          sourceLaunchpad: launchpad.id,
          isFromLaunchpad: true,
        };

        productData = result;
      } else {
        // Product thường
        const product = await ctx.db.findByID({
          collection: "products",
          id: input.productId,
          depth: 2,
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        const result: ProductWithSource = {
          ...product,
          originalPrice: 0,
          sourceType: "manual",
          isFromLaunchpad: false,
        };

        productData = result;
      }

      // Step 3: Get reviews for the product and calculate rating
      const reviewsData = await ctx.db.find({
        collection: "reviews",
        pagination: false,
        where: {
          product: {
            equals: productData.id,
          },
        },
      });

      let reviewRating = 0;

      if (reviewsData.docs.length > 0) {
        reviewRating =
          reviewsData.docs.reduce((acc, review) => acc + review.rating, 0) / reviewsData.totalDocs;
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

      if (reviewsData.totalDocs > 0) {
        reviewsData.docs.forEach((review) => {
          const rating = review.rating;

          if (rating >= 1 && rating <= 5) {
            ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
          }
        });
      }

      Object.keys(ratingDistribution).forEach((key) => {
        const rating = Number(key);
        const count = ratingDistribution[rating] || 0;
        const percentage = Math.round((count / reviewsData.totalDocs) * 100);
        ratingDistribution[rating] = isNaN(percentage) ? 0 : percentage;
      });

      return {
        ...productData,
        image: productData.image as Media | null,
        cover: productData.cover as Media | null,
        tenant: productData.tenant as Tenant & { image: Media | null },
        reviewRating,
        reviewCount: reviewsData.totalDocs,
        ratingDistribution,
      };
    }),

  // Procedure lấy danh sách products đã mua của user
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
      })
    )
    .query(async ({ ctx, input }) => {
      // Step 1: Lấy TOÀN BỘ orders của user (không phân trang ở đây)
      const allOrdersData = await ctx.db.find({
        collection: "orders",
        depth: 0,
        pagination: false, // Lấy tất cả orders
        where: {
          user: {
            equals: ctx.session.user.id,
          },
        },
        sort: "-createdAt", // Sort theo thời gian tạo mới nhất
      });

      // Step 2: Tách orders thành products và launchpads
      const productIds: string[] = [];
      const launchpadIds: string[] = [];

      allOrdersData.docs.forEach((order) => {
        if (order.launchpad) {
          launchpadIds.push(order.launchpad as string);
        } else if (order.product) {
          productIds.push(order.product as string);
        }
      });

      // Step 3: Lấy ALL products và launchpads (không phân trang)
      let productsFromProducts: any[] = [];
      let productsFromLaunchpads: any[] = [];

      const [productsData, launchpadsData] = await Promise.all([
        // Lấy products
        productIds.length > 0
          ? ctx.db.find({
              collection: "products",
              pagination: false,
              depth: 2,
              where: {
                id: { in: productIds },
              },
            })
          : { docs: [] },

        // Lấy launchpads
        launchpadIds.length > 0
          ? ctx.db.find({
              collection: "launchpads",
              pagination: false,
              depth: 2,
              where: {
                id: { in: launchpadIds },
              },
            })
          : { docs: [] },
      ]);

      productsFromProducts = productsData.docs;

      // Convert launchpads to product format
      productsFromLaunchpads = launchpadsData.docs.map((launchpad) => ({
        id: launchpad.id,
        name: launchpad.title,
        description: launchpad.description,
        price: launchpad.launchPrice,
        originalPrice: launchpad.originalPrice,
        image: launchpad.image,
        tenant: launchpad.tenant,
        category: launchpad.category,
        tags: launchpad.tags,
        content: launchpad.content,
        refundPolicy: launchpad.refundPolicy,
        createdAt: launchpad.createdAt,
        updatedAt: launchpad.updatedAt,
        sourceType: "launchpad",
        sourceLaunchpad: launchpad.id,
        isFromLaunchpad: true,
      }));

      // Step 4: Combine và sort theo order createdAt
      const allProducts = [...productsFromProducts, ...productsFromLaunchpads];

      // Sort theo thứ tự của orders (mới nhất trước)
      // Tạo map để tra cứu nhanh
      const orderMap = new Map();
      allOrdersData.docs.forEach((order) => {
        const key = order.product || order.launchpad;
        orderMap.set(key, order);
      });

      // Sort với tra cứu O(1)
      const sortedProducts = allProducts.sort((a, b) => {
        const orderA = orderMap.get(a.id) || orderMap.get(a.sourceLaunchpad);
        const orderB = orderMap.get(b.id) || orderMap.get(b.sourceLaunchpad);

        if (!orderA || !orderB) return 0;
        return (
          new Date(orderB.createdAt).getTime() -
          new Date(orderA.createdAt).getTime()
        );
      });

      // Step 5: Áp dụng pagination trên kết quả đã combine
      const totalDocs = sortedProducts.length;
      const startIndex = (input.cursor - 1) * input.limit;
      const endIndex = startIndex + input.limit;
      const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

      // Step 6: Thêm review data cho các products trong trang hiện tại
      const dataWithSummarizedReviews = await Promise.all(
        paginatedProducts.map(async (product) => {
          // Lấy tất cả reviews của product hiện tại
          const reviewsData = await ctx.db.find({
            collection: "reviews",
            pagination: false,
            where: {
              product: {
                equals: product.sourceLaunchpad || product.id,
              },
            },
          });

          let reviewRating = 0;
          if (reviewsData.docs.length > 0) {
            reviewRating =
              reviewsData.docs.reduce((acc, review) => acc + review.rating, 0) /
              reviewsData.totalDocs;
          }

          return {
            ...product,
            reviewCount: reviewsData.totalDocs,
            reviewRating,
          };
        })
      );

      // Step 7: Tính toán pagination metadata
      const totalPages = Math.ceil(totalDocs / input.limit);
      const hasNextPage = input.cursor < totalPages;
      const hasPrevPage = input.cursor > 1;

      return {
        docs: dataWithSummarizedReviews.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
        totalDocs,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? input.cursor + 1 : null,
        prevPage: hasPrevPage ? input.cursor - 1 : null,
        totalPages,
        page: input.cursor,
        limit: input.limit,
      };
    }),

  // getOne: protectedProcedure
  //   .input(
  //     z.object({
  //       productId: z.string(),
  //     })
  //   )
  //   .query(async ({ ctx, input }) => {
  //     const ordersData = await ctx.db.find({
  //       collection: "orders",
  //       limit: 1,
  //       pagination: false,
  //       where: {
  //         and: [
  //           {
  //             product: {
  //               equals: input.productId, // Chỉ lấy orders có product ID khớp với input
  //             },
  //           },
  //           {
  //             user: {
  //               equals: ctx.session.user.id, // Chỉ lấy orders của user đang đăng nhập
  //             },
  //           },
  //         ],
  //       },
  //     });

  //     const order = ordersData.docs[0];

  //     if (!order) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Order not found",
  //       });
  //     }

  //     const product = await ctx.db.findByID({
  //       collection: "products",
  //       id: input.productId,
  //     });

  //     if (!product) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Product not found",
  //       });
  //     }

  //     return product;
  //   }),

  // Procedure lấy danh sách products đã mua của user
  // getMany: protectedProcedure // Chỉ user đã đăng nhập mới access được
  //   .input(
  //     z.object({
  //       cursor: z.number().default(1),
  //       limit: z.number().default(DEFAULT_LIMIT),
  //     })
  //   )
  //   .query(async ({ ctx, input }) => {
  //     // Step 1: Lấy danh sách orders của user hiện tại
  //     const ordersData = await ctx.db.find({
  //       collection: "orders",
  //       depth: 0, // Không populate products, chỉ lấy product IDs để tối ưu performance
  //       page: input.cursor,
  //       limit: input.limit,
  //       where: {
  //         user: {
  //           equals: ctx.session.user.id, // Chỉ lấy orders của user đang đăng nhập
  //         },
  //       },
  //     });
  //     console.log("ordersData: ", ordersData);

  //     // Step 2: Extract product IDs từ orders
  //     const productIds = ordersData.docs.map((order) => order.launchpad || order.product);
  //     console.log("productIds: ", productIds);

  //     // Step 3: Lấy chi tiết products dựa trên product IDs
  //     const productsData = await ctx.db.find({
  //       collection: "products",
  //       pagination: false, // Không phân trang vì đã phân trang ở orders
  //       depth: 2, // Load the "product.image", "product.tenant" and "product.tenant.image"
  //       where: {
  //         id: {
  //           in: productIds, // Chỉ lấy products có ID trong danh sách productIds
  //         },
  //       },
  //     });
  //     console.log("productsData: ", productsData);

  //     // Thêm thông tin tóm tắt reviews (rating trung bình và số lượng reviews) cho mỗi product
  //     const dataWithSummarizedReviews = await Promise.all(
  //       productsData.docs.map(async (product) => {
  //         // Lấy tất cả reviews của product hiện tại
  //         const reviewsData = await ctx.db.find({
  //           collection: "reviews",
  //           pagination: false, // Lấy tất cả reviews (không phân trang)
  //           where: {
  //             product: {
  //               equals: product.id, // Chỉ lấy reviews thuộc về product này
  //             },
  //           },
  //         });

  //         // Khởi tạo rating trung bình = 0 (mặc định khi không có reviews)
  //         let reviewRating = 0;

  //         // Tính rating trung bình nếu có reviews
  //         if (reviewsData.docs.length > 0) {
  //           // Tính tổng tất cả ratings và chia cho số lượng reviews
  //           reviewRating =
  //             reviewsData.docs.reduce((acc, review) => acc + review.rating, 0) / // Tổng ratings
  //             reviewsData.totalDocs; // Chia cho tổng số reviews
  //         }

  //         // Trả về product với thông tin reviews đã được tóm tắt
  //         return {
  //           ...product,
  //           reviewCount: reviewsData.totalDocs, // Thêm số lượng reviews
  //           reviewRating, // Thêm rating trung bình
  //         };
  //       })
  //     );

  //     return {
  //       ...productsData,
  //       docs: dataWithSummarizedReviews.map((doc) => ({
  //         ...doc,
  //         image: doc.image as Media | null,
  //         tenant: doc.tenant as Tenant & { image: Media | null },
  //       })),
  //     };
  //   }),
});

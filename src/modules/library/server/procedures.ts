import { DEFAULT_LIMIT } from "@/constants";
import { Media, Tenant } from "@/payload-types";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

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
              product: {
                equals: input.productId, // Chỉ lấy orders có product ID khớp với input
              },
            },
            {
              user: {
                equals: ctx.session.user.id, // Chỉ lấy orders của user đang đăng nhập
              },
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

      const product = await ctx.db.findByID({
        collection: "products",
        id: input.productId,
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return product;
    }),

  // Procedure lấy danh sách products đã mua của user
  getMany: protectedProcedure // Chỉ user đã đăng nhập mới access được
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
      })
    )
    .query(async ({ ctx, input }) => {
      // Step 1: Lấy danh sách orders của user hiện tại
      const ordersData = await ctx.db.find({
        collection: "orders",
        depth: 0, // Không populate products, chỉ lấy product IDs để tối ưu performance
        page: input.cursor,
        limit: input.limit,
        where: {
          user: {
            equals: ctx.session.user.id, // Chỉ lấy orders của user đang đăng nhập
          },
        },
      });

      // Step 2: Extract product IDs từ orders
      const productIds = ordersData.docs.map((order) => order.product);

      // Step 3: Lấy chi tiết products dựa trên product IDs
      const productsData = await ctx.db.find({
        collection: "products",
        pagination: false, // Không phân trang vì đã phân trang ở orders
        depth: 2, // Load the "product.image", "product.tenant" and "product.tenant.image"
        where: {
          id: {
            in: productIds, // Chỉ lấy products có ID trong danh sách productIds
          },
        },
      });

      // Thêm thông tin tóm tắt reviews (rating trung bình và số lượng reviews) cho mỗi product
      const dataWithSummarizedReviews = await Promise.all(
        productsData.docs.map(async (product) => {
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
        ...productsData,
        docs: dataWithSummarizedReviews.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});

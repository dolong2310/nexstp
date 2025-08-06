import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const reviewsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Step 1: Tìm order của user để xác định đây là product hay launchpad
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
                    equals: input.productId, // Check nếu là product thường
                  },
                },
                {
                  launchpad: {
                    equals: input.productId, // Check nếu là launchpad
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
          message: "Order not found - You must purchase this item to review it",
        });
      }

      // Step 2: Tìm review existing với productId này
      const reviewsData = await ctx.db.find({
        collection: "reviews",
        limit: 1,
        where: {
          and: [
            {
              product: {
                equals: input.productId, // Review luôn sử dụng productId (có thể là launchpad ID)
              },
            },
            {
              user: {
                equals: ctx.session.user.id,
              },
            },
          ],
        },
      });

      const review = reviewsData.docs[0];

      if (!review) {
        return null;
      }

      return review;
    }),

  create: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        rating: z.number().min(1, { message: "Rating is required" }).max(5),
        description: z.string().min(1, { message: "Description is required" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Step 1: Verify user đã mua product/launchpad này
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
                    equals: input.productId, // Check nếu là product thường
                  },
                },
                {
                  launchpad: {
                    equals: input.productId, // Check nếu là launchpad
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
          code: "FORBIDDEN",
          message: "You must purchase this item to review it",
        });
      }

      // Step 2: Check if user đã review rồi
      const existingReviewsData = await ctx.db.find({
        collection: "reviews",
        where: {
          and: [
            {
              product: {
                equals: input.productId, // Review sử dụng productId (có thể là launchpad ID)
              },
            },
            {
              user: {
                equals: ctx.session.user.id,
              },
            },
          ],
        },
      });

      if (existingReviewsData.totalDocs > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already reviewed this product",
        });
      }

      // Step 3: Tạo review mới
      const review = await ctx.db.create({
        collection: "reviews",
        data: {
          product: input.productId, // Lưu productId (có thể là launchpad ID)
          user: ctx.session.user.id,
          rating: input.rating,
          description: input.description,
        },
      });

      return review;
    }),

  update: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        rating: z.number().min(1, { message: "Rating is required" }).max(5),
        description: z.string().min(1, { message: "Description is required" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingReview = await ctx.db.findByID({
        collection: "reviews",
        depth: 0, // existingReview.user will be the user ID
        id: input.reviewId,
      });

      if (!existingReview) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      if (existingReview.user !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this review",
        });
      }

      const updatedReview = await ctx.db.update({
        collection: "reviews",
        id: input.reviewId,
        data: {
          rating: input.rating,
          description: input.description,
        },
      });

      return updatedReview;
    }),
});

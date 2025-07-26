import { Media, Product, Tenant } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { Where } from "payload";
import { z } from "zod";

export const homeRouter = createTRPCRouter({
  getBannerActive: baseProcedure
    .input(
      z.object({
        tenantSlug: z.string().optional(),
        limit: z.number().min(1).max(20).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();

      const whereConditions: Where = {
        and: [
          {
            isActive: {
              equals: true,
            },
          },
          {
            or: [
              {
                startDate: {
                  exists: false,
                },
              },
              {
                startDate: {
                  less_than_equal: now.toISOString(),
                },
              },
            ],
          },
          {
            or: [
              {
                endDate: {
                  exists: false,
                },
              },
              {
                endDate: {
                  greater_than_equal: now.toISOString(),
                },
              },
            ],
          },
        ],
      };

      if (input.tenantSlug) {
        whereConditions.and?.push({
          "tenant.slug": {
            equals: input.tenantSlug,
          },
        });
      }

      const banners = await ctx.db.find({
        collection: "banners",
        depth: 2, // Populate tenant, product, and image
        limit: input.limit,
        sort: "-priority", // Sắp xếp theo priority giảm dần
        where: whereConditions,
      });

      return banners.docs.map((banner) => ({
        ...banner,
        image: banner.image as Media,
        tenant: banner.tenant as Tenant,
        product: banner.product as Product,
      }));
    }),

  incrementBannerImpression: baseProcedure
    .input(
      z.object({
        bannerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const banner = await ctx.db.findByID({
          collection: "banners",
          id: input.bannerId,
        });

        if (!banner) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Banner not found",
          });
        }

        await ctx.db.update({
          collection: "banners",
          id: input.bannerId,
          data: {
            impressionCount: (banner.impressionCount || 0) + 1,
          },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to increment impression",
        });
      }
    }),

  incrementBannerClick: baseProcedure
    .input(
      z.object({
        bannerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const banner = await ctx.db.findByID({
          collection: "banners",
          id: input.bannerId,
        });

        if (!banner) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Banner not found",
          });
        }

        await ctx.db.update({
          collection: "banners",
          id: input.bannerId,
          data: {
            clickCount: (banner.clickCount || 0) + 1,
          },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to increment click",
        });
      }
    }),
});

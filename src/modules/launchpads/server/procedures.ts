import { PLATFORM_FEE_PERCENTAGE } from "@/constants";
import { stripe } from "@/lib/stripe";
import { CheckoutMetadata, ProductMetadata } from "@/modules/checkout/types";
import { Category, Media, Tag, Tenant } from "@/payload-types";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { headers as getHeaders } from "next/headers";
import { Where } from "payload";
import Stripe from "stripe";
import {
  getLaunchpadSchema,
  getLaunchpadsSchema,
  purchaseLaunchpadSchema,
} from "../schemas";

export const launchpadsRouter = createTRPCRouter({
  // Public: Get many launchpads
  getMany: baseProcedure
    .input(getLaunchpadsSchema)
    .query(async ({ ctx, input }) => {
      const where: Where = {
        status: {
          equals: "live",
        },
        endTime: {
          greater_than: new Date().toISOString(),
        },
      };

      if (input.search) {
        where.or = [
          {
            title: {
              contains: input.search,
            },
          },
          {
            description: {
              contains: input.search,
            },
          },
        ];
      }

      let sort: string;
      switch (input.sort) {
        case "priority":
          sort = "-priority";
          break;
        case "newest":
          sort = "createdAt";
          break;
        case "ending-soon":
          sort = "endTime";
          break;
        default:
          sort = "-priority";
      }

      const data = await ctx.db.find({
        collection: "launchpads",
        depth: 2,
        where,
        sort,
        page: input.cursor,
        limit: input.limit,
      });

      return {
        ...data,
        docs: data.docs.map((doc) => ({
          ...doc,
          image: doc.image as Media,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),

  // Public: Get one launchpad
  getOne: baseProcedure
    .input(getLaunchpadSchema)
    .query(async ({ ctx, input }) => {
      const headers = await getHeaders();
      const session = await ctx.db.auth({ headers });

      const launchpad = await ctx.db.findByID({
        collection: "launchpads",
        id: input.id,
        depth: 2,
      });

      if (!launchpad) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Launchpad not found",
        });
      }

      // Chỉ cho phép xem launchpads đang live
      if (launchpad.status !== "live") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Launchpad not available",
        });
      }

      // Check if expired
      if (launchpad.endTime && new Date(launchpad.endTime) <= new Date()) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Launchpad has ended",
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

      const isOwner = Boolean(
        session.user?.tenants?.some(
          (tenant) =>
            (tenant.tenant as Tenant).id === (launchpad.tenant as Tenant).id
        )
      );

      return {
        ...launchpad,
        isOwner,
        isPurchased,
        image: launchpad.image as Media,
        tenant: launchpad.tenant as Tenant & { image: Media | null },
        category: launchpad.category as Category,
        tags: launchpad.tags as Tag[],
      };
    }),

  // Protected: Purchase launchpad
  purchase: protectedProcedure
    .input(purchaseLaunchpadSchema)
    .mutation(async ({ ctx, input }) => {
      const launchpad = await ctx.db.findByID({
        collection: "launchpads",
        id: input.launchpadId,
        depth: 1,
      });

      if (!launchpad) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Launchpad not found",
        });
      }

      if (launchpad.status !== "live") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Launchpad is not available for purchase",
        });
      }

      // Check if launchpad has expired
      if (launchpad.endTime && new Date() > new Date(launchpad.endTime)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Launchpad has expired",
        });
      }

      // Check if user already purchased this launchpad
      const existingOrder = await ctx.db.find({
        collection: "orders",
        where: {
          and: [
            {
              user: {
                equals: ctx.session.user.id,
              },
            },
            {
              launchpad: {
                equals: input.launchpadId,
              },
            },
          ],
        },
        limit: 1,
      });

      if (existingOrder.docs.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already purchased this launchpad",
        });
      }

      const tenant = launchpad.tenant as Tenant;
      const domain = `${process.env.NEXT_PUBLIC_APP_URL!}/launchpads/${
        launchpad.id
      }`;

      const totalAmount = launchpad.launchPrice * 100; // Convert to cents (Stripe expects amounts in cents)
      const platformFeeAmount = Math.round(
        totalAmount * (PLATFORM_FEE_PERCENTAGE / 100)
      );

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem = {
        quantity: 1,
        price_data: {
          unit_amount: launchpad.launchPrice * 100, // Convert to cents (because Stripe expects amounts in cents)
          currency: "usd",
          product_data: {
            name: launchpad.title,
            metadata: {
              stripeAccountId: tenant.stripeAccountId,
              id: launchpad.id,
              name: launchpad.title,
              price: launchpad.launchPrice,
              launchpad: launchpad.id,
            } as ProductMetadata,
          },
        },
      };

      const checkout = await stripe.checkout.sessions.create(
        {
          customer_email: ctx.session.user.email,
          success_url: `${domain}?success=true`,
          cancel_url: `${domain}?cancel=true`,
          line_items: [lineItems],
          mode: "payment",
          invoice_creation: {
            enabled: true,
          },
          metadata: {
            userId: ctx.session.user.id,
          } as CheckoutMetadata,
          payment_intent_data: {
            application_fee_amount: platformFeeAmount, // Platform fee amount in cents
          },
        },
        {
          stripeAccount: tenant.stripeAccountId, // Use the tenant's Stripe account
        }
      );

      if (!checkout.url) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session",
        });
      }

      // Create order by stripe when payment is successful
      // it will be handled by webhook in api/stripe/webhooks/route.ts

      // // Update sold count
      // await ctx.db.update({
      //   collection: "launchpads",
      //   id: input.launchpadId,
      //   data: {
      //     soldCount: (launchpad.soldCount || 0) + 1,
      //   },
      // });

      return { url: checkout.url };
    }),

  // // Protected: Create launchpad (tenant only)
  // create: protectedProcedure
  //   .input(createLaunchpadSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const tenantId = (ctx.session.user.tenants?.[0]?.tenant as Tenant).id;

  //     if (!tenantId) {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "You must be associated with a tenant to create launchpads",
  //       });
  //     }
  //     console.log("tenantId: ", tenantId);

  //     const launchpad = await ctx.db.create({
  //       collection: "launchpads",
  //       data: {
  //         ...input,
  //         tenant: tenantId,
  //         status: "draft",
  //         content: input.content || {},
  //       },
  //     });

  //     return launchpad;
  //   }),

  // // Protected: Update launchpad (tenant only, draft status only)
  // update: protectedProcedure
  //   .input(updateLaunchpadSchema.extend({ id: getLaunchpadSchema.shape.id }))
  //   .mutation(async ({ ctx, input }) => {
  //     const { id, ...updateData } = input;

  //     // Get current launchpad
  //     const currentLaunchpad = await ctx.db.findByID({
  //       collection: "launchpads",
  //       id,
  //     });

  //     if (!currentLaunchpad) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Launchpad not found",
  //       });
  //     }

  //     // Check status
  //     if (currentLaunchpad.status !== "draft") {
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: "Can only update draft launchpads",
  //       });
  //     }

  //     // Check ownership
  //     const tenantId = (ctx.session.user.tenants?.[0]?.tenant as Tenant).id;
  //     if (
  //       !isSuperAdmin(ctx.session.user) &&
  //       (currentLaunchpad.tenant as Tenant).id !== tenantId
  //     ) {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "Access denied",
  //       });
  //     }

  //     const updatedLaunchpad = await ctx.db.update({
  //       collection: "launchpads",
  //       id,
  //       data: updateData,
  //     });

  //     return updatedLaunchpad;
  //   }),

  // // Protected: Delete launchpad (tenant only, draft status only)
  // delete: protectedProcedure
  //   .input(getLaunchpadSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const currentLaunchpad = await ctx.db.findByID({
  //       collection: "launchpads",
  //       id: input.id,
  //     });

  //     if (!currentLaunchpad) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Launchpad not found",
  //       });
  //     }

  //     // Check status
  //     if (currentLaunchpad.status !== "draft") {
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: "Can only delete draft launchpads",
  //       });
  //     }

  //     // Check ownership
  //     const tenantId = (ctx.session.user.tenants?.[0]?.tenant as Tenant).id;
  //     if (
  //       !isSuperAdmin(ctx.session.user) &&
  //       (currentLaunchpad.tenant as Tenant).id !== tenantId
  //     ) {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "Access denied",
  //       });
  //     }

  //     await ctx.db.delete({
  //       collection: "launchpads",
  //       id: input.id,
  //     });

  //     return { success: true };
  //   }),

  // // Protected: Submit for approval (tenant only)
  // submitForApproval: protectedProcedure
  //   .input(getLaunchpadSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const currentLaunchpad = await ctx.db.findByID({
  //       collection: "launchpads",
  //       id: input.id,
  //     });

  //     if (!currentLaunchpad) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Launchpad not found",
  //       });
  //     }

  //     // Check status
  //     if (currentLaunchpad.status !== "draft") {
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: "Can only submit draft launchpads for approval",
  //       });
  //     }

  //     // Check ownership
  //     const tenantId = (ctx.session.user.tenants?.[0]?.tenant as Tenant).id;
  //     if ((currentLaunchpad.tenant as Tenant).id !== tenantId) {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "Access denied",
  //       });
  //     }

  //     const updatedLaunchpad = await ctx.db.update({
  //       collection: "launchpads",
  //       id: input.id,
  //       data: {
  //         status: "pending",
  //       },
  //     });

  //     return updatedLaunchpad;
  //   }),

  // // Protected: Approve launchpad (admin only)
  // approve: protectedProcedure
  //   .input(approveLaunchpadSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     if (!isSuperAdmin(ctx.session.user)) {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "Only admins can approve launchpads",
  //       });
  //     }

  //     const currentLaunchpad = await ctx.db.findByID({
  //       collection: "launchpads",
  //       id: input.id,
  //     });

  //     if (!currentLaunchpad) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Launchpad not found",
  //       });
  //     }

  //     if (currentLaunchpad.status !== "pending") {
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: "Can only approve pending launchpads",
  //       });
  //     }

  //     const updateData: any = {
  //       status: "approved",
  //     };

  //     if (input.priority !== undefined) {
  //       updateData.priority = input.priority;
  //     }

  //     const updatedLaunchpad = await ctx.db.update({
  //       collection: "launchpads",
  //       id: input.id,
  //       data: updateData,
  //     });

  //     return updatedLaunchpad;
  //   }),

  // // Protected: Reject launchpad (admin only)
  // reject: protectedProcedure
  //   .input(rejectLaunchpadSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     if (!isSuperAdmin(ctx.session.user)) {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "Only admins can reject launchpads",
  //       });
  //     }

  //     const currentLaunchpad = await ctx.db.findByID({
  //       collection: "launchpads",
  //       id: input.id,
  //     });

  //     if (!currentLaunchpad) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Launchpad not found",
  //       });
  //     }

  //     if (currentLaunchpad.status !== "pending") {
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: "Can only reject pending launchpads",
  //       });
  //     }

  //     const updatedLaunchpad = await ctx.db.update({
  //       collection: "launchpads",
  //       id: input.id,
  //       data: {
  //         status: "rejected",
  //         rejectionReason: input.reason,
  //       },
  //     });

  //     return updatedLaunchpad;
  //   }),

  // // Protected: Publish launchpad (tenant only, approved status only)
  // publish: protectedProcedure
  //   .input(publishLaunchpadSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const currentLaunchpad = await ctx.db.findByID({
  //       collection: "launchpads",
  //       id: input.id,
  //     });

  //     if (!currentLaunchpad) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Launchpad not found",
  //       });
  //     }

  //     // Check status
  //     if (currentLaunchpad.status !== "approved") {
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: "Can only publish approved launchpads",
  //       });
  //     }

  //     // Check ownership
  //     const tenantId = (ctx.session.user.tenants?.[0]?.tenant as Tenant).id;
  //     if ((currentLaunchpad.tenant as Tenant).id !== tenantId) {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "Access denied",
  //       });
  //     }

  //     const now = new Date();
  //     const endTime = new Date(
  //       now.getTime() + currentLaunchpad.duration * 60 * 60 * 1000
  //     );

  //     const updatedLaunchpad = await ctx.db.update({
  //       collection: "launchpads",
  //       id: input.id,
  //       data: {
  //         status: "live",
  //         startTime: now.toISOString(),
  //         endTime: endTime.toISOString(),
  //       },
  //     });

  //     return updatedLaunchpad;
  //   }),
});

// getMany: baseProcedure
//   .input(getLaunchpadsSchema)
//   .query(async ({ ctx, input }) => {
//     const headers = await getHeaders();
//     const session = await ctx.db.auth({ headers });
//     const where: Where = {};

//     // Filter by status
//     if (input.status) {
//       where.status = { equals: input.status };
//     } else {
//       // Default chỉ show live launchpads cho public
//       if (!session.user) {
//         where.status = { equals: "live" };
//       }
//     }

//     // Filter by tenant
//     if (input.tenantSlug) {
//       where["tenant.slug"] = { equals: input.tenantSlug };
//     }

//     // Filter by category
//     if (input.category) {
//       where["category.slug"] = { equals: input.category };
//     }

//     // If user is tenant, only show their launchpads (except for live status)
//     if (
//       session.user &&
//       !isSuperAdmin(session.user) &&
//       input.status !== "live"
//     ) {
//       const tenantId = session.user.tenants?.[0]?.tenant;
//       if (tenantId) {
//         where.tenant = { equals: tenantId };
//       }
//     }

//     const data = await ctx.db.find({
//       collection: "launchpads",
//       where,
//       page: input.cursor,
//       limit: input.limit,
//       depth: 2, // Populate tenant, category, image
//       sort:
//         input.sortBy === "priority"
//           ? ["-priority", "-createdAt"]
//           : `${input.sortOrder === "desc" ? "-" : ""}${input.sortBy}`,
//     });

//     return {
//       docs: data.docs,
//       hasNextPage: data.hasNextPage,
//       hasPrevPage: data.hasPrevPage,
//       nextPage: data.nextPage,
//       prevPage: data.prevPage,
//       totalDocs: data.totalDocs,
//       totalPages: data.totalPages,
//     };
//   }),

// getOne: baseProcedure
//   .input(getLaunchpadSchema)
//   .query(async ({ ctx, input }) => {
//     const headers = await getHeaders();
//     const session = await ctx.db.auth({ headers });

//     const launchpad = await ctx.db.findByID({
//       collection: "launchpads",
//       id: input.id,
//       depth: 2,
//     });

//     if (!launchpad) {
//       throw new TRPCError({
//         code: "NOT_FOUND",
//         message: "Launchpad not found",
//       });
//     }

//     // Check access
//     if (launchpad.status !== "live" && !session?.user) {
//       throw new TRPCError({
//         code: "FORBIDDEN",
//         message: "Launchpad not available",
//       });
//     }

//     // If user is tenant, check ownership
//     if (session?.user && !isSuperAdmin(session.user)) {
//       const tenantId = session.user.tenants?.[0]?.tenant;
//       if (launchpad.tenant !== tenantId && launchpad.status !== "live") {
//         throw new TRPCError({
//           code: "FORBIDDEN",
//           message: "Access denied",
//         });
//       }
//     }

//     // Check if expired
//     if (launchpad.endTime && new Date(launchpad.endTime) <= new Date()) {
//       throw new TRPCError({
//         code: "NOT_FOUND",
//         message: "Launchpad has ended",
//       });
//     }

//     return launchpad;
//   }),

import { stripe } from "@/lib/stripe";
import { User } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { cookies as getCookies, headers as getHeaders } from "next/headers";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordApiSchema,
} from "../schemas";
import { generateAuthCookie } from "../utils";

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await getHeaders();
    const session = await ctx.db.auth({ headers });
    return session;
  }),
  register: baseProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      // Check if user already exists
      const existingData = await ctx.db.find({
        collection: "users",
        limit: 1,
        where: {
          username: {
            equals: input.username,
          },
        },
      });
      const existingUser = existingData.docs[0];

      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already taken",
        });
      }

      const account = await stripe.accounts.create({});

      if (!account) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to create Stripe account",
        });
      }

      const tenant = await ctx.db.create({
        collection: "tenants",
        data: {
          name: input.username,
          slug: input.username,
          stripeAccountId: account.id,
        },
      });

      // register
      await ctx.db.create({
        collection: "users",
        data: {
          username: input.username,
          email: input.email,
          password: input.password,
          tenants: [
            {
              tenant: tenant.id,
            },
          ],
        },
      });

      // login
      const data = await ctx.db.login({
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
        },
      });

      if (!data.token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      await generateAuthCookie({
        prefix: ctx.db.config.cookiePrefix,
        value: data.token,
      });

      return data;
    }),
  login: baseProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const data = await ctx.db.login({
      collection: "users",
      data: {
        email: input.email,
        password: input.password,
      },
    });

    if (!data.token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    await generateAuthCookie({
      prefix: ctx.db.config.cookiePrefix,
      value: data.token,
    });

    return data;
  }),
  logout: baseProcedure.mutation(async ({ ctx }) => {
    const cookies = await getCookies();
    cookies.delete(`${ctx.db.config.cookiePrefix}-token`);
  }),
  forgotPassword: baseProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.db.forgotPassword({
          collection: "users",
          data: {
            email: input.email,
          },
        });

        return { success: true, message: "Reset email sent successfully" };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to send reset email",
        });
      }
    }),
  resetPassword: baseProcedure
    .input(resetPasswordApiSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.db.resetPassword({
          collection: "users",
          data: {
            token: input.token,
            password: input.password,
          },
          overrideAccess: false,
        });

        if (!result.token) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired token",
          });
        }

        await generateAuthCookie({
          prefix: ctx.db.config.cookiePrefix,
          value: result.token,
        });

        return { token: result.token, user: result.user as unknown as User };
      } catch (error) {
        console.log("error reset password: ", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to reset password",
        });
      }
    }),
});

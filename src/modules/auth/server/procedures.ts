import { deleteAuthCookie, setAuthCookie } from "@/lib/auth/cookie-manager";
import { stripe } from "@/lib/stripe";
import { User } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { headers as getHeaders } from "next/headers";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordApiSchema,
  verifyEmailSchema,
} from "../schemas";

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
      const user = await ctx.db.create({
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

          _verified: false, // Đặt thành false để yêu cầu verify
        },
      });

      return {
        user,
        message:
          "Registration successful! Please check your email to verify your account.",
        requiresVerification: true,
      };

      // login
      // const data = await ctx.db.login({
      //   collection: "users",
      //   data: {
      //     email: input.email,
      //     password: input.password,
      //   },
      // });

      // if (!data.token) {
      //   throw new TRPCError({
      //     code: "UNAUTHORIZED",
      //     message: "Invalid email or password",
      //   });
      // }

      // await setAuthCookie(`${ctx.db.config.cookiePrefix}-token`, data.token);

      // return data;
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

    await setAuthCookie(`${ctx.db.config.cookiePrefix}-token`, data.token);

    return data;
  }),

  logout: baseProcedure.mutation(async ({ ctx }) => {
    await deleteAuthCookie(`${ctx.db.config.cookiePrefix}-token`);
  }),

  forgotPassword: baseProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.forgotPassword({
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

        await setAuthCookie(
          `${ctx.db.config.cookiePrefix}-token`,
          result.token
        );

        return { token: result.token, user: result.user as unknown as User };
      } catch (error) {
        console.log("error reset password: ", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to reset password",
        });
      }
    }),

  verifyEmail: baseProcedure
    .input(verifyEmailSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const verifyResult = await ctx.db.verifyEmail({
          collection: "users",
          token: input.token,
        });

        if (!verifyResult) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired verification token",
          });
        }

        return {
          success: true,
          message: "Email verified successfully! Please login to continue.",
          requiresLogin: true,
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to verify email. Token may be invalid or expired.",
        });
      }
    }),

  resendVerification: baseProcedure
    .input(resendVerificationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Tìm user theo email
        const usersData = await ctx.db.find({
          collection: "users",
          where: {
            email: {
              equals: input.email,
            },
          },
          limit: 1,
        });

        const user = usersData.docs[0];

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        if (user._verified) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email is already verified",
          });
        }

        // Generate new verification token
        await ctx.db.forgotPassword({
          collection: "users",
          data: {
            email: input.email,
          },
          disableEmail: false,
          expiration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        });

        return {
          success: true,
          message: "Verification email sent successfully",
        };
      } catch (error) {
        console.error("❌ Resend verification error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to send verification email",
        });
      }
    }),
});

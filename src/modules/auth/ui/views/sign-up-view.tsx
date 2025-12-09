"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Poppins } from "next/font/google";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { registerSchema } from "../../schemas";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

const SignUpView = () => {
  const t = useTranslations();
  const trpc = useTRPC();

  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const registerMutation = useMutation(
    trpc.auth.register.mutationOptions({
      onSuccess: async (data) => {
        if (data.requiresVerification) {
          setShowVerificationMessage(true);
          toast.success(
            t(
              "Registration successful! Please check your email to verify your account"
            )
          );
        }
      },
      onError: (error) => {
        toast.error(t(error.message));
      },
    })
  );

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const username = form.watch("username");
  const usernameErrors = form.formState.errors.username;
  const showPreview = username && !usernameErrors;

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(values);
  };

  if (showVerificationMessage) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5">
        <div className="flex flex-col justify-center h-screen w-full md:col-span-2 overflow-auto bg-background">
          <div className="flex flex-col gap-8 p-4 lg:py-16 lg:px-20">
            <div className="text-center">
              <h1 className="text-3xl font-heading">{t("Check your email")}</h1>
              <p className="mt-4 text-muted-foreground">
                {t(
                  "We've sent a verification link to your email address Please click the link to verify your account"
                )}
              </p>
            </div>

            <Button asChild variant="neutral" className="w-full">
              <Link href="/sign-in">{t("Back to Sign In")}</Link>
            </Button>
          </div>
        </div>

        <div
          className="h-screen w-full md:col-span-3 hidden md:block"
          style={{
            backgroundImage: "url('/auth-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5">
      <div className="h-screen w-full lg:col-span-3 overflow-auto bg-background">
        <Form {...form}>
          <form
            className="flex flex-col gap-8 p-4 lg:p-16"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex items-center justify-between mb-8">
              <Link href="/">
                <span
                  className={cn("text-2xl font-semibold", poppins.className)}
                >
                  Nexstp
                </span>
              </Link>

              <Link
                prefetch
                href="/sign-in"
                className="text-base border-none underline"
              >
                {t("Sign in")}
              </Link>
            </div>

            <h1 className="text-4xl font-medium">
              {t("Join over 'Nexer' creators earning money on Nexstp")}
            </h1>

            <FormField
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">{t("Username")}</FormLabel>
                  <FormControl>
                    <Input {...field} className="shadow-shadow" />
                  </FormControl>
                  <FormDescription
                    className={cn("hidden", showPreview && "block")}
                  >
                    {t("Your store will be available at")}&nbsp;
                    <strong>{username}</strong>.nexstp.com
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">{t("Email")}</FormLabel>
                  <FormControl>
                    <Input {...field} className="shadow-shadow" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">{t("Password")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="shadow-shadow"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={registerMutation.isPending}
            >
              {t("Create account")}
            </Button>
          </form>
        </Form>
      </div>

      <div
        className="h-screen w-full lg:col-span-2 hidden lg:block"
        style={{
          backgroundImage: "url('/auth-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
};

export default SignUpView;

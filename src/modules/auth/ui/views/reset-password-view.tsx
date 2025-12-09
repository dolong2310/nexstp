"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import { useUserStore } from "@/modules/auth/store/use-user-store";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { resetPasswordFormSchema } from "../../schemas";

const ResetPasswordView = () => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const addUser = useUserStore((state) => state.add);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const resetPasswordMutation = useMutation(
    trpc.auth.resetPassword.mutationOptions({
      onSuccess: async (data) => {
        addUser(data.user);
        await queryClient.invalidateQueries(trpc.auth.session.queryFilter());
        toast.success(t("Password reset successfully!"));
        router.push("/");
      },
      onError: (error) => {
        toast.error(t(error.message));
      },
    })
  );

  const onSubmit = (values: z.infer<typeof resetPasswordFormSchema>) => {
    if (!token) {
      toast.error(t("Invalid or missing token"));
      return;
    }

    resetPasswordMutation.mutate({
      token,
      password: values.password,
    });
  };

  useEffect(() => {
    if (!token) {
      toast.error(t("Invalid reset link"));
      router.push("/sign-in");
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5">
      <div className="flex flex-col justify-center h-screen w-full md:col-span-2 overflow-auto bg-background">
        <Form {...form}>
          <form
            className="flex flex-col gap-8 p-4 lg:py-16 lg:px-20"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div>
              <h1 className="text-3xl font-heading">
                {t("Reset your password")}
              </h1>
              <p className="mt-4 text-muted-foreground">
                {t("Enter your new password below")}
              </p>
            </div>

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

            <FormField
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">
                    {t("Confirm Password")}
                  </FormLabel>
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
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending
                ? `${t("Resetting")}...`
                : t("Reset Password")}
            </Button>
          </form>
        </Form>
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
};

export default ResetPasswordView;

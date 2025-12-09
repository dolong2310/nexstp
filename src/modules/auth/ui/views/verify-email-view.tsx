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
import { Link, useRouter } from "@/i18n/navigation";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { resendVerificationSchema } from "../../schemas";

const VerifyEmailView = () => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const trpc = useTRPC();

  const form = useForm<z.infer<typeof resendVerificationSchema>>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const verifyEmailMutation = useMutation(
    trpc.auth.verifyEmail.mutationOptions({
      onSuccess: (data) => {
        setVerificationStatus("success");
        toast.success(t(data.message));

        if (data.requiresLogin) {
          setTimeout(() => {
            router.push("/sign-in?message=verification-success");
          }, 3000);
        }
      },
      onError: (error) => {
        setVerificationStatus("error");
        setErrorMessage(error.message);
        toast.error(t(error.message));
      },
    })
  );

  const resendMutation = useMutation(
    trpc.auth.resendVerification.mutationOptions({
      onSuccess: () => {
        toast.success(t("Verification email sent! Please check your inbox"));
      },
      onError: (error) => {
        toast.error(t(error.message));
      },
    })
  );

  const onSubmit = (values: z.infer<typeof resendVerificationSchema>) => {
    resendMutation.mutate({ email: values.email });
  };

  useEffect(() => {
    if (!token) {
      setVerificationStatus("error");
      setErrorMessage(t("Invalid verification link"));
      return;
    }

    // Auto verify
    verifyEmailMutation.mutate({ token });
  }, [token]);

  if (verificationStatus === "loading") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5">
        <div className="flex flex-col justify-center h-screen w-full md:col-span-2 overflow-auto bg-background">
          <div className="flex flex-col gap-8 p-4 lg:py-16 lg:px-20">
            <div className="flex justify-center">
              <LoaderIcon className="size-12 animate-spin" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-heading">
                {t("Verifying your email")}...
              </h1>
              <p className="mt-4 text-muted-foreground">
                {t("Please wait while we verify your email address")}
              </p>
            </div>
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

  if (verificationStatus === "success") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5">
        <div className="flex flex-col justify-center h-screen w-full md:col-span-2 overflow-auto bg-background">
          <div className="flex flex-col gap-8 p-4 lg:py-16 lg:px-20">
            <div className="text-center">
              <h1 className="text-3xl font-heading">{t("Email Verified!")}</h1>
              <p className="mt-4 text-muted-foreground">
                {t(
                  "Your email has been successfully verified You will be redirected to the sign in shortly"
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

  // Error state
  return (
    <div className="grid grid-cols-1 md:grid-cols-5">
      <div className="flex flex-col justify-center h-screen w-full md:col-span-2 overflow-auto bg-background">
        <div className="flex flex-col gap-8 p-4 lg:py-16 lg:px-20">
          <div className="text-center">
            <h1 className="text-3xl font-heading">
              {t("Verification Failed")}
            </h1>
            <p className="mt-4 text-muted-foreground">
              {errorMessage ||
                t("The verification link is invalid or has expired")}
            </p>
          </div>

          <Form {...form}>
            <form
              className="flex flex-col gap-8"
              onSubmit={form.handleSubmit(onSubmit)}
            >
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

              <div className="space-y-4">
                <Button
                  type="submit"
                  variant="default"
                  disabled={resendMutation.isPending}
                  className="w-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {resendMutation.isPending
                    ? `${t("Sending")}...`
                    : t("Resend Verification Email")}
                </Button>

                <Button asChild variant="neutral" className="w-full">
                  <Link href="/sign-in">{t("Back to Sign In")}</Link>
                </Button>
              </div>
            </form>
          </Form>
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
};

export default VerifyEmailView;

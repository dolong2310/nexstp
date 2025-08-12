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
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { forgotPasswordSchema } from "../../schemas";

const ForgotPasswordView = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const trpc = useTRPC();

  const forgotPasswordMutation = useMutation(
    trpc.auth.forgotPassword.mutationOptions({
      onSuccess: () => {
        setIsEmailSent(true);
        toast.success("Reset email sent! Check your inbox.");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
    forgotPasswordMutation.mutate(values);
  };

  if (isEmailSent) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5">
        <div className="flex flex-col justify-center h-screen w-full md:col-span-2 overflow-auto bg-background">
          <div className="flex flex-col gap-8 p-4 lg:py-16 lg:px-20">
            <div className="text-center">
              <h1 className="text-3xl font-heading">Check your email</h1>
              <p className="mt-4 text-muted-foreground">
                We've sent a password reset link to your email address.
              </p>
            </div>

            <Button asChild variant="neutral" className="w-full">
              <Link href="/sign-in">Back to Sign In</Link>
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
    <div className="grid grid-cols-1 md:grid-cols-5">
      <div className="flex flex-col justify-center h-screen w-full md:col-span-2 overflow-auto bg-background">
        <Form {...form}>
          <form
            className="flex flex-col gap-8 p-4 lg:py-16 lg:px-20"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div>
              <h1 className="text-3xl font-heading">Forgot your password?</h1>
              <p className="mt-4 text-muted-foreground">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
            </div>

            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Email</FormLabel>
                  <FormControl>
                    <Input {...field} className="shadow-shadow" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending
                ? "Sending..."
                : "Send Reset Link"}
            </Button>

            <div className="text-center">
              <Link href="/sign-in" className="text-base border-none underline">
                Back to Sign In
              </Link>
            </div>
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

export default ForgotPasswordView;

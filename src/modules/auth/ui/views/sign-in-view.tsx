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
import { cn } from "@/lib/utils";
import useCart from "@/modules/checkout/hooks/use-cart";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { loginSchema } from "../../schemas";
import { useUserStore } from "../../store/use-user-store";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

const SignInView = () => {
  const router = useRouter();
  const addUser = useUserStore((state) => state.add);
  const cart = useCart();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const loginMutation = useMutation(
    trpc.auth.login.mutationOptions({
      onSuccess: async (data) => {
        addUser(data.user);
        await queryClient.invalidateQueries(trpc.auth.session.queryFilter());
        cart.clearAllCarts();
        // Xoá tenant slug mà user vừa đăng nhập trong cart store (edge case)
        // const tenantSlugs = (data.user.tenants || []).map((tenant) => (tenant.tenant as Tenant).slug);
        // tenantSlugs.forEach((tenantSlug) => {
        //   cart.removeTenantFromCart(tenantSlug);
        // });
        router.push("/");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  // const login = useMutation({
  //   mutationFn: async (values: z.infer<typeof loginSchema>) => {
  //     const response = await fetch("/api/users/login", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(values),
  //     });

  //     if (!response.ok) {
  //       const error = await response.json();
  //       throw new Error(error.message || "Login failed");
  //     }

  //     return response.json();
  //   },
  //   onSuccess: () => {
  //     router.push("/");
  //   },
  //   onError: (error) => {
  //     toast.error(error.message);
  //   },
  // });

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

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
                href="/sign-up"
                className="text-base border-none underline"
              >
                Sign up
              </Link>
            </div>

            <h1 className="text-4xl font-medium">Welcome back to Nexstp.</h1>

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

            <FormField
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Password</FormLabel>
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
              disabled={loginMutation.isPending}
            >
              Login
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

export default SignInView;

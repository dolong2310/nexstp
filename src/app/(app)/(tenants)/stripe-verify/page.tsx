"use client";

import { toast } from "@/components/custom-toast";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useEffect } from "react";

const StripeVerifyPage = () => {
  const trpc = useTRPC();
  const { mutate: verify } = useMutation(
    trpc.checkout.verify.mutationOptions({
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      onError: (error) => {
        toast.error(`Failed to verify account: ${error.message}`);
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      },
    })
  );

  useEffect(() => {
    verify();
  }, [verify]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoaderIcon className="animate-spin text-muted-foreground" />
    </div>
  );
};

export default StripeVerifyPage;

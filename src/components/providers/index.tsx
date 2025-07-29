import { TRPCReactProvider } from "@/trpc/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import React from "react";
import { ThemeProvider } from "./theme-provider";

interface Props {
  children: React.ReactNode;
};

const Providers = ({ children }: Props) => {
  return (
    <NuqsAdapter>
      <TRPCReactProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </TRPCReactProvider>
    </NuqsAdapter>
  );
};

export default Providers;

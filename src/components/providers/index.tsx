import { TRPCReactProvider } from "@/trpc/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import React from "react";
import ThemeProvider from "./theme-provider";
import { NextIntlClientProvider } from "next-intl";

interface Props {
  children: React.ReactNode;
  locale: string;
}

const Providers = ({ children, locale }: Props) => {
  return (
    <NextIntlClientProvider locale={locale}>
      <NuqsAdapter>
        <TRPCReactProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </TRPCReactProvider>
      </NuqsAdapter>
    </NextIntlClientProvider>
  );
};

export default Providers;

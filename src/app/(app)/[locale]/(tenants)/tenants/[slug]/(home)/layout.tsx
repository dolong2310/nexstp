import Navbar from "@/modules/home/ui/components/navbar";
import Footer from "@/modules/tenants/ui/components/footer";
import { Metadata } from "next";
import React from "react";
import { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale: locale as Locale,
  });

  return {
    title: {
      template: `%s | ${t("Product")}`,
      default: t("Product"),
    },
    description: t("Browse amazing products from our store"),
  };
}

const TenantsLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen flex flex-col bg-secondary-background bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px]">
      <Navbar />
      <div className="flex-1">
        <div className="max-w-screen-xl mx-auto">{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default TenantsLayout;

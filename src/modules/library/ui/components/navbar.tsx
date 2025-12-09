"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const LibraryNavbar = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const isProductView = segments.length > 1;

  if (isProductView) {
    return (
      <nav className="w-full p-4 border-b-2 bg-secondary-background">
        <Link prefetch href="/library" className="flex items-center gap-2">
          <ArrowLeftIcon className="size-4" />
          <span className="text font-medium">{t("Back to Library")}</span>
        </Link>
      </nav>
    );
  }

  return (
    <div>
      <nav className="w-full p-4 border-b-2 bg-secondary-background">
        <Link prefetch href="/" className="flex items-center gap-2">
          <ArrowLeftIcon className="size-4" />
          <span className="text font-medium">{t("Continue shopping")}</span>
        </Link>
      </nav>

      <header className="py-8 border-b-2 bg-background">
        <div className="flex flex-col gap-y-4 max-w-screen-xl mx-auto px-4 lg:px-12">
          <h1 className="text-4xl font-medium">{t("Library")}</h1>
          <p className="font-medium">{t("Your purchased and reviews")}</p>
        </div>
      </header>
    </div>
  );
};

export default LibraryNavbar;

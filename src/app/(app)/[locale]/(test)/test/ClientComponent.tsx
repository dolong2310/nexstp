"use client";

import { Button } from "@/components/ui/button";
import { Locale, useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import Image from "next/image";

const LocaleConfig: Record<Locale, { label: string; value: string }> = {
  en: {
    label: "English",
    value: "en",
  },
  vi: {
    label: "Vietnamese",
    value: "vi",
  },
};

const ClientComponent = () => {
  const t = useTranslations();

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale();

  const handleChangeLocale = () => {
    const nextLocale = locale === "en" ? "vi" : "en";
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale: nextLocale }
      );
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("test")}</h1>
      <Button size="icon" disabled={isPending} onClick={handleChangeLocale}>
        <Image
          // className="size-5"
          src={`/flags/${locale}.svg`}
          alt={LocaleConfig[locale as Locale]?.label ?? ""}
          width={20}
          height={20}
        />
      </Button>
    </div>
  );
};

export default ClientComponent;

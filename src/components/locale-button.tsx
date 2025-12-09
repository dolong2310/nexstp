"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Locale, useLocale } from "next-intl";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTransition } from "react";

const LOCALE_CONFIG: Record<
  Locale,
  { label: string; value: Locale; icon: React.ReactNode }
> = {
  en: {
    label: "English",
    value: "en",
    icon: (
      <Image
        src="/flags/en.svg"
        alt="English"
        width={20}
        height={20}
        className={cn(
          "size-5"
          // "size-5 scale-100 rotate-0 transition-all",
          // locale === "en" && "scale-0 -rotate-90"
        )}
      />
    ),
  },
  vi: {
    label: "Tiếng Việt",
    value: "vi",
    icon: (
      <Image
        src="/flags/vi.svg"
        alt="Vietnamese"
        width={20}
        height={20}
        className={cn(
          "size-5"
          // "size-5 absolute scale-0 rotate-90 transition-all",
          // locale === "vi" && "scale-100 rotate-0"
        )}
      />
    ),
  },
};

const LocaleButton = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale();

  const handleChangeLocale = () => {
    const nextLocale = (locale === "en" ? "vi" : "en") as Locale;
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

  const localeItem = LOCALE_CONFIG[locale as Locale];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="neutral"
          size="icon"
          disabled={isPending}
          onClick={handleChangeLocale}
        >
          {localeItem?.icon}
          <span className="sr-only">{localeItem?.label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{localeItem?.label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default LocaleButton;

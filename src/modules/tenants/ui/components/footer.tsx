import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

const Footer = () => {
  const t = useTranslations();
  return (
    <footer className="border-t-4 font-medium bg-background">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-12 py-6 flex items-center justify-between gap-2 h-full">
        <div className="flex items-center gap-2">
          <p>{t("Powered by")}</p>
          <Link href={process.env.NEXT_PUBLIC_APP_URL!}>
            <span className={cn("text-2xl font-semibold", poppins.className)}>
              Nexstp
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

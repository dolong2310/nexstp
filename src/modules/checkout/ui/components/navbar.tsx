import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { generateTenantPathname } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Props {
  slug: string;
}

const Navbar = ({ slug }: Props) => {
  const t = useTranslations();
  return (
    <nav className="h-18 border-b-4 font-medium bg-secondary-background">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-12 flex items-center justify-between h-full">
        <p className="text-xl">{t("Checkout")}</p>
        <Button asChild variant="neutral">
          <Link href={generateTenantPathname(slug)}>{t("Continue Shopping")}</Link>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;

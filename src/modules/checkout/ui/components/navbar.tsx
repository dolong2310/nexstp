import { Button } from "@/components/ui/button";
import { generateTenantUrl } from "@/lib/utils";
import Link from "next/link";

interface Props {
  slug: string;
};

const Navbar = ({ slug }: Props) => {
  return (
    <nav className="h-18 border-b-4 font-medium bg-secondary-background">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-12 flex items-center justify-between h-full">
        <p className="text-xl">Checkout</p>
        <Button asChild variant="neutral">
          <Link href={generateTenantUrl(slug)}>Continue Shopping</Link>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;

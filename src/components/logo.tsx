import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Link from "next/link";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

const Logo = () => {
  return (
    <Link href="/" className="flex items-center">
      <span
        className={cn(
          poppins.className,
          "text-2xl size-8 rounded-base flex bg-main text-main-foreground border-2 border-black items-center justify-center font-heading"
        )}
      >
        N
      </span>
    </Link>
  );
};

export default Logo;

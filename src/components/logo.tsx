import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Link from "next/link";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

interface Props {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, size = "md" }: Props) => {
  const sizeClasses = {
    sm: "size-6 text-xl",
    md: "size-8 text-2xl",
    lg: "size-10 text-3xl",
  };

  return (
    <Link href="/" className={cn("flex items-center justify-center", className)}>
      <span
        className={cn(
          poppins.className,
          "rounded-base flex bg-main text-main-foreground border-2 border-black items-center justify-center font-heading",
          sizeClasses[size]
        )}
      >
        N
      </span>
    </Link>
  );
};

export default Logo;

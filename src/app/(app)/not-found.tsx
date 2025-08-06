import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#151515] text-white flex flex-col items-center justify-center text-center">
      <Link href="/" className="pl-4 lg:pl-6 flex items-center">
        <h1
          className={cn(
            "text-2xl md:text-5xl font-semibold",
            poppins.className
          )}
        >
          Nexstp | Not Found
        </h1>
      </Link>
      <p className="mt-4 text-sm md:text-lg">
        The page you are looking for does not exist or has been moved. <br />{" "}
        Please check the URL or return to the{" "}
        <Link href="/" className="text-feature hover:underline">
          homepage
        </Link>
        .
      </p>
    </div>
  );
}

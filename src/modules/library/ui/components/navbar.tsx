"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LibraryNavbar = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const isProductView = segments.length > 1;

  if (isProductView) {
    return (
      <nav className="w-full p-4 border-b-2 bg-secondary-background">
        <Link prefetch href="/library" className="flex items-center gap-2">
          <ArrowLeftIcon className="size-4" />
          <span className="text font-medium">Back to Library</span>
        </Link>
      </nav>
    );
  }

  return (
    <div>
      <nav className="w-full p-4 border-b-2 bg-secondary-background">
        <Link prefetch href="/" className="flex items-center gap-2">
          <ArrowLeftIcon className="size-4" />
          <span className="text font-medium">Continue shopping</span>
        </Link>
      </nav>

      <header className="py-8 border-b-2 bg-background">
        <div className="flex flex-col gap-y-4 max-w-screen-xl mx-auto px-4 lg:px-12">
          <h1 className="text-4xl font-medium">Library</h1>
          <p className="font-medium">Your purchased and reviews</p>
        </div>
      </header>
    </div>
  );
};

export default LibraryNavbar;

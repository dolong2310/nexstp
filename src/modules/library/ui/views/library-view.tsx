import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import ProductList, { ProductListSkeleton } from "../components/product-list";

const LibraryView = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="w-full p-4 border-b bg-third">
        <Link prefetch href="/" className="flex items-center gap-2">
          <ArrowLeftIcon className="size-4" />
          <span className="text font-medium">Continue shopping</span>
        </Link>
      </nav>

      <header className="py-8 border-b bg-third">
        <div className="flex flex-col gap-y-4 max-w-screen-xl mx-auto px-4 lg:px-12">
          <h1 className="text-4xl font-medium">Library</h1>
          <p className="font-medium">Your purchased and reviews</p>
        </div>
      </header>

      <section className="max-w-screen-xl mx-auto px-4 lg:px-12 py-10">
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList />
        </Suspense>
      </section>
    </div>
  );
};

export default LibraryView;

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import ProductList, { ProductListSkeleton } from "../components/product-list";

const LibraryView = () => {
  return (
    <div className="min-h-screen bg-secondary-background bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px]">
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

      <section className="max-w-screen-xl mx-auto px-4 lg:px-12 py-6 lg:py-10">
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList />
        </Suspense>
      </section>
    </div>
  );
};

export default LibraryView;

import { metadataOpenGraph } from "@/app/(app)/shared-metadata";
import { prefetchApi } from "@/lib/prefetch-helpers";
import ProductView, {
  ProductViewSkeleton,
} from "@/modules/library/ui/views/product-view";
import { Media } from "@/payload-types";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Metadata } from "next";
import { Suspense } from "react";

interface Props {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;

  const { productData: product } = await prefetchApi.libraryProduct(productId);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found",
    };
  }

  const image = (product.image as Media)?.url;
  const description =
    product.description || `Browse ${product?.name} in the library`;

  return {
    title: `${product.name}`,
    description: description,
    openGraph: {
      ...metadataOpenGraph,
      title: product.name,
      description: description,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: description,
      images: image ? [image] : [],
    },
  };
}

const ProductDetailPage = async ({ params }: Props) => {
  const { productId } = await params;

  const { queryClient } = await prefetchApi.libraryProduct(productId);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductViewSkeleton />}>
        <ProductView productId={productId} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default ProductDetailPage;

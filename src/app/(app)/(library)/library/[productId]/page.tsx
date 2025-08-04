import { metadataOpenGraph } from "@/app/(app)/shared-metadata";
import { getProductForMetadata } from "@/lib/server-actions/products";
import ProductView, {
  ProductViewSkeleton,
} from "@/modules/library/ui/views/product-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Metadata } from "next";
import { Suspense } from "react";

interface Props {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;

  const product = await getProductForMetadata(productId);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found",
    };
  }

  const description =
    product.description || `Browse ${product.name} in the library`;

  return {
    title: `${product.name}`,
    description: description,
    openGraph: {
      ...metadataOpenGraph,
      title: product.name,
      description: description,
      images: product.image?.url
        ? [
            {
              url: product.image.url,
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
      images: product.image?.url ? [product.image.url] : [],
    },
  };
}

const ProductDetailPage = async ({ params }: Props) => {
  const { productId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.library.getOne.queryOptions({
      productId,
    })
  );
  void queryClient.prefetchQuery(
    trpc.reviews.getOne.queryOptions({
      productId,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductViewSkeleton />}>
        <ProductView productId={productId} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default ProductDetailPage;

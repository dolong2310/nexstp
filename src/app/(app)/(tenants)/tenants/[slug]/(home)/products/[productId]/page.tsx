import { metadataOpenGraph } from "@/app/(app)/shared-metadata";
import { prefetchApi } from "@/lib/prefetch-helpers";
import ProductView, {
  ProductViewSkeleton,
} from "@/modules/products/ui/views/product-view";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { Suspense } from "react";

interface Props {
  params: Promise<{
    slug: string;
    productId: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;

  const { product } = await prefetchApi.product(productId);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found",
    };
  }

  const image = product.image?.url;
  const description =
    product.description || `Browse ${product.name} in the library`;

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
  const { slug, productId: id } = await params;

  const { queryClient } = await prefetchApi.product(id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductViewSkeleton />}>
        <ProductView productId={id} tenantSlug={slug} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default ProductDetailPage;

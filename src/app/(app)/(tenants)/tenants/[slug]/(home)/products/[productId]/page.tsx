import { metadataOpenGraph } from "@/app/(app)/shared-metadata";
import ProductView, {
  ProductViewSkeleton,
} from "@/modules/products/ui/views/product-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface Props {
  params: Promise<{
    slug: string;
    productId: string;
  }>;
}

const prefetchProductData = async (id: string) => {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery(trpc.products.getOne.queryOptions({ id }));

    const product = queryClient.getQueryData(
      trpc.products.getOne.queryOptions({ id }).queryKey
    );

    if (!product) {
      throw new Error("Product not found");
    }

    return { queryClient, product };
  } catch (error) {
    redirect("/");
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;

  const { product } = await prefetchProductData(productId);

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

  const { queryClient } = await prefetchProductData(id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductViewSkeleton />}>
        <ProductView productId={id} tenantSlug={slug} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default ProductDetailPage;

import { metadataOpenGraph } from "@/app/(app)/shared-metadata";
import ProductView, {
  ProductViewSkeleton,
} from "@/modules/library/ui/views/product-view";
import { Media } from "@/payload-types";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface Props {
  params: Promise<{ productId: string }>;
}

const prefetchProductData = async (id: string) => {
  const queryClient = getQueryClient();
  let productData;

  try {
    try {
      await Promise.all([
        queryClient.prefetchQuery(
          trpc.library.getOne.queryOptions({ productId: id })
        ),
        queryClient.prefetchQuery(
          trpc.reviews.getOne.queryOptions({ productId: id })
        ),
      ]);

      const product = queryClient.getQueryData(
        trpc.library.getOne.queryOptions({ productId: id }).queryKey
      );

      if (!product) {
        throw new Error("Product not found");
      }
      productData = product;
    } catch (error) {
      console.error("Error fetching product:", error);
      try {
        await queryClient.prefetchQuery(
          trpc.launchpads.getOne.queryOptions({ id })
        );

        const launchpad = queryClient.getQueryData(
          trpc.launchpads.getOne.queryOptions({ id }).queryKey
        );

        if (!launchpad) {
          throw new Error("Launchpad not found");
        }

        productData = {
          id: launchpad.id,
          name: launchpad.title,
          description: launchpad.description,
          image: launchpad.image,
        };
      } catch (launchpadError) {
        console.error("Error fetching launchpad:", launchpadError);
      }
    }

    return { queryClient, productData };
  } catch (error) {
    redirect("/library");
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;

  const { productData: product } = await prefetchProductData(productId);
  console.log("product: ", product);

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

  const { queryClient } = await prefetchProductData(productId);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductViewSkeleton />}>
        <ProductView productId={productId} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default ProductDetailPage;

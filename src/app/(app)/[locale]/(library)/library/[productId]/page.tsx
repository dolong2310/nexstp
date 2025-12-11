import { metadataOpenGraph } from "@/app/(app)/[locale]/shared-metadata";
import { routing } from "@/i18n/routing";
import { prefetchApi } from "@/lib/prefetch-helpers";
import ProductView, {
  ProductViewSkeleton,
} from "@/modules/library/ui/views/product-view";
import { Media } from "@/payload-types";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Metadata } from "next";
import { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

// Force dynamic rendering to support useParams() in client components
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ productId: string; locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId, locale } = await params;

  const [{ productData: product }, t] = await Promise.all([
    prefetchApi.libraryProduct(productId),
    getTranslations({
      locale: locale as Locale,
    }),
  ]);

  if (!product) {
    return {
      title: t("Product Not Found"),
      description: t("The requested product could not be found"),
    };
  }

  const image = (product.image as Media)?.url;
  const description =
    product.description || t("Browse {product} in the library", {
      product: product?.name,
    });

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

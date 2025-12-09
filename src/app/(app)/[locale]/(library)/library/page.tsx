import { DEFAULT_LIMIT } from "@/constants";
import ProductList, {
  ProductListSkeleton,
} from "@/modules/library/ui/components/product-list";
import { getQueryClient, trpc } from "@/trpc/server";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  metadataOpenGraph,
  metadataOpenGraphDefaultImage,
} from "../../shared-metadata";
import { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic"; // Force dynamic rendering for this page

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale: locale as Locale,
  });

  return {
    title: t("Library"),
    description: t(
      "Browse your purchased products and access your digital library"
    ),
    openGraph: {
      ...metadataOpenGraph,
      title: t("Library"),
      description: t(
        "Browse your purchased products and access your digital library"
      ),
      images: [
        {
          ...metadataOpenGraphDefaultImage,
          alt: t("Your Library"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("Library"),
      description: t(
        "Browse your purchased products and access your digital library"
      ),
    },
    robots: {
      index: false, // Private user content
      follow: false,
    },
  };
}

const handleSessionUser = async (queryClient: QueryClient) => {
  try {
    const session = await queryClient.fetchQuery(
      trpc.auth.session.queryOptions()
    );
    if (!session?.user) redirect("/sign-in");
  } catch (error) {
    console.error("Error fetching conversations:", error);
    redirect("/");
  }
};

const LibraryPage = async () => {
  const queryClient = getQueryClient();

  await handleSessionUser(queryClient);

  void queryClient.prefetchInfiniteQuery(
    trpc.library.getMany.infiniteQueryOptions({
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList />
      </Suspense>
    </HydrationBoundary>
  );
};

export default LibraryPage;

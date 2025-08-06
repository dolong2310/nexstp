import {
  metadataOpenGraph,
  metadataOpenGraphDefaultImage,
} from "@/app/(app)/shared-metadata";
import { prefetchApi } from "@/lib/prefetch-helpers";
import CheckoutView from "@/modules/checkout/ui/views/checkout-view";
import { trpc } from "@/trpc/server";
import { QueryClient } from "@tanstack/react-query";
import { Metadata } from "next";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { tenant } = await prefetchApi.tenant(slug);

  if (!tenant) {
    return {
      title: "Checkout - Store Not Found",
      description: "The requested store could not be found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `Checkout - ${tenant.name}`;
  const description = `Complete your purchase at ${tenant.name}. Secure checkout with multiple payment options.`;

  return {
    title,
    description,
    openGraph: {
      ...metadataOpenGraph,
      title,
      description,
      images: [
        {
          ...metadataOpenGraphDefaultImage,
          alt: `Checkout at ${tenant.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: false, // Không index checkout pages
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

const CheckoutPage = async ({ params }: Props) => {
  const { slug } = await params;

  const { queryClient } = await prefetchApi.tenant(slug);
  // void queryClient.prefetchQuery(
  //   trpc.checkout.getProducts.queryOptions({
  //     ids: [slug], // TODO: query by product IDs instead of slug
  //   })
  // );

  await handleSessionUser(queryClient);

  return <CheckoutView tenantSlug={slug} />;
};

export default CheckoutPage;

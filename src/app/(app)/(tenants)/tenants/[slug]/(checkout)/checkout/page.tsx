import {
  metadataOpenGraph,
  metadataOpenGraphDefaultImage,
} from "@/app/(app)/shared-metadata";
import CheckoutView from "@/modules/checkout/ui/views/checkout-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { QueryClient } from "@tanstack/react-query";
import { Metadata } from "next";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

const prefetchTenantData = async (slug: string) => {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery(trpc.tenants.getOne.queryOptions({ slug }));

    const tenant = queryClient.getQueryData(
      trpc.tenants.getOne.queryOptions({ slug }).queryKey
    );

    return { queryClient, tenant };
  } catch (error) {
    redirect("/");
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { tenant } = await prefetchTenantData(slug);

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

  const { queryClient } = await prefetchTenantData(slug);
  // void queryClient.prefetchQuery(
  //   trpc.checkout.getProducts.queryOptions({
  //     ids: [slug], // TODO: query by product IDs instead of slug
  //   })
  // );

  await handleSessionUser(queryClient);

  return <CheckoutView tenantSlug={slug} />;
};

export default CheckoutPage;

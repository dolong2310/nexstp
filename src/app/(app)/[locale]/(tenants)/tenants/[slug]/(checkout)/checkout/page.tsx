import {
  metadataOpenGraph,
  metadataOpenGraphDefaultImage,
} from "@/app/(app)/[locale]/shared-metadata";
import { routing } from "@/i18n/routing";
import { prefetchApi } from "@/lib/prefetch-helpers";
import CheckoutView from "@/modules/checkout/ui/views/checkout-view";
import { trpc } from "@/trpc/server";
import { QueryClient } from "@tanstack/react-query";
import { Metadata } from "next";
import { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

// Force dynamic rendering to support useParams() in client components
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;

  const [{ tenant }, t] = await Promise.all([
    prefetchApi.tenant(slug),
    getTranslations({
      locale: locale as Locale,
    }),
  ]);

  if (!tenant) {
    return {
      title: t("Checkout - Store Not Found"),
      description: t("The requested store could not be found"),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${t("Checkout")} - ${tenant.name}`;
  const description = t("Complete your purchase at {tenantName} Secure checkout with multiple payment options", {
    tenantName: tenant.name,
  });

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
          alt: `${t("Checkout at")} ${tenant.name}`,
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

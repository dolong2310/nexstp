import {
  metadataOpenGraph,
  metadataOpenGraphDefaultImage,
} from "@/app/(app)/shared-metadata";
import { getTenantForMetadata } from "@/lib/server-actions/tenants";
import CheckoutView from "@/modules/checkout/ui/views/checkout-view";
import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const tenant = await getTenantForMetadata(slug);

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

const CheckoutPage = async ({ params }: Props) => {
  const { slug } = await params;

  return <CheckoutView tenantSlug={slug} />;
};

export default CheckoutPage;

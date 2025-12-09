import { routing } from "@/i18n/routing";
import { prefetchApi } from "@/lib/prefetch-helpers";
import LaunchpadDetailView, {
  LaunchpadDetailViewSkeleton,
} from "@/modules/launchpads/ui/views/launchpad-detail-view";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;

  try {
    const [{ launchpad }, t] = await Promise.all([
      prefetchApi.launchpad(id),
      getTranslations({
        locale: locale as Locale,
      }),
    ]);

    if (!launchpad || launchpad.status !== "live") {
      return {
        title: t("Launchpad Not Found"),
        description: t(
          "The requested launchpad could not be found or is not available"
        ),
      };
    }

    return {
      title: `${launchpad.title} - ${t("Launchpad")}`,
      description:
        launchpad.description ||
        t("Get {launchpadTitle} at launch price", {
          launchpadTitle: launchpad.title,
        }),
      openGraph: {
        title: launchpad.title,
        description: launchpad.description || "",
        images: launchpad.image
          ? [
              {
                url:
                  typeof launchpad.image === "string"
                    ? launchpad.image
                    : launchpad.image.url || "",
                alt: launchpad.title,
              },
            ]
          : [],
      },
    };
  } catch (error) {
    return {
      title: "Launchpad Not Found",
      description: "The requested launchpad could not be found.",
    };
  }
}

const LaunchpadDetailPage = async ({ params }: Props) => {
  const { id } = await params;

  const { queryClient } = await prefetchApi.launchpad(id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<LaunchpadDetailViewSkeleton />}>
        <LaunchpadDetailView launchpadId={id} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default LaunchpadDetailPage;

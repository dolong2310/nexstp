import { prefetchApi } from "@/lib/prefetch-helpers";
import LaunchpadDetailView, {
  LaunchpadDetailViewSkeleton,
} from "@/modules/launchpads/ui/views/launchpad-detail-view";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { Suspense } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const { launchpad } = await prefetchApi.launchpad(id);

    if (!launchpad || launchpad.status !== "live") {
      return {
        title: "Launchpad Not Found",
        description:
          "The requested launchpad could not be found or is not available.",
      };
    }

    return {
      title: `${launchpad.title} - Launchpad`,
      description:
        launchpad.description || `Get ${launchpad.title} at launch price`,
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

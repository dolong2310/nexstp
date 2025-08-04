import LaunchpadDetailView, {
  LaunchpadDetailViewSkeleton,
} from "@/modules/launchpads/ui/views/launchpad-detail-view";
import config from "@/payload.config";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import { Suspense } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const payload = await getPayload({ config });
    const launchpad = await payload.findByID({
      collection: "launchpads",
      id,
      depth: 2,
    });

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

  const queryClient = getQueryClient();
  try {
    await queryClient.fetchQuery(trpc.launchpads.getOne.queryOptions({ id }));
  } catch (error) {
    redirect("/launchpads");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<LaunchpadDetailViewSkeleton />}>
        <LaunchpadDetailView launchpadId={id} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default LaunchpadDetailPage;

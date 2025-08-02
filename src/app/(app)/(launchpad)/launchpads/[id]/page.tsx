import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@/payload.config";
import { LaunchpadDetailView } from "@/modules/launchpads/ui/launchpad-detail-view";

interface Props {
  params: Promise<{
    id: string;
  }>;
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

export default async function LaunchpadDetailPage({ params }: Props) {
  const { id } = await params;
  return <LaunchpadDetailView launchpadId={id} />;
}

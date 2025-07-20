import { DEFAULT_LIMIT } from "@/constants";
import LibraryView from "@/modules/library/ui/views/library-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Metadata } from "next";
import { metadataOpenGraph } from "../../shared-metadata";

export const dynamic = "force-dynamic"; // Force dynamic rendering for this page

export const metadata: Metadata = {
  title: "Library",
  description:
    "Browse your purchased products and access your digital library.",
  openGraph: {
    ...metadataOpenGraph,
    title: "Library",
    description:
      "Browse your purchased products and access your digital library.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Library",
    description:
      "Browse your purchased products and access your digital library.",
  },
  robots: {
    index: false, // Private user content
    follow: false,
  },
};

const LibraryPage = () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.library.getMany.infiniteQueryOptions({
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LibraryView />
    </HydrationBoundary>
  );
};

export default LibraryPage;

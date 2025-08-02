"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Search, Timer, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  LaunchpadCard,
  LaunchpadCardSkeleton,
} from "./components/launchpad-card";

export const LaunchpadsView = () => {
  const trpc = useTRPC();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"priority" | "newest" | "ending-soon">(
    "priority"
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery(
    trpc.launchpads.getMany.infiniteQueryOptions(
      {
        limit: 10,
        search: searchQuery || undefined,
        sort: sortBy,
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.docs.length > 0 ? lastPage.nextPage : undefined;
        },
      }
    )
  );

  const launchpads = data?.pages.flatMap((page) => page.docs) ?? [];
  console.log({ launchpads, data });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">🚀 Launchpads</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get exclusive early access to amazing products at special launch
          prices. Limited time offers before they return to regular pricing.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search launchpads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        {/* Sort Options */}
        <div className="flex justify-center gap-2 flex-wrap">
          <Button
            variant={sortBy === "priority" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSortChange("priority")}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Featured
          </Button>
          <Button
            variant={sortBy === "newest" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSortChange("newest")}
          >
            Newest
          </Button>
          <Button
            variant={sortBy === "ending-soon" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSortChange("ending-soon")}
          >
            <Timer className="w-4 h-4 mr-1" />
            Ending Soon
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      {!isLoading && (
        <div className="text-center mb-8">
          <Badge variant="secondary" className="text-sm">
            {data?.pages[0]?.totalDocs || 0} active launchpads
          </Badge>
        </div>
      )}

      {/* Launchpads Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <LaunchpadCardSkeleton key={i} />
          ))}
        </div>
      ) : launchpads.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No launchpads found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search"
              : "Check back later for new launches"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {launchpads.map((launchpad) => (
              <LaunchpadCard key={launchpad.id} launchpad={launchpad} />
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="text-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                size="lg"
              >
                {isFetchingNextPage ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DEFAULT_LIMIT } from "@/constants";
import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  values?: string[] | null;
  onChange: (values: string[]) => void;
}

const TagsFilter = ({ values = [], onChange }: Props) => {
  const t = useTranslations();
  const trpc = useTRPC();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      trpc.tags.getMany.infiniteQueryOptions(
        {
          limit: DEFAULT_LIMIT,
        },
        {
          getNextPageParam: (lastPage) => {
            return lastPage.docs.length > 0 ? lastPage.nextPage : undefined;
          },
        }
      )
    );

  const onClick = (tag: string) => {
    if (values?.includes(tag)) {
      onChange(values?.filter((t) => t !== tag) || []);
    } else {
      onChange([...(values || []), tag]);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <LoaderIcon className="size-4 animate-spin" />
        </div>
      );
    }

    // If no tags are available, show a message
    if (data?.pages?.[0]?.docs.length === 0) {
      return (
        <p className="text-center text-foreground">{t("No tags available")}</p>
      );
    }

    return data?.pages.map((page) => {
      return page.docs.map((tag) => {
        return (
          <div
            key={tag.id}
            className="flex items-center justify-between gap-2 cursor-pointer"
            onClick={() => onClick(tag.name)}
          >
            <Label
              htmlFor={tag.id}
              className="truncate overflow-hidden cursor-pointer"
            >
              {tag.name}
            </Label>
            <Checkbox
              id={tag.id}
              checked={values?.includes(tag.name)}
              onCheckedChange={() => onClick(tag.name)}
            />
          </div>
        );
      });
    });
  };

  return (
    <div className="flex flex-col gap-y-4 gap-2">
      {renderContent()}

      {hasNextPage && (
        <button
          disabled={isFetchingNextPage}
          className="underline font-medium justify-start text-start disabled:opacity-50 cursor-pointer"
          onClick={() => fetchNextPage()}
        >
          {t("Load more")}...
        </button>
      )}
    </div>
  );
};

export default TagsFilter;

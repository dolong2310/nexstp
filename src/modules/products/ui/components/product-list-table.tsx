"use client";

import InfiniteScroll from "@/components/infinite-scroll";
import Media from "@/components/media";
import { Button } from "@/components/ui/button";
import { TABLE_LIMIT } from "@/constants";
import { cn, formatCurrency, generateTenantUrl } from "@/lib/utils";
import { Media as MediaType, Tenant } from "@/payload-types";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import isEqual from "lodash-es/isEqual";
import { LoaderIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef } from "react";
import { ProductsGetManyOutput } from "../../types";

type Product = {
  id: string;
  product: { name: string; image?: string | null };
  tenant: Tenant & {
    image: MediaType | null;
  };
  reviews: {
    reviewRating: number;
    reviewCount: number;
  };
  price: number;
};

type Column = {
  key: string;
  header: string;
  width: string;
  minWidth?: string;
  hide?: boolean;
  align?: string;
  render: (value?: any, record?: any) => React.ReactNode | null;
};

interface Props {
  productData: ProductsGetManyOutput;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

const ProductListTable = ({
  productData,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: Props) => {
  const dataTableRef = useRef<Product[]>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const dataTable = useMemo<Product[]>(() => {
    const dataTable = productData.map((p) => {
      return {
        id: p.id,
        product: {
          name: p.name,
          image: p.image?.url || "/placeholder-bg.jpg",
        },
        tenant: p.tenant,
        price: p.price,
        reviews: {
          reviewRating: p.reviewRating,
          reviewCount: p.reviewCount,
        },
      };
    });

    if (!isEqual(dataTableRef.current, dataTable)) {
      dataTableRef.current = dataTable;
    }
    return dataTableRef.current ?? [];
  }, [productData]);

  const columns: Column[] = [
    {
      key: "product",
      header: "Product",
      width: "40%",
      minWidth: "300px",
      render: (value) => {
        const image = value.image || "/placeholder-bg.jpg";
        const name = value.name;
        const authorUsername = value.tenantSlug;
        const id = value.id;

        return (
          <Link
            href={`${generateTenantUrl(authorUsername)}/products/${id}`}
            className="flex items-center gap-2 w-full"
          >
            <Media
              src={image}
              alt={name}
              fill
              containerClassName="size-10"
              className="rounded-md object-cover"
            />
            <p className="font-medium truncate overflow-hidden">{name}</p>
          </Link>
        );
      },
    },
    {
      key: "tenant",
      header: "Tenant",
      width: "30%",
      minWidth: "200px",
      render: (value) => {
        const authorUsername = value.slug;
        const authorImageUrl = value.image?.url;

        return (
          <Link
            href={generateTenantUrl(authorUsername)}
            className="flex items-center gap-2 cursor-pointer w-full"
          >
            {authorImageUrl && (
              <Media
                src={authorImageUrl}
                alt={authorUsername}
                fill
                sizeFallbackIcon="sm"
                containerClassName="size-6"
                className="rounded-full border"
              />
            )}
            <p className="text-sm underline font-medium truncate overflow-hidden">
              {authorUsername}
            </p>
          </Link>
        );
      },
    },
    {
      key: "price",
      header: "Price",
      width: "15%",
      minWidth: "100px",
      render: (value) => {
        return (
          <div className="relative px-2 py-1 border bg-feature w-fit overflow-hidden">
            <p className="text-sm font-medium truncate">
              {formatCurrency(value)}
            </p>
          </div>
        );
      },
    },
    {
      key: "reviews",
      header: "Reviews",
      width: "15%",
      minWidth: "100px",
      render: (value) => {
        const reviewCount = value.reviewCount;
        const reviewRating = value.reviewRating;

        return (
          <div className="flex items-center gap-1 overflow-hidden">
            <StarIcon className="size-3.5 fill-black shrink-0" />
            <p className="text-sm font-medium whitespace-nowrap truncate">
              {reviewRating} ({reviewCount})
            </p>
          </div>
        );
      },
    },
  ];

  const rowVirtualizer = useWindowVirtualizer({
    count: dataTable.length,
    estimateSize: () => 56,
    overscan: 1,
    scrollMargin: tableContainerRef.current?.offsetTop ?? 0,
    measureElement: (element) => element.getBoundingClientRect().height, // Đo lường chiều cao thực tế
  });

  return (
    <>
      <div
        ref={tableContainerRef}
        className="overflow-hidden rounded-md border"
      >
        <div
          className={cn(
            "custom-table",
            "relative w-full overflow-x-auto caption-bottom text-sm"
          )}
        >
          {/* Table Head */}
          <div className="custom-thead">
            <div className={cn("custom-tr", "relative flex items-center")}>
              {columns.map((column) => (
                <div
                  key={column.key}
                  className={cn(
                    "custom-th",
                    "bg-background content-center border-b text-foreground h-10 px-2 text-left font-medium whitespace-nowrap",
                    "first:sticky first:top-0 first:left-0 first:z-10"
                  )}
                  style={{ width: column.width, minWidth: column.minWidth }}
                >
                  {column.header}
                </div>
              ))}
            </div>
          </div>

          {/* Table Body */}
          <div
            className="custom-tbody [&_.custom-tr:last-child_.custom-td]:border-0"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const product = dataTable[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index} //needed for dynamic row height measurement
                  ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
                  className={cn("custom-tr", "flex items-stretch w-full")}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${
                      virtualRow.start - rowVirtualizer.options.scrollMargin
                    }px)`,
                  }}
                >
                  {columns.map((col) => {
                    if (col?.hide) return null;
                    const record = product?.[col.key as keyof Product];
                    return (
                      <div
                        key={col.key}
                        className={cn(
                          "custom-td",
                          "px-4 py-2 content-center w-full bg-background border-b",
                          "first:sticky first:top-0 first:left-0 first:z-10",
                          col.align && `justify-${col.align}`
                        )}
                        style={{ width: col.width, minWidth: col.minWidth }}
                      >
                        {col.render ? col.render(record, product) : String(record)}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <InfiniteScroll
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
          next={fetchNextPage}
          threshold={1}
        >
          {hasNextPage && (
            <Button
              className="text-base font-medium bg-background disabled:opacity-50"
              variant="elevated"
              disabled
            >
              Load more <LoaderIcon className="my-4 h-8 w-8 animate-spin" />
            </Button>
          )}
        </InfiniteScroll>
      </div>
    </>
  );
};

export const ProductListTableSkeleton = () => {
  const columns: Column[] = useMemo(() => {
    return [
      {
        key: "product",
        header: "Product",
        width: "40%",
        minWidth: "300px",
        render: () => {
          return (
            <div className="flex items-center gap-2">
              <div className="relative aspect-square rounded-md bg-gray-200 animate-pulse size-10" />
              <div className="h-4 w-full bg-gray-200 animate-pulse" />
            </div>
          );
        },
      },
      {
        key: "tenant",
        header: "Tenant",
        width: "30%",
        minWidth: "200px",
        render: () => {
          return (
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-gray-200 animate-pulse shrink-0 size-6" />
              <div className="h-3 bg-gray-200 animate-pulse w-24" />
            </div>
          );
        },
      },
      {
        key: "price",
        header: "Price",
        width: "15%",
        minWidth: "100px",
        render: () => {
          return <div className="h-4 bg-gray-200 animate-pulse w-16" />;
        },
      },
      {
        key: "reviews",
        header: "Reviews",
        width: "15%",
        minWidth: "100px",
        render: () => {
          return (
            <div className="flex items-center gap-1">
              <StarIcon className="size-3.5 fill-gray-300" />
              <div className="h-3 bg-gray-200 animate-pulse w-16" />
            </div>
          );
        },
      },
    ];
  }, []);

  const dataTable = useMemo(() => Array.from({ length: TABLE_LIMIT }), []);

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="custom-table relative w-full overflow-x-auto caption-bottom text-sm">
        <div className="custom-thead">
          <div className="custom-tr relative flex items-center">
            {columns.map((column) => (
              <div
                key={column.key}
                className={cn(
                  "custom-th",
                  "bg-background content-center border-b text-foreground h-10 px-2 text-left font-medium whitespace-nowrap",
                  "first:sticky first:top-0 first:left-0 first:z-10"
                )}
                style={{ width: column.width, minWidth: column.minWidth }}
              >
                {column.header}
              </div>
            ))}
          </div>
        </div>

        <div className="custom-tbody [&_.custom-tr:last-child_.custom-td]:border-0">
          {dataTable.map((_, index) => (
            <div
              key={index}
              className={cn("custom-tr", "flex items-stretch w-full")}
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className={cn(
                    "custom-td",
                    "px-4 py-2 content-center w-full bg-background border-b",
                    "first:sticky first:top-0 first:left-0 first:z-10",
                    col.align && `justify-${col.align}`
                  )}
                  style={{ width: col.width, minWidth: col.minWidth }}
                >
                  {col.render()}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductListTable;

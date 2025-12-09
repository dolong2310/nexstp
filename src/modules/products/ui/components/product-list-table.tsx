"use client";

import InfiniteScroll from "@/components/infinite-scroll";
import Media from "@/components/media";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TABLE_LIMIT } from "@/constants";
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "@/i18n/navigation";
import {
  cn,
  fallbackImageUrl,
  formatCurrency,
  formatName,
  generateTenantPathname,
} from "@/lib/utils";
import { Media as MediaType, Tenant } from "@/payload-types";
import { useGlobalStore } from "@/store/use-global-store";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import isEqual from "lodash-es/isEqual";
import { LoaderIcon, StarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useRef } from "react";
import { ProductsGetManyOutput } from "../../types";
import CartButton, { CartButtonSkeleton } from "./cart-button";

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
  const t = useTranslations();
  const { theme } = useTheme();
  const dataTableRef = useRef<Product[]>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const loadingGlobal = useGlobalStore((state) => state.loadingGlobal);

  const dataTable = useMemo<Product[]>(() => {
    const dataTable = productData.map((p) => {
      return {
        id: p.id,
        product: {
          id: p.id,
          name: p.name,
          image: fallbackImageUrl(p.image?.url, theme),
          tenantSlug: p.tenant.slug,
        },
        tenant: p.tenant,
        price: p.price,
        reviews: {
          reviewRating: p.reviewRating,
          reviewCount: p.reviewCount,
        },
        action: {
          productId: p.id,
          tenantSlug: p.tenant.slug,
          isPurchased: p.isPurchased,
          isOwner: p.isOwner,
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
      header: t("Product"),
      width: "35%",
      minWidth: "220px",
      render: (value) => {
        const image = fallbackImageUrl(value.image, theme);
        const name = value.name;
        const authorUsername = value.tenantSlug;
        const id = value.id;

        return (
          <Link
            href={`${generateTenantPathname(authorUsername)}/products/${id}`}
            className="flex items-center gap-2 w-full"
          >
            <Media
              src={image}
              alt={name}
              fill
              isBordered
              containerClassName="size-10"
              className="rounded-base object-cover"
            />
            <p className="font-medium truncate overflow-hidden">{name}</p>
          </Link>
        );
      },
    },
    {
      key: "tenant",
      header: t("Tenant"),
      width: "30%",
      minWidth: "200px",
      render: (value) => {
        const authorUsername = value.slug;
        const authorImageUrl = value.image?.url;

        return (
          <Link
            href={generateTenantPathname(authorUsername)}
            className="flex items-center gap-2 cursor-pointer w-full"
          >
            <Avatar className="size-6">
              <AvatarImage src={authorImageUrl} alt={authorUsername} />
              <AvatarFallback>{formatName(authorUsername)}</AvatarFallback>
            </Avatar>
            <p className="text-sm underline font-medium truncate overflow-hidden">
              {authorUsername}
            </p>
          </Link>
        );
      },
    },
    {
      key: "price",
      header: t("Price"),
      width: "15%",
      minWidth: "100px",
      render: (value) => {
        return (
          <Badge>
            <p className="text-sm font-medium truncate">
              {formatCurrency(value)}
            </p>
          </Badge>
        );
      },
    },
    {
      key: "reviews",
      header: t("Reviews"),
      width: "15%",
      minWidth: "100px",
      render: (value) => {
        const reviewCount = value.reviewCount;
        const reviewRating = value.reviewRating;

        return (
          <div className="flex items-center gap-1 overflow-hidden">
            <StarIcon className="size-3.5 fill-black dark:fill-white shrink-0" />
            <p className="text-sm font-medium whitespace-nowrap truncate">
              {reviewRating} ({reviewCount})
            </p>
          </div>
        );
      },
    },
    {
      key: "action",
      header: "",
      width: "5%",
      minWidth: "80px",
      render: (value) => {
        return (
          <CartButton
            isIconButton
            isOwner={value.isOwner}
            productId={value.productId}
            tenantSlug={value.tenantSlug}
            isPurchased={value.isPurchased}
          />
        );
      },
    },
  ];

  const rowVirtualizer = useWindowVirtualizer({
    count: dataTable.length,
    estimateSize: () => 56,
    overscan: 5,
    scrollMargin: tableContainerRef.current?.offsetTop ?? 0,
    measureElement: (element) => element.getBoundingClientRect().height, // Đo lường chiều cao thực tế
  });

  if (loadingGlobal) {
    return <ProductListTableSkeleton />;
  }

  return (
    <>
      <div
        ref={tableContainerRef}
        className="overflow-hidden rounded-base border-2"
      >
        <div
          className={cn(
            "custom-table",
            "relative w-full overflow-x-auto caption-bottom text-sm bg-secondary-background"
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
                    "bg-background content-center border-b-2 text-foreground h-10 px-2 text-left font-medium whitespace-nowrap",
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
                          "px-4 py-2 content-center w-full bg-background border-b-2",
                          "first:sticky first:top-0 first:left-0 first:z-10",
                          col.align && `flex items-center justify-${col.align}`
                        )}
                        style={{ width: col.width, minWidth: col.minWidth }}
                      >
                        {col.render
                          ? col.render(record, product)
                          : String(record)}
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
              className="text-base font-medium"
              variant="default"
              disabled
            >
              {t("Load more")} <LoaderIcon className="size-8 animate-spin" />
            </Button>
          )}
        </InfiniteScroll>
      </div>
    </>
  );
};

export const ProductListTableSkeleton = () => {
  const t = useTranslations();
  const columns: Column[] = useMemo(() => {
    return [
      {
        key: "product",
        header: t("Product"),
        width: "35%",
        minWidth: "220px",
        render: () => {
          return (
            <div className="flex items-center gap-2">
              <Skeleton className="relative aspect-square rounded-base bg-secondary-background animate-pulse size-10" />
              <Skeleton className="h-5 w-full bg-secondary-background animate-pulse" />
            </div>
          );
        },
      },
      {
        key: "tenant",
        header: t("Tenant"),
        width: "30%",
        minWidth: "200px",
        render: () => {
          return (
            <div className="flex items-center gap-2">
              <Skeleton className="rounded-full bg-secondary-background animate-pulse shrink-0 size-6" />
              <Skeleton className="h-4 bg-secondary-background animate-pulse w-24" />
            </div>
          );
        },
      },
      {
        key: "price",
        header: t("Price"),
        width: "15%",
        minWidth: "100px",
        render: () => {
          return (
            <Skeleton className="h-5 bg-secondary-background animate-pulse w-16" />
          );
        },
      },
      {
        key: "reviews",
        header: t("Reviews"),
        width: "15%",
        minWidth: "100px",
        render: () => {
          return (
            <div className="flex items-center gap-1">
              <StarIcon className="size-3.5 fill-gray-300" />
              <Skeleton className="h-4 bg-secondary-background animate-pulse w-16" />
            </div>
          );
        },
      },
      {
        key: "action",
        header: "",
        width: "5%",
        minWidth: "80px",
        render: () => {
          return <CartButtonSkeleton isIconButton />;
        },
      },
    ];
  }, []);

  const dataTable = useMemo(() => Array.from({ length: TABLE_LIMIT }), []);

  return (
    <div className="overflow-hidden rounded-base border-2">
      <div className="custom-table relative w-full overflow-x-auto caption-bottom text-sm">
        <div className="custom-thead">
          <div className="custom-tr relative flex items-center">
            {columns.map((column) => (
              <div
                key={column.key}
                className={cn(
                  "custom-th",
                  "bg-background content-center border-b-2 text-foreground h-10 px-2 text-left font-medium whitespace-nowrap",
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
                    "px-4 py-2 content-center w-full bg-background border-b-2",
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

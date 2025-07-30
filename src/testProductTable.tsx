"use client";

// TODO: REMOVE @tanstack/react-table after delete this file

import InfiniteScroll from "@/components/infinite-scroll";
import Media from "@/components/media";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TABLE_LIMIT } from "@/constants";
import { formatCurrency, generateTenantUrl } from "@/lib/utils";
import { Media as MediaType, Tenant } from "@/payload-types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import isEqual from "lodash-es/isEqual";
import { LoaderIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef } from "react";
import { ProductsGetManyOutput } from "./modules/products/types";

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

interface Props {
  productData: ProductsGetManyOutput;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

const TestProductListTable = ({
  productData,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: Props) => {
  const dataTableRef = useRef<Product[]>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const dataMemo = useMemo<Product[]>(() => {
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

  const columns: ColumnDef<Product>[] = useMemo(
    () => [
      {
        accessorKey: "product",
        header: "Product",
        size: 300,
        cell: ({ row }) => {
          const image = row.original.product.image || "/placeholder-bg.jpg";
          const name = row.original.product.name;
          const authorUsername = row.original.tenant.slug;
          const id = row.original.id;

          return (
            <Link
              href={`${generateTenantUrl(authorUsername)}/products/${id}`}
              className="flex items-center gap-2"
            >
              <Media
                src={image}
                alt={name}
                fill
                containerClassName="size-10"
                className="rounded-md object-cover"
              />
              <p className="font-medium truncate overflow-hidden whitespace-nowrap max-w-[300px]">
                {name}
              </p>
            </Link>
          );
        },
      },
      {
        accessorKey: "tenant",
        header: "Tenant",
        size: 200,
        cell: ({ row }) => {
          const tenant = row.original.tenant;
          const authorUsername = tenant.slug;
          const authorImageUrl = tenant.image?.url;

          return (
            <Link
              href={generateTenantUrl(authorUsername)}
              className="flex items-center gap-2 cursor-pointer"
            >
              {authorImageUrl && (
                <Media
                  src={authorImageUrl}
                  alt={authorUsername}
                  fill
                  containerClassName="size-6"
                  className="rounded-full border"
                />
              )}
              <p className="text-sm underline font-medium">{authorUsername}</p>
            </Link>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        size: 100,
        cell: ({ row }) => {
          const price = row.original.price;

          return (
            <div className="relative px-2 py-1 border bg-feature w-fit">
              <p className="text-sm font-medium">{formatCurrency(price)}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "reviews",
        header: "Reviews",
        size: 100,
        cell: ({ row }) => {
          const reviews = row.original.reviews;
          const reviewCount = reviews.reviewCount;
          const reviewRating = reviews.reviewRating;

          // if (reviewCount === 0) return null;
          return (
            <div className="flex items-center gap-1">
              <StarIcon className="size-3.5 fill-black" />
              <p className="text-sm font-medium">
                {reviewRating} ({reviewCount})
              </p>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: dataMemo,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {},
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 56,
    overscan: 1,
    scrollMargin: tableContainerRef.current?.offsetTop ?? 0,
    // measureElement: (element) => element.getBoundingClientRect().height, // Đo lường chiều cao thực tế
  });

  return (
    <>
      {/* <div
        // ref={tableContainerRef}
        className="overflow-hidden rounded-md border"
      >
        <div
          id="TABLE"
          className="relative w-full overflow-x-auto caption-bottom text-sm"
        >
          <div id="THEAD" className="">
            <div id="TROW" className="relative flex items-center">
              <div
                id="TH"
                className="first:sticky first:top-0 first:left-0 first:bg-third first:z-10 content-center border-b text-foreground h-10 px-2 text-left font-medium whitespace-nowrap"
                style={{ width: "40%", minWidth: "300px" }}
              >
                Product
              </div>
              <div
                id="TH"
                className="bg-third content-center border-b text-foreground h-10 px-2 text-left font-medium whitespace-nowrap"
                style={{ width: "30%", minWidth: "200px" }}
              >
                Tenant
              </div>
              <div
                id="TH"
                className="bg-third content-center border-b text-foreground h-10 px-2 text-left font-medium whitespace-nowrap"
                style={{ width: "15%", minWidth: "100px" }}
              >
                Price
              </div>
              <div
                id="TH"
                className="bg-third content-center border-b text-foreground h-10 px-2 text-left font-medium whitespace-nowrap"
                style={{ width: "15%", minWidth: "100px" }}
              >
                Reviews
              </div>
            </div>
          </div>

          <div id="TBODY">
            <div
              id="TR"
              className="flex items-center hover:bg-muted/50 transition-colors"
            >
              <div
                id="TD"
                className="first:sticky first:top-0 first:left-0 first:bg-third first:z-10 p-2 border-b align-middle whitespace-nowrap"
                style={{ width: "40%", minWidth: "300px" }}
              >
                <p>Content</p>
              </div>
              <div
                id="TD"
                className="p-2 border-b align-middle whitespace-nowrap"
                style={{ width: "30%", minWidth: "200px" }}
              >
                <p>Content</p>
              </div>
              <div
                id="TD"
                className="p-2 border-b align-middle whitespace-nowrap"
                style={{ width: "15%", minWidth: "100px" }}
              >
                <p>Content</p>
              </div>
              <div
                id="TD"
                className="p-2 border-b align-middle whitespace-nowrap"
                style={{ width: "15%", minWidth: "100px" }}
              >
                <p>Content</p>
              </div>
            </div>

            <div
              id="TR"
              className="flex items-center hover:bg-muted/50 transition-colors"
            >
              <div
                id="TD"
                className="first:sticky first:top-0 first:left-0 first:bg-third first:z-10 p-2 border-b align-middle whitespace-nowrap"
                style={{ width: "40%", minWidth: "300px" }}
              >
                <p>Content</p>
              </div>
              <div
                id="TD"
                className="p-2 border-b align-middle whitespace-nowrap"
                style={{ width: "30%", minWidth: "200px" }}
              >
                <p>Content</p>
              </div>
              <div
                id="TD"
                className="p-2 border-b align-middle whitespace-nowrap"
                style={{ width: "15%", minWidth: "100px" }}
              >
                <p>Content</p>
              </div>
              <div
                id="TD"
                className="p-2 border-b align-middle whitespace-nowrap"
                style={{ width: "15%", minWidth: "100px" }}
              >
                <p>Content</p>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div
        ref={tableContainerRef}
        className="overflow-hidden rounded-md border"
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${(header.getSize() * 100) / 700}%` }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index] as Row<Product>;
              console.log({ rows, row, virtualRow });
              return (
                <TableRow
                  key={virtualRow.key}
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
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          // width: "100%",
                          width: `${(cell.column.getSize() * 100) / 700}%`,
                          minWidth: cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
            {/* {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No products found
                </TableCell>
              </TableRow>
            )} */}
          </TableBody>
        </Table>
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
  const columns: ColumnDef<unknown>[] = useMemo(
    () => [
      {
        accessorKey: "product",
        header: "Product",
        size: 300,
        cell: () => (
          <div className="flex items-center gap-2">
            <div className="relative aspect-square rounded-md bg-gray-200 animate-pulse size-10" />
            <div className="h-4 bg-gray-200 animate-pulse w-full" />
          </div>
        ),
      },
      {
        accessorKey: "tenant",
        header: "Tenant",
        size: 200,
        cell: () => (
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gray-200 animate-pulse shrink-0 size-6" />
            <div className="h-3 bg-gray-200 animate-pulse w-24" />
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        size: 100,
        cell: () => <div className="h-4 bg-gray-200 animate-pulse w-16" />,
      },
      {
        accessorKey: "reviews",
        header: "Reviews",
        size: 100,
        cell: () => (
          <div className="flex items-center gap-1">
            <StarIcon className="size-3.5 fill-gray-300" />
            <div className="h-3 bg-gray-200 animate-pulse w-16" />
          </div>
        ),
      },
    ],
    []
  );

  const dataMemo = useMemo(() => Array.from({ length: TABLE_LIMIT }), []);

  const table = useReactTable({
    data: dataMemo,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, idx) => (
              <TableHead
                key={typeof column.header === "string" ? column.header : idx}
                style={{ width: column.size }}
              >
                {typeof column.header === "string" ? column.header : ""}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  style={{ width: cell.column.getSize() }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TestProductListTable;

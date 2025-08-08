"use client";

import { cn } from "@/lib/utils";
import { ArrowDownIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

export type ColumnType = {
  title: React.ReactNode;
  key: string;
  width?: number;
  align?: string;
  hide?: boolean;
  isSort?: boolean;
  render?: (value?: any, record?: any) => React.ReactNode;
  onChangeSort?: (isSortedUp: boolean) => void;
};

interface TableProps {
  columns?: ColumnType[];
  dataTable?: any[];
  className?: string;
  classNameItem?: string;
  classNameTogether?: string;
  classNameHeader?: string;
  noHover?: boolean;
  isLoading?: boolean;
  classNameTable?: string;
  customHeader?: string;
}

const columnsDefault: ColumnType[] = [
  {
    title: "Price",
    key: "price",
    width: 20,
    align: "",
    hide: false,
  },
  {
    title: "Floor Difference",
    key: "floorDiffer",
    width: 20,
    align: "",
    hide: false,
  },
  {
    title: "Expiration",
    key: "exp",
    width: 20,
    align: "",
    hide: false,
  },
  {
    title: "From",
    key: "from",
    width: 20,
    align: "",
    hide: false,
    render: (from: string) => (
      <div className="w-full overflow-hidden truncate">{from}</div>
    ),
  },
  {
    title: "Action",
    key: "action",
    width: 20,
    align: "",
    hide: false,
    render: (status: string) => (
      <div className="w-full overflow-hidden truncate">{status}</div>
    ),
  },
];

const dataSourceDefault = [
  {
    price: 123,
    floorDiffer: 1000,
    exp: 123123123,
    from: "0xCdc...H7d",
    action: "Accept lorem lorem lorem lorem lorem lorem lorem",
  },
  {
    price: 456,
    floorDiffer: 1000,
    exp: 123123123,
    from: "0xCdc...H7d lorem  lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem",
    action: "Cancel",
  },
  {
    price: 789,
    floorDiffer: 1000,
    exp: 123123123,
    from: "0xCdc...H7d",
    action: "Accept",
  },
  {
    price: 101112,
    floorDiffer: 1000,
    exp: 123123123,
    from: "0xCdc...H7d",
    action: "Accept",
  },
];

const CustomTable = ({
  columns = columnsDefault,
  dataTable = dataSourceDefault,
  className,
  classNameItem,
  classNameTogether,
  classNameHeader,
  noHover = false,
  isLoading,
  classNameTable,
  customHeader,
}: TableProps) => {
  // states
  const [isSortedUp, setIsSortedUp] = useState(false);
  const [tableData, setTableData] = useState(dataTable);

  // variables
  const checkSticky = tableData.length > 4;

  useEffect(() => {
    setTableData(dataTable);
  }, [dataTable]);

  const renderTableBody = () => {
    if (isLoading) {
      return Array(5)
        .fill(5)
        .map((item, idx) => (
          <tr key={`${item + idx}`}>
            {columns.map((col) => (
              <td className="first:ps-0 last:pe-0 p-4 ipad:p-2" key={col.key}>
                Skeleton
              </td>
            ))}
          </tr>
        ));
    }

    if (tableData.length <= 0) {
      return <div>Data not found</div>;
    }

    return tableData.map((data, idx) => (
      <tr className="group" key={`${JSON.stringify(data) + idx}`}>
        {columns.map((col) => {
          if (col?.hide) return null;
          return (
            <td
              className={cn(
                "mb-4 p-2 md:p-4 whitespace-nowrap",
                classNameTogether,
                classNameItem,
                noHover && "first:ps-0 last:pe-0"
              )}
              key={col.key}
            >
              <div
                className={cn(
                  col.align && `justify-${col.align}`,
                  "flex items-center w-full"
                )}
              >
                {col.render ? col.render(data[col.key], data) : data[col.key]}
              </div>
            </td>
          );
        })}
      </tr>
    ));
  };

  // functions
  const handleSwitchSort =
    ({ key: dataIndex, onChangeSort }: any) =>
    () => {
      setIsSortedUp(!isSortedUp);
      if (typeof onChangeSort === "function") {
        onChangeSort(!isSortedUp);
        return;
      }
      const listData = [...tableData];
      const sortedArr = !isSortedUp
        ? listData.sort((a, b) => (+a[dataIndex] - +b[dataIndex] >= 0 ? 1 : -1))
        : listData.sort((a, b) =>
            +a[dataIndex] - +b[dataIndex] <= 0 ? 1 : -1
          );
      setTableData(sortedArr);
    };

  return (
    <div className={cn("text-sm relative", className)}>
      <table className={cn("w-full", classNameTable)}>
        <thead
          className={cn(
            "z-20",
            checkSticky && `${customHeader || "top-header"} sticky left-0`
          )}
        >
          <tr>
            {columns.map((col) => {
              if (col?.hide) return null;
              return (
                <th
                  key={col.key}
                  style={{ width: `${col.width}%` }}
                  className={cn(
                    "p-2 md:p-4 whitespace-nowrap font-semibold text-left",
                    "text-sm",
                    checkSticky && "bg-secondary-background",
                    classNameTogether,
                    classNameHeader,
                    (noHover || isLoading) && "first:ps-0 last:pe-0"
                  )}
                >
                  {isLoading ? (
                    <div>Skeleton</div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          col.align && `justify-${col.align}`,
                          "flex items-center"
                        )}
                      >
                        {col.title}
                      </div>
                      {col?.isSort && (
                        <ArrowDownIcon
                          size="sm"
                          className={cn(
                            !isSortedUp ? "rotate-180" : "rotate-0",
                            "cursor-pointer transition-transform"
                          )}
                          onClick={handleSwitchSort(col)}
                        />
                      )}
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="z-10">{renderTableBody()}</tbody>
      </table>
    </div>
  );
};

export default CustomTable;

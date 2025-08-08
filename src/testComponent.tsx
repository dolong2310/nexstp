// "use client";

// // TODO: REMOVE @tanstack/react-table after delete this file

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   ColumnDef,
//   ColumnFiltersState,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   Table as ReactTable,
//   SortingState,
//   useReactTable,
//   VisibilityState,
// } from "@tanstack/react-table";
// import {
//   ArrowUpDown,
//   ChevronLeft,
//   ChevronRight,
//   ChevronsLeft,
//   ChevronsRight,
//   MoreHorizontal,
//   Settings2,
// } from "lucide-react";
// import { useEffect, useState } from "react";

// type Payment = {
//   id: string;
//   amount: number;
//   status: "pending" | "processing" | "success" | "failed";
//   email: string;
// };

// const columns: ColumnDef<Payment>[] = [
//   {
//     id: "select",
//     header: ({ table }) => (
//       <Checkbox
//         checked={
//           table.getIsAllPageRowsSelected() ||
//           (table.getIsSomePageRowsSelected() && "indeterminate")
//         }
//         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//         aria-label="Select all"
//       />
//     ),
//     cell: ({ row }) => (
//       <Checkbox
//         checked={row.getIsSelected()}
//         onCheckedChange={(value) => row.toggleSelected(!!value)}
//         aria-label="Select row"
//       />
//     ),
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//   },
//   {
//     accessorKey: "email",
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="neutral"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Email
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </Button>
//       );
//     },
//   },
//   // {
//   //   accessorKey: "amount",
//   //   header: "Amount",
//   // },
//   {
//     accessorKey: "amount",
//     header: () => <div className="text-right">Amount</div>,
//     cell: ({ row }) => {
//       const amount = parseFloat(row.getValue("amount"));
//       const formatted = new Intl.NumberFormat("en-US", {
//         style: "currency",
//         currency: "USD",
//       }).format(amount);

//       return <div className="text-right font-medium">{formatted}</div>;
//     },
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => {
//       const payment = row.original;

//       return (
//         <div className="text-right">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="neutral" className="h-8 w-8 p-0">
//                 <span className="sr-only">Open menu</span>
//                 <MoreHorizontal className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuLabel>Actions</DropdownMenuLabel>
//               <DropdownMenuItem
//                 onClick={() => navigator.clipboard.writeText(payment.id)}
//               >
//                 Copy payment ID
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem>View customer</DropdownMenuItem>
//               <DropdownMenuItem>View payment details</DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       );
//     },
//   },
// ];

// interface DataTableProps<TData, TValue> {
//   columns: ColumnDef<TData, TValue>[];
//   data: TData[];
// }

// function DataTable<TData, TValue>({
//   columns,
//   data,
// }: DataTableProps<TData, TValue>) {
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
//   const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
//   const [rowSelection, setRowSelection] = useState({});

//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     onSortingChange: setSorting,
//     getSortedRowModel: getSortedRowModel(),
//     onColumnFiltersChange: setColumnFilters,
//     getFilteredRowModel: getFilteredRowModel(),
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     state: {
//       sorting,
//       columnFilters,
//       columnVisibility,
//       rowSelection,
//     },
//   });

//   return (
//     <div>
//       <div className="flex items-center py-4">
//         <Input
//           placeholder="Filter emails..."
//           value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
//           onChange={(event) =>
//             table.getColumn("email")?.setFilterValue(event.target.value)
//           }
//           className="max-w-sm"
//         />

//         <DataTableViewOptions table={table} />

//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="default" className="ml-auto">
//               Columns
//             </Button>
//           </DropdownMenuTrigger>

//           <DropdownMenuContent align="end">
//             {table
//               .getAllColumns()
//               .filter((column) => column.getCanHide())
//               .map((column) => {
//                 return (
//                   <DropdownMenuCheckboxItem
//                     key={column.id}
//                     className="capitalize"
//                     checked={column.getIsVisible()}
//                     onCheckedChange={(value) =>
//                       column.toggleVisibility(!!value)
//                     }
//                   >
//                     {column.id}
//                   </DropdownMenuCheckboxItem>
//                 );
//               })}
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>

//       <div className="overflow-hidden rounded-md border">
//         <Table>
//           <TableHeader>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => {
//                   return (
//                     <TableHead key={header.id}>
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                             header.column.columnDef.header,
//                             header.getContext()
//                           )}
//                     </TableHead>
//                   );
//                 })}
//               </TableRow>
//             ))}
//           </TableHeader>

//           <TableBody>
//             {table.getRowModel().rows?.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow
//                   key={row.id}
//                   data-state={row.getIsSelected() && "selected"}
//                 >
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id}>
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext()
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="h-24 text-center"
//                 >
//                   No results.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       <div className="flex items-center justify-end space-x-2 py-4">
//         <DataTablePagination table={table} />

//         {/* <div className="text-foreground flex-1 text-sm">
//           {table.getFilteredSelectedRowModel().rows.length} of{" "}
//           {table.getFilteredRowModel().rows.length} row(s) selected.
//         </div>

//         <Button
//           variant="default"
//           size="sm"
//           onClick={() => table.previousPage()}
//           disabled={!table.getCanPreviousPage()}
//         >
//           Previous
//         </Button>
//         <Button
//           variant="default"
//           size="sm"
//           onClick={() => table.nextPage()}
//           disabled={!table.getCanNextPage()}
//         >
//           Next
//         </Button> */}
//       </div>
//     </div>
//   );
// }

// interface DataTablePaginationProps<TData> {
//   table: ReactTable<TData>;
// }

// function DataTablePagination<TData>({
//   table,
// }: DataTablePaginationProps<TData>) {
//   return (
//     <div className="flex items-center justify-between px-2">
//       <div className="text-foreground flex-1 text-sm">
//         {table.getFilteredSelectedRowModel().rows.length} of{" "}
//         {table.getFilteredRowModel().rows.length} row(s) selected.
//       </div>
//       <div className="flex items-center space-x-6 lg:space-x-8">
//         <div className="flex items-center space-x-2">
//           <p className="text-sm font-medium">Rows per page</p>
//           <Select
//             value={`${table.getState().pagination.pageSize}`}
//             onValueChange={(value) => {
//               table.setPageSize(Number(value));
//             }}
//           >
//             <SelectTrigger className="h-8 w-[70px]">
//               <SelectValue placeholder={table.getState().pagination.pageSize} />
//             </SelectTrigger>
//             <SelectContent side="top">
//               {[10, 20, 25, 30, 40, 50].map((pageSize) => (
//                 <SelectItem key={pageSize} value={`${pageSize}`}>
//                   {pageSize}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="flex w-[100px] items-center justify-center text-sm font-medium">
//           Page {table.getState().pagination.pageIndex + 1} of{" "}
//           {table.getPageCount()}
//         </div>
//         <div className="flex items-center space-x-2">
//           <Button
//             variant="default"
//             size="icon"
//             className="hidden size-8 lg:flex"
//             onClick={() => table.setPageIndex(0)}
//             disabled={!table.getCanPreviousPage()}
//           >
//             <span className="sr-only">Go to first page</span>
//             <ChevronsLeft />
//           </Button>
//           <Button
//             variant="default"
//             size="icon"
//             className="size-8"
//             onClick={() => table.previousPage()}
//             disabled={!table.getCanPreviousPage()}
//           >
//             <span className="sr-only">Go to previous page</span>
//             <ChevronLeft />
//           </Button>
//           <Button
//             variant="default"
//             size="icon"
//             className="size-8"
//             onClick={() => table.nextPage()}
//             disabled={!table.getCanNextPage()}
//           >
//             <span className="sr-only">Go to next page</span>
//             <ChevronRight />
//           </Button>
//           <Button
//             variant="default"
//             size="icon"
//             className="hidden size-8 lg:flex"
//             onClick={() => table.setPageIndex(table.getPageCount() - 1)}
//             disabled={!table.getCanNextPage()}
//           >
//             <span className="sr-only">Go to last page</span>
//             <ChevronsRight />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function DataTableViewOptions<TData>({ table }: { table: ReactTable<TData> }) {
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="default"
//           size="sm"
//           className="ml-auto hidden h-8 lg:flex"
//         >
//           <Settings2 />
//           View
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end" className="w-[150px]">
//         <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         {table
//           .getAllColumns()
//           .filter(
//             (column) =>
//               typeof column.accessorFn !== "undefined" && column.getCanHide()
//           )
//           .map((column) => {
//             return (
//               <DropdownMenuCheckboxItem
//                 key={column.id}
//                 className="capitalize"
//                 checked={column.getIsVisible()}
//                 onCheckedChange={(value) => column.toggleVisibility(!!value)}
//               >
//                 {column.id}
//               </DropdownMenuCheckboxItem>
//             );
//           })}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

// const UsingTable = () => {
//   async function getData(): Promise<Payment[]> {
//     // Fetch data from your API here.
//     const mockData: Payment[] = Array.from({ length: 30 }).map((_, index) => ({
//       id: `payment-${index + 1}`,
//       amount: (index + 1) * 100,
//       status: ["pending", "processing", "success", "failed"][
//         Math.floor(Math.random() * 4)
//       ] as Payment["status"],
//       email: `user${index + 1}@example.com`,
//     }));

//     return mockData;
//   }

//   const [dataTable, setDataTable] = useState<Payment[]>([]);

//   useEffect(() => {
//     getData().then((data) => {
//       setDataTable(data);
//     });
//   }, []);

//   return (
//     <>
//       <DataTable columns={columns} data={dataTable} />
//     </>
//   );
// };

// export default UsingTable;

// ================================================================= Test Launchpad ===========================================================================

// "use client";

// import { Button } from "@/components/ui/button";
// import { useTRPC } from "@/trpc/client";
// import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
// import { id } from "date-fns/locale";
// import React from "react";

// const AboutPage = () => {
//   const trpc = useTRPC();

//   const { data: launchpads } = useQuery(
//     trpc.launchpads.getMany.queryOptions({})
//   );
//   // const { data: launchpadDetail } = useQuery(
//   //   trpc.launchpads.getOne.queryOptions({ id: "688d252fdd7e76a5746a43b9" })
//   // );

//   // Tenant actions
//   const createLp = useMutation(trpc.launchpads.create.mutationOptions({}));
//   const updateLp = useMutation(trpc.launchpads.update.mutationOptions({}));
//   const deleteLp = useMutation(trpc.launchpads.delete.mutationOptions({}));
//   const submitForApprovalLp = useMutation(
//     trpc.launchpads.submitForApproval.mutationOptions({})
//   );
//   const publishLp = useMutation(trpc.launchpads.publish.mutationOptions({}));

//   // Admin actions
//   const approveLp = useMutation(trpc.launchpads.approve.mutationOptions({}));
//   const rejectLp = useMutation(trpc.launchpads.reject.mutationOptions({}));

//   // User actions
//   const purchaseLp = useMutation(trpc.launchpads.purchase.mutationOptions({}));

//   console.log("Launchpads:", launchpads);
//   // console.log("launchpadDetail:", launchpadDetail);

//   // functions
//   const createLaunchpad = async () => {
//     const test = {
//       tags: ["688d13d5046fe99b4ef2006c"],
//       title: "New Launchpadd",
//       image: "688d18de3e55d079b728d6f4",
//       status: "draft",
//       content: {
//         root: {
//           children: [
//             {
//               children: [
//                 {
//                   detail: 0,
//                   format: 0,
//                   mode: "normal",
//                   style: "",
//                   text: "content nhaa",
//                   type: "text",
//                   version: 1,
//                 },
//               ],
//               direction: "ltr",
//               format: "",
//               indent: 0,
//               type: "paragraph",
//               version: 1,
//               textFormat: 0,
//               textStyle: "",
//             },
//           ],
//           direction: "ltr",
//           format: "",
//           indent: 0,
//           type: "root",
//           version: 1,
//         },
//       },
//       duration: 3,
//       priority: 0,
//       category: "688d13ce046fe99b4ef1ffc1",
//       soldCount: 0,
//       description: "Description of the new launchpadd",
//       launchPrice: 5,
//       originalPrice: 15,
//     };
//     const response = await createLp.mutateAsync({
//       tags: ["688d13d5046fe99b4ef20068", "688d13d5046fe99b4ef2006a"],
//       title: "New Launchpad",
//       image:
//         "https://images.unsplash.com/photo-1620336655052-b57986f5a26a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//       // status: "draft",
//       duration: 1,
//       // priority: 0,
//       category: "688d13ce046fe99b4ef1ffbf",
//       // soldCount: 0,
//       description: "Description of the new launchpad",
//       launchPrice: 50,
//       originalPrice: 150,
//     });
//     console.log("response create launchpad: ", response);
//   };

//   const updateLaunchpad = async () => {
//     const response = await updateLp.mutateAsync({
//       id: "launchpad-id",
//       title: "Updated Launchpad",
//       description: "Description of the updated launchpad",
//       launchPrice: 120,
//       category: "688d13cf046fe99b4ef1ffdc",
//       tags: ["688d13d5046fe99b4ef20068"],
//       // content: "<p>Rich text content</p>",
//       image:
//         "https://images.unsplash.com/photo-1620336655052-b57986f5a26a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//       originalPrice: 150,
//       duration: 2,
//       // refundPolicy: "<p>Refund policy details</p>",
//     });
//     console.log("response update launchpad: ", response);
//   };

//   const deleteLaunchpad = async () => {
//     const response = await deleteLp.mutateAsync({
//       id: "launchpad-id",
//     });
//     console.log("response delete launchpad: ", response);
//   };

//   const submitForApprovalLaunchpad = async () => {
//     const response = await submitForApprovalLp.mutateAsync({
//       id: "688d23d0dd7e76a5746a4310",
//     });
//     console.log("response submit for approval launchpad: ", response);
//   };

//   const publishLaunchpad = async () => {
//     const response = await publishLp.mutateAsync({
//       id: "688d23d0dd7e76a5746a4310",
//     });
//     console.log("response publish launchpad: ", response);
//   };

//   const approveLaunchpad = async () => {
//     const response = await approveLp.mutateAsync({
//       id: "688d23d0dd7e76a5746a4310",
//       priority: 1,
//     });
//     console.log("response approve launchpad: ", response);
//   };

//   const rejectLaunchpad = async () => {
//     const response = await rejectLp.mutateAsync({
//       id: "688d23d0dd7e76a5746a4310",
//       reason: "Not meeting quality standards",
//     });
//     console.log("response reject launchpad: ", response);
//   };

//   const purchaseLaunchpad = async () => {
//     const response = await purchaseLp.mutateAsync({
//       launchpadId: "688d23d0dd7e76a5746a4310",
//     });
//     console.log("response purchase launchpad: ", response);
//   };

//   const testExpiredLaunchpad = async () => {
//     // Tạo launchpad với duration 0.01 giờ (36 giây)
//     const response = await createLp.mutateAsync({
//       // tags: ["688df93ebf5671975783a486"],
//       title: "test lp expired",
//       description: "test lp expired description",
//       image: "688e0256572cc823658c5e8a",
//       launchPrice: 5,
//       originalPrice: 10,
//       duration: 0.01,
//       category: "688e00f4ee2160b6c7e20f2e",
//       refundPolicy: "30-day",
//     });

//     console.log("Test launchpad created:", response);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center p-4">
//       <Button variant="default" onClick={testExpiredLaunchpad}>
//         Create Test Expired Launchpad
//       </Button>
//       <Button variant="default" onClick={createLaunchpad}>
//         Create Launchpad
//       </Button>
//       <Button variant="default" onClick={updateLaunchpad}>
//         Update Launchpad
//       </Button>
//       <Button variant="default" onClick={deleteLaunchpad}>
//         Delete Launchpad
//       </Button>
//       <Button variant="default" onClick={submitForApprovalLaunchpad}>
//         Submit for Approval Launchpad
//       </Button>
//       <Button variant="default" onClick={publishLaunchpad}>
//         Publish Launchpad
//       </Button>
//       <Button variant="default" onClick={approveLaunchpad}>
//         Approve Launchpad
//       </Button>
//       <Button variant="default" onClick={rejectLaunchpad}>
//         Reject Launchpad
//       </Button>
//       <Button variant="default" onClick={purchaseLaunchpad}>
//         Purchase Launchpad
//       </Button>
//     </div>
//   );
// };

// export default AboutPage;

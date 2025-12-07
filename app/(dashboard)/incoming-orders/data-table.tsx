"use client";

import React, { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowSelectionState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showFilters?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showFilters = true,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    state: {
      rowSelection,
      columnFilters,
    },
  });

  // Notify parent component when row selection changes
  useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, table, onRowSelectionChange]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map((headerGroup, index) => (
            <React.Fragment key={`header-group-${index}`}>
              {/* Header Row */}
              <TableRow className="hover:bg-muted">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold">
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
              {/* Filter Row */}
              {showFilters && (
              <TableRow className="hover:bg-muted">
                {headerGroup.headers.map((header) => {
                  const columnId = header.column.id;
                  const canFilter = header.column.getCanFilter();

                  return (
                    <TableHead key={`${header.id}-filter`} className="py-2">
                      {canFilter && columnId === "number" && (
                        <Input
                          placeholder="Filter name..."
                          value={(header.column.getFilterValue() as string) ?? ""}
                          onChange={(event) =>
                            header.column.setFilterValue(event.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      )}
                      {canFilter && (columnId === "supplier.name" || columnId === "supplier_name") && (
                        <Input
                          placeholder="Filter email..."
                          value={(header.column.getFilterValue() as string) ?? ""}
                          onChange={(event) =>
                            header.column.setFilterValue(event.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      )}
                      {canFilter && columnId === "supplierId" && (
                        <Input
                          placeholder="Filter department..."
                          value={(header.column.getFilterValue() as string) ?? ""}
                          onChange={(event) =>
                            header.column.setFilterValue(event.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      )}
                      {canFilter && columnId === "costCenter" && (
                        <Input
                          placeholder="Filter status..."
                          value={(header.column.getFilterValue() as string) ?? ""}
                          onChange={(event) =>
                            header.column.setFilterValue(event.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      )}
                      {canFilter && columnId === "issuanceDate" && (
                        <Input
                          type="date"
                          value={(header.column.getFilterValue() as string) ?? ""}
                          onChange={(event) =>
                            header.column.setFilterValue(event.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableHeader>
        <TableBody>
          {table.getFilteredRowModel().rows?.length ? (
            table.getFilteredRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Sin resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

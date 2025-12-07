"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IncomingOrder } from "@/types/incoming-order";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText } from "lucide-react";

export const createColumns = (
  onDetailsClick: (order: IncomingOrder) => void
): ColumnDef<IncomingOrder>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "number",
    header: "# Factura",
  },
  {
    accessorKey: "supplier.name",
    header: "Tercero",
    cell: ({ row }) => {
      const supplier = row.original.supplier as { name?: string } | undefined;
      return supplier?.name || "-";
    },
  },
  {
    accessorKey: "supplierId",
    header: "NIT",
  },
  {
    accessorKey: "costCenter",
    header: "Centro de Costos",
  },
  {
    accessorKey: "issuanceDate",
    header: "Fecha",
    cell: ({ row }) => {
      const date = new Date(row.getValue("issuanceDate"));
      return date.toLocaleDateString();
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => onDetailsClick(order)}
            className="h-8 w-8 p-0"
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

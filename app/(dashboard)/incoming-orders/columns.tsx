"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IncomingOrder, IncomingOrderStatus } from "@/types/incoming-order";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText } from "lucide-react";

const STATUS_STYLES: Record<IncomingOrderStatus, { bg: string; color: string }> = {
  Pendiente: { bg: '#EAECF0', color: '#6B7E8E' },
  Procesada: { bg: '#D1FAF0', color: '#0A8C69' },
  Fallida:   { bg: '#FEE2E2', color: '#B91C1C' },
};

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
    accessorKey: "company.description",
    header: "Compañía",
    cell: ({ row }) => row.original.company?.description || "-",
  },
  {
    accessorKey: "supplierId",
    header: "NIT",
  },
  {
    accessorKey: "issuanceDate",
    header: "Fecha factura",
    cell: ({ row }) => {
      const date = new Date(row.getValue("issuanceDate"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "createdAt",
    header: "Fecha de carga",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const datePart = date.toLocaleDateString();
      const timePart = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      return `${datePart} ${timePart}`;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = (row.getValue("status") as IncomingOrderStatus) ?? 'Pendiente';
      const style = STATUS_STYLES[status] ?? STATUS_STYLES.Pendiente;
      return (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: style.bg, color: style.color }}
        >
          {status}
        </span>
      );
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

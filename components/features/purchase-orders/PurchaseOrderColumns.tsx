"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { PurchaseOrder } from "../../../types/purchaseOrder";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import DatatableColumnHeader from "@/components/features/purchase-orders/PurchaseOrderColumnHeader";
import DatatableRowSelectionHeader from "@/components/features/purchase-orders/PurchaseOrderRowSelectionHeader";
import DatatableRowSelectionCell from "@/components/features/purchase-orders/PurchaseOrderDatatableRowSelectionCell";

export const columns: ColumnDef<PurchaseOrder>[] = [
  {
    id: "select",
    header: ({ table }) => <DatatableRowSelectionHeader table={table} />,
    cell: ({ row }) => <DatatableRowSelectionCell row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "externalId[].value.orderNumber",
    header: "OrderNumber",
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DatatableColumnHeader title="Name" column={column} />
    ),
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "company",
    accessorKey: "company.name",
    header: "Company",
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              navigator.clipboard.writeText(String(row.original["externalId[].value.orderNumber"]))
            }
          >
            Copy user ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>View user</DropdownMenuItem>
          <DropdownMenuItem>View company</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
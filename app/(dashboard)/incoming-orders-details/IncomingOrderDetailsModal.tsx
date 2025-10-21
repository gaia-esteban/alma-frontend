"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IncomingOrder } from "@/types/incoming-order";
import { IncomingOrderDetail } from "@/types/incoming-order-detail";

interface IncomingOrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: IncomingOrder | null;
}

export function IncomingOrderDetailsModal({
  open,
  onOpenChange,
  order,
}: IncomingOrderDetailsModalProps) {
  if (!order) return null;

  console.log('·······')
  console.log(order)

  const supplier = order.supplier as { name?: string } | undefined;
  const modalTitle = `${order.number} - ${supplier?.name || ""}`;

  const details = order.details || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">
            {modalTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {details.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay detalles disponibles
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Valor $</TableHead>
                    <TableHead className="text-right">Valor Total $</TableHead>
                    <TableHead className="text-right">Descuento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((detail: IncomingOrderDetail) => (
                    <TableRow key={detail.id}>
                      <TableCell className="font-medium">
                        {detail.description}
                      </TableCell>
                      <TableCell className="text-right">
                        {detail.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: order.currency || "COP",
                          minimumFractionDigits: 0,
                        }).format(detail.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: order.currency || "COP",
                          minimumFractionDigits: 0,
                        }).format(detail.totalPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {detail.discount}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  orderDetails: IncomingOrder | null;
}

export function IncomingOrderDetailsModal({
  open,
  onOpenChange,
  order,
  orderDetails,
}: IncomingOrderDetailsModalProps) {
  if (!order) return null;

  const supplier = order.supplier as { name?: string } | undefined;
  const modalTitle = `${order.number} - ${supplier?.name || ""}`;

  const details = orderDetails?.details || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-5xl lg:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">
            {modalTitle}
          </DialogTitle>
          <DialogDescription>
            Detalles de Factura de Entrada
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {details.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay detalles disponibles
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[240px] min-w-[240px]">Concepto</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Cantidad</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Valor $</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Valor Total $</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Descuento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((detail: IncomingOrderDetail) => (
                    <TableRow key={detail.id}>
                      <TableCell className="font-medium w-[240px] min-w-[240px] break-words whitespace-normal">
                        {detail.description}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {detail.quantity}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: orderDetails?.currency || "COP",
                          minimumFractionDigits: 0,
                        }).format(detail.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: orderDetails?.currency || "COP",
                          minimumFractionDigits: 0,
                        }).format(detail.totalPrice)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
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

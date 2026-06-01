// types/incoming-order.ts

import { IncomingOrderDetail } from './incoming-order-detail';

export type IncomingOrderStatus = 'Pendiente' | 'Procesada' | 'Fallida';

export interface IncomingOrder {
  id: number;
  number: string;
  issuanceDate: string;
  dueDate: string;
  purchaseOrder: string;
  paymentMethod: string;
  paymentForm: string;
  currency: string;
  supplierId: string;
  supplier: Record<string, unknown>;
  accountingNumber: string;
  costCenter: string;
  status?: IncomingOrderStatus;
  createdAt: string;
  updatedAt: string;
  details?: IncomingOrderDetail[];
}

// types/incoming-order.ts

import { IncomingOrderDetail } from './incoming-order-detail';

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
  createdAt: string;
  updatedAt: string;
  details?: IncomingOrderDetail[];
}

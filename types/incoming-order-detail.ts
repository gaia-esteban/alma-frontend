// types/incoming-order-detail.ts

export interface IncomingOrderDetail {
  id: number;
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  comments: string;
  sku: string;
  createdAt: string;
  updatedAt: string;
}

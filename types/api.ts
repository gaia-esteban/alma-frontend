// src/types/api.ts

export interface AuthOTPRequest {
  email: string;
  appType: string;
  passcode?: string;
}

export interface AuthOTPResponse {
  success: boolean;
  message?: string;
}

export interface AuthVerifyOTPRequest {
  email: string;
  appType: string;
  authType: string;
  otp: string;
  
}

export interface AuthVerifyOTPResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface LoginRequest {
  email: string;
  passcode?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface IncomingOrderDetail {
  id: number;
  invoice_id: number;
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
  supplier: any; // JSON RawMessage - can be typed more specifically if needed
  accountingNumber: string;
  costCenter: string;
  createdAt: string;
  updatedAt: string;
  details?: IncomingOrderDetail[];
}

export interface IncomingOrdersResponse {
  data: IncomingOrder[];
  total?: number;
}

export interface Supplier {
  id: number;
  company_id: number;
  identification: string;
  description?: string;
  debit_account?: string;
  credit_account?: string;
  tax_vat_account?: string;
  withholdings_account?: string;
  withholding_account?: string;
  withholdings_threshold?: number;
  withholdings_percentage?: number;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

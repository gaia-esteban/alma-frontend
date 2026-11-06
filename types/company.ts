export type AccountingSystem = 'contai' | 'siigo';

export interface Company {
  id: number;
  description: string;
  /** Accounting system exported invoices go to. Defaults to 'contai' on the backend. */
  accounting_system?: AccountingSystem;
  createdAt?: string;
  updatedAt?: string;
}

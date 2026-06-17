export interface EventLog {
  id: string | number;
  entity: 'INCOMING_ORDER' | 'APP' | 'SUPPLIER';
  eventName: 'LOGGED_IN' | 'ACCOUNTING_FILE_CREATED' | 'SUPPLIER_UPDATED';
  userId: number | null;
  userEmail: string | null;
  outcome: 'FAILED' | 'SUCCESS' | null;
  createdAt: string;
}

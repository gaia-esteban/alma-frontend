export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  active: boolean;
  status: string;
  company_access: string[];
  createdAt?: string;
  updatedAt?: string;
}

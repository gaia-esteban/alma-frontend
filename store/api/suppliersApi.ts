import { api, TagTypes } from './baseApi';
import { Supplier } from '@/types/supplier';

export interface SuppliersResponse {
  data: Supplier[];
  total: number;
}

export interface SupplierSingleResponse {
  success: boolean;
  message: string;
  data: { supplier: Supplier };
}

export interface SuppliersQueryParams {
  companyId?: string;
  is_active?: boolean;
  identification?: string;
  page?: number;
  limit?: number;
}

export interface SupplierCreateBody {
  companyId: number;
  identification: string;
  description?: string;
  debit_account?: string;
  credit_account?: string;
  tax_vat_account?: string;
  withholdings_account?: string;
  withholding_account?: string;
  withholdings_threshold?: number;
  withholdings_percentage?: number;
  is_active?: boolean;
}

export type SupplierUpdateBody = Partial<Omit<SupplierCreateBody, 'companyId'>>;

export const suppliersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<SuppliersResponse, SuppliersQueryParams>({
      query: (params = {}) => ({
        url: '/suppliers',
        method: 'GET',
        params,
      }),
      providesTags: [TagTypes.Supplier],
    }),

    getSupplierById: builder.query<SupplierSingleResponse, { id: number; companyId: string }>({
      query: ({ id, companyId }) => ({
        url: `/suppliers/${id}`,
        method: 'GET',
        params: { companyId },
      }),
      providesTags: (result, error, { id }) => [{ type: TagTypes.Supplier, id }],
    }),

    createSupplier: builder.mutation<SupplierSingleResponse, SupplierCreateBody>({
      query: (body) => ({
        url: '/suppliers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [TagTypes.Supplier],
    }),

    updateSupplier: builder.mutation<SupplierSingleResponse, { id: number; companyId: number; data: SupplierUpdateBody }>({
      query: ({ id, companyId, data }) => ({
        url: `/suppliers/${id}`,
        method: 'PATCH',
        body: { ...data, companyId },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: TagTypes.Supplier, id },
        TagTypes.Supplier,
      ],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
} = suppliersApi;

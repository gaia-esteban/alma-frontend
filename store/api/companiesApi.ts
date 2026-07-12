import { api } from './baseApi';
import { Company } from '@/types/company';

export interface CompaniesResponse {
  data: Company[];
  total: number;
}

export interface CompaniesQueryParams {
  page?: number;
  limit?: number;
  description?: string;
}

export const companiesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCompanies: builder.query<CompaniesResponse, CompaniesQueryParams>({
      query: (params = {}) => ({
        url: '/companies',
        method: 'GET',
        params,
      }),
    }),
  }),
});

export const { useGetCompaniesQuery } = companiesApi;

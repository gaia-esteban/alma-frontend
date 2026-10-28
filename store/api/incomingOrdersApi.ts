// store/api/incomingOrdersApi.ts
import { api, TagTypes } from "./baseApi";
import { IncomingOrder } from "@/types/incoming-order";

export interface IncomingOrdersResponse {
  data: IncomingOrder[];
  total: number;
}

export interface IncomingOrderByIdResponse {
  data: IncomingOrder;
  total: number;
}

export interface IncomingOrdersQueryParams {
  companyId: string;
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  orderBy?: string;
  order?: string;
  populate?: boolean;
}

export interface GetIncomingOrderByIdParams {
  id: number;
  companyId: string;
}

export interface ExportIncomingOrdersRequest {
  invoices: number[];
  consecutive: number;
  companyId: number;
}

export interface ExportIncomingOrdersResponse {
  message: string;
  success: boolean;
}

export interface IncomingOrdersStatsQueryParams {
  companyId: string;
  startDate: string;
  endDate: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

export interface InvoiceStatsByCompany {
  companyId: string;
  description: string;
  received: number;
  processed: number;
}

export interface InvoiceStatsByBucket {
  bucket: string;
  received: number;
  processed: number;
}

export interface IncomingOrdersStatsResponse {
  success: boolean;
  data: {
    totals: { received: number; processed: number };
    byCompany: InvoiceStatsByCompany[];
    byBucket: InvoiceStatsByBucket[];
  };
}

export const incomingOrdersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getIncomingOrdersStats: builder.query<IncomingOrdersStatsResponse, IncomingOrdersStatsQueryParams>({
      query: (params) => ({
        url: "/incoming-orders/stats",
        method: "GET",
        params: { granularity: 'day', ...params },
      }),
      providesTags: [TagTypes.IncomingOrder],
    }),
    getIncomingOrders: builder.query<IncomingOrdersResponse, IncomingOrdersQueryParams>({
      query: (params) => ({
        url: "/incoming-orders",
        method: "GET",
        params: {
          page: 1,
          limit: 50,
          orderBy: "created_at",
          order: "DESC",
          populate: false,
          ...params,
        },
      }),
      providesTags: [TagTypes.IncomingOrder],
    }),
    getIncomingOrderById: builder.query<IncomingOrderByIdResponse, GetIncomingOrderByIdParams>({
      query: ({ id, companyId }) => ({
        url: `/incoming-orders/${id}`,
        method: "GET",
        params: { companyId },
      }),
    }),
    exportIncomingOrders: builder.mutation<ExportIncomingOrdersResponse, ExportIncomingOrdersRequest>({
      query: (body) => ({
        url: "/incoming-orders/export",
        method: "POST",
        body,
      }),
      invalidatesTags: [TagTypes.IncomingOrder],
    }),
  }),
});

export const {
  useGetIncomingOrdersStatsQuery,
  useGetIncomingOrdersQuery,
  useLazyGetIncomingOrderByIdQuery,
  useExportIncomingOrdersMutation,
} = incomingOrdersApi;

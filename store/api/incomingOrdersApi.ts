// store/api/incomingOrdersApi.ts
import { api } from "./baseApi";
import { IncomingOrder } from "@/types/incoming-order";

export interface IncomingOrdersResponse {
  invoices: IncomingOrder[];
  total: number;
}

export interface IncomingOrdersQueryParams {
  offset?: number;
  limit?: number;
  orderBy?: string;
  populate?: boolean;
}

export interface ExportIncomingOrdersRequest {
  invoiceIds: number[];
  storage: string;
}

export interface ExportIncomingOrdersResponse {
  message: string;
  success: boolean;
}

export const incomingOrdersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getIncomingOrders: builder.query<IncomingOrdersResponse, IncomingOrdersQueryParams>({
      query: (params = {}) => ({
        url: "/incoming-orders",
        method: "GET",
        params: {
          offset: 0,
          limit: 100,
          orderBy: "created_at",
          populate: false,
          ...params,
        },
      }),
    }),
    getIncomingOrderById: builder.query<IncomingOrder, number>({
      query: (id) => ({
        url: `/incoming-orders/${id}`,
        method: "GET",
      }),
    }),
    exportIncomingOrders: builder.mutation<ExportIncomingOrdersResponse, ExportIncomingOrdersRequest>({
      query: (body) => ({
        url: `${process.env.NEXT_PUBLIC_WEBHOOK_URL}/webhook/56c344c0-d059-4c75-9fa9-eeeb1d2a5364`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetIncomingOrdersQuery,
  useLazyGetIncomingOrderByIdQuery,
  useExportIncomingOrdersMutation,
} = incomingOrdersApi;

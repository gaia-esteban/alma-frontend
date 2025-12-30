// store/api/incomingOrdersApi.ts
import { api } from "./baseApi";
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
  offset?: number;
  limit?: number;
  orderBy?: string;
  populate?: boolean;
}

export interface ExportIncomingOrdersRequest {
  invoices: number[];
  consecutive: string;
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
    getIncomingOrderById: builder.query<IncomingOrderByIdResponse, number>({
      query: (id) => ({
        url: `/incoming-orders/${id}`,
        method: "GET",
      }),
    }),
    exportIncomingOrders: builder.mutation<ExportIncomingOrdersResponse, ExportIncomingOrdersRequest>({
      query: (body) => ({
        url: "/incoming-orders/export",
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

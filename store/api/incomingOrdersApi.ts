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
  companyId: string;
  offset?: number;
  limit?: number;
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

export const incomingOrdersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getIncomingOrders: builder.query<IncomingOrdersResponse, IncomingOrdersQueryParams>({
      query: (params) => ({
        url: "/incoming-orders",
        method: "GET",
        params: {
          offset: 0,
          limit: 50,
          orderBy: "created_at",
          order: "DESC",
          populate: false,
          ...params,
        },
      }),
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
    }),
  }),
});

export const {
  useGetIncomingOrdersQuery,
  useLazyGetIncomingOrderByIdQuery,
  useExportIncomingOrdersMutation,
} = incomingOrdersApi;

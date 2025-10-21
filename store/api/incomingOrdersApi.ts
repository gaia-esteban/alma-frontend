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
  }),
});

export const { useGetIncomingOrdersQuery, useLazyGetIncomingOrderByIdQuery } = incomingOrdersApi;

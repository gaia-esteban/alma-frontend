// src/store/api/statusOrderApi.ts
import { api } from "./baseApi";

export interface StatusOrderItem {
  automatic: boolean;
  description: string;
  listingOrder: number;
  companyId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export interface StatusOrderResponse {
  items: StatusOrderItem[];
  total: number;
}

export interface StatusOrderQueryParams {
  orderBy?: string;
}

export const statusOrderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStatusOrder: builder.query<StatusOrderResponse, StatusOrderQueryParams>({
      query: (params = {}) => ({
        url: "/status",
        method: "GET",
        params: {
          orderBy: "listingOrder:ASC",
          ...params,
        },
      }),
    }),
  }),
});

export const { useGetStatusOrderQuery } = statusOrderApi;

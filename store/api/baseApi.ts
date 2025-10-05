// src/store/api/baseApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

export enum TagTypes {
  PurchaseOrder = "PurchaseOrder",
  Vendor = "Vendor",
  User = "User",
}

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  timeout: 35000,
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Obtener el estado completo de Redux
    const state = getState() as RootState;

    // Solo agregar Authorization si NO es un endpoint de auth
    const isAuthEndpoint = endpoint?.includes("auth");

    if (!isAuthEndpoint && state.auth.token) {
      headers.set("Authorization", `Bearer ${state.auth.token}`);
    }

    return headers;
  },
});

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: Object.values(TagTypes),
  endpoints: () => ({}),
});

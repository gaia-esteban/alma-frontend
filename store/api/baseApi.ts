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
    // Get the full Redux state
    const state = getState() as RootState;

    // Auth endpoint names that should NOT have Authorization header
    const authEndpoints = ["sendOtp", "verifyOtp", "login"];
    const isAuthEndpoint = endpoint ? authEndpoints.includes(endpoint) : false;

    // Add Authorization header for non-auth endpoints if token exists
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

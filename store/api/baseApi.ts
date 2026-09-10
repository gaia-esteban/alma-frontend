// src/store/api/baseApi.ts
import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";
import { sessionExpired } from "../slices/authSlice";

export enum TagTypes {
  PurchaseOrder = "PurchaseOrder",
  Vendor = "Vendor",
  User = "User",
  Supplier = "Supplier",
}

const rawBaseQuery = fetchBaseQuery({
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

// Wraps the raw query so an expired JWT triggers the session-expired modal
// app-wide, instead of every screen having to check for it individually.
const baseQueryWithSessionExpiry: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const data = result.error?.data as { message?: string } | undefined;
  if (result.error?.status === 401 && data?.message === "Token expired") {
    api.dispatch(sessionExpired());
  }
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithSessionExpiry,
  tagTypes: Object.values(TagTypes),
  endpoints: () => ({}),
});

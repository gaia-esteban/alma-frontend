import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export enum TagTypes {
  PurchaseOrder = 'PurchaseOrder',
  Vendor = 'Vendor',
  User = 'User',
}

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  timeout: 35000,
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: Object.values(TagTypes),
  endpoints: () => ({}),
});

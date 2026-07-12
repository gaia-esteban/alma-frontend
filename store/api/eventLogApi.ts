import { api } from "./baseApi";
import { EventLog } from "@/types/event-log";

export interface EventLogResponse {
  data: EventLog[];
  total: number;
}

export interface EventLogQueryParams {
  companyId: string;
  entity?: 'INCOMING_ORDER' | 'APP' | 'SUPPLIER';
  eventName?: 'LOGGED_IN' | 'ACCOUNTING_FILE_CREATED' | 'SUPPLIER_UPDATED';
  userId?: number;
  userEmail?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  orderBy?: 'ASC' | 'DESC';
  outcome?: string;
}

export const eventLogApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEventLog: builder.query<EventLogResponse, EventLogQueryParams>({
      query: (params) => ({
        url: "/events-log",
        method: "GET",
        params: {
          limit: 1000,
          orderBy: "ASC",
          ...params,
        },
      }),
    }),
  }),
});

export const { useGetEventLogQuery } = eventLogApi;

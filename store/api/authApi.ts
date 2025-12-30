// src/store/api/authApi.ts
import { api } from './baseApi';
import { AuthOTPRequest, AuthOTPResponse, AuthVerifyOTPRequest, AuthVerifyOTPResponse, LoginRequest, LoginResponse } from '@/types/api';

/**
 * Authentication API endpoints
 * Handles OTP-based authentication logic
 */
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Sends OTP to the user's email
     * @param body - Object with user email or phone
     * @returns { success: boolean, message?: string }
     */
    sendOtp: builder.mutation<AuthOTPResponse, AuthOTPRequest>({
      query: (body) => ({
        url: '/auth/otp',
        method: 'POST',
        body,
      }),
    }),

    /**
     * Verifies OTP and logs in the user
     */
    verifyOtp: builder.mutation<AuthVerifyOTPResponse, AuthVerifyOTPRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),

    /**
     * Validates user email before sending OTP
     * @param body - Object with user email
     * @returns { success: boolean, message?: string }
     */
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: 'auth/login',
        method: 'POST',
        body,
      }),
    }),

  }),
});

export const { useSendOtpMutation, useVerifyOtpMutation, useLoginMutation } = authApi;

// src/types/api.ts

export interface AuthOTPRequest {
  email: string;
  appType: string;
}

export interface AuthOTPResponse {
  success: boolean;
  message?: string;
}

export interface AuthVerifyOTPRequest {
  email: string;
  appType: string;
  authType: string;
  otp: string;
  
}

export interface AuthVerifyOTPResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

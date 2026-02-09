/**
 * User type definitions for authentication
 */

export interface User {
  email: string;
  loginTime: number; // Unix timestamp
  rememberMe: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface VerificationCode {
  code: string; // 4-digit code
  email: string;
  expiresAt: number; // Unix timestamp
}

export interface LoginResponse {
  success: boolean;
  email?: string;
  error?: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface SendCodeRequest {
  email: string;
}

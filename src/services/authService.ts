/**
 * Authentication service
 * Handles email verification and user authentication
 */

import type { SendCodeRequest, VerifyCodeRequest, LoginResponse } from '../types/user';
import { AUTH_CONFIG } from '../utils/constants';

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sends a 4-digit verification code to the user's email
 */
export async function sendVerificationCode(email: string): Promise<LoginResponse> {
  if (!isValidEmail(email)) {
    return { success: false, error: 'Invalid email address' };
  }

  try {
    const response = await fetch(AUTH_CONFIG.ENDPOINTS.SEND_CODE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email } as SendCodeRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to send code' };
    }

    // Store email in sessionStorage for verification step
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pending_verification_email', email);
    }

    return { success: true, email };
  } catch (error) {
    console.error('Send code error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Verifies the 4-digit code entered by the user
 */
export async function verifyCode(email: string, code: string, rememberMe: boolean = false): Promise<LoginResponse> {
  if (!email || !code) {
    return { success: false, error: 'Email and code are required' };
  }

  if (code.length !== AUTH_CONFIG.CODE_LENGTH) {
    return { success: false, error: 'Code must be 4 digits' };
  }

  if (!/^\d+$/.test(code)) {
    return { success: false, error: 'Code must contain only numbers' };
  }

  try {
    const response = await fetch(AUTH_CONFIG.ENDPOINTS.VERIFY_CODE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code, rememberMe } as VerifyCodeRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Invalid or expired code' };
    }

    // Clear pending verification email
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pending_verification_email');
    }

    return { 
      success: true, 
      email: data.email,
      token: data.token,
      rememberMe: data.rememberMe
    };
  } catch (error) {
    console.error('Verify code error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/**
 * Gets the pending verification email from sessionStorage
 */
export function getPendingEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('pending_verification_email');
}

/**
 * Clears the pending verification email
 */
export function clearPendingEmail(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('pending_verification_email');
}

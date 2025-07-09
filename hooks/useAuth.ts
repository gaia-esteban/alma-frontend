import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setUser, clearUser } from '@/store/slices/authSlice';

/**
 * useAuth hook
 * Centralized authentication logic for the app.
 * Handles user state via Redux and implements auth flows
 * like Google Sign-In and OTP verification.
 */
export function useAuth() {
  // Read user from Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  // Local loading and error states for auth processes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Simulates Google sign-in process
   */
  const signInWithGoogle = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    dispatch(setUser({ name: 'Google User' }));
    setLoading(false);
    alert('Google sign-in successful!');
  };

  /**
   * Simulates sending OTP to email
   * @param email email address
   */
  const sendOTP = async (email: string) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    return true;
  };

  /**
   * Simulates verifying an OTP
   * @param email email address
   * @param otp one-time password
   */
  const verifyOTP = async (email: string, otp: string) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    if (otp === '123456') {
      dispatch(setUser({ email }));
      alert('OTP verification successful!');
      return true;
    }
    setError('Invalid OTP. Try 123456');
    return false;
  };

  /**
   * Generic login function
   * @param userData any user data
   */
  const login = (userData: any) => {
    dispatch(setUser(userData));
  };

  /**
   * Logout and clear user from store
   */
  const logout = () => {
    dispatch(clearUser());
  };

  /**
   * Clears the current error
   */
  const clearError = () => setError(null);

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    sendOTP,
    verifyOTP,
    login,
    logout,
    clearError,
  };
}

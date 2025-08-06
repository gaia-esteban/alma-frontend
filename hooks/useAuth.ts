import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setUser, clearUser } from "@/store/slices/authSlice";
import { auth, provider, signInWithPopup } from "@/lib/auth";
import { OTP, SAVIA_CORE } from "@/lib/constants";
import { useSendOtpMutation, useVerifyOtpMutation } from "@/store/api/authApi";

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
  const [errorMessage, setErrorMessage] = useState("");

  const [sendOtp] = useSendOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const response = await signInWithPopup(auth, provider);
      console.log("🚀 ~ signInWithGoogle ~ response:", response.user);
      setLoading(false);
      //dispatch(setUser(result));
      return true;
    } catch (error: any) {
      console.error("Google sign-in failed", error);
      setError(error || "Google sign-in failed");
      setLoading(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sending OTP to email
   * @param email email address
   */
  const sendOTP = async (email: string) => {
    setLoading(true);
    try {
      const result = await sendOtp({ email, appType: SAVIA_CORE }).unwrap();
      setLoading(false);
      return result;
    } catch (error) {
      console.error("Error sending OTP", error);
      setLoading(false);
      setErrorMessage("Usuario no autorizado para ingresar");
      return false;
    }
  };

  /**
   * verifying an OTP
   * @param email email address
   * @param otp one-time password
   */
  const verifyOTP = async (email: string, otp: string) => {
    setLoading(true);

    try {
      const result = await verifyOtp({
        email,
        appType: SAVIA_CORE,
        authType: OTP,
        otp,
      }).unwrap();
      console.log("🚀 ~ verifyOTP ~ result:", result);
      //dispatch(setUser(result));
      setLoading(false);
      return result;
    } catch (error) {
      console.error("Error Verify OTP", error);
      setLoading(false);
      setError("Invalid OTP");
      return false;
    }
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
    errorMessage,
    setErrorMessage,
  };
}

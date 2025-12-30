"use client";

import { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useVerifyOtpMutation } from "@/store/api/authApi";
import { SAVIA_CORE, OTP } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OtpVerificationProps {
  email: string;
  onSuccess: (result: any) => void;
  onError?: (error: string) => void;
}

export function OtpVerification({ email, onSuccess, onError }: OtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    try {
      const result = await verifyOtp({
        email,
        appType: SAVIA_CORE,
        authType: OTP,
        otp,
      }).unwrap();

      onSuccess(result);
    } catch (err) {
      const error = err as { status?: number; data?: { message?: string } };
      const errorMessage = error?.data?.message || "Invalid OTP code";

      if (onError) {
        onError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <InputOTP
        maxLength={6}
        value={otp}
        onChange={setOtp}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || otp.length !== 6}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify OTP"
        )}
      </Button>
    </div>
  );
}

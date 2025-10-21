"use client";

import { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

interface OtpVerificationProps {
  onVerify: (otp: string) => void;
  loading?: boolean;
}

export function OtpVerification({ onVerify, loading }: OtpVerificationProps) {
  const [otp, setOtp] = useState("");

  const handleSubmit = () => {
    onVerify(otp);
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

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Verifying..." : "Verify OTP"}
      </Button>
    </div>
  );
}

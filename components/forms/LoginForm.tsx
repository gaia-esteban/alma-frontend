'use client';

import { useState } from 'react';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const startRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container',
        { size: 'invisible' },
        auth
      );
    }
  };

  const handleSendCode = async () => {
    setLoading(true);
    try {
      startRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      alert('OTP sent!');
    } catch (error) {
      console.error(error);
      alert('Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationResult) return;
    setLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(verificationCode);
      console.log('User:', userCredential.user);
      alert('Login successful!');
    } catch (error) {
      console.error(error);
      alert('Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 border rounded">
      <Input
        placeholder="Phone number (+1234567890)"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <Button onClick={handleSendCode} disabled={loading}>
        Send OTP
      </Button>

      {confirmationResult && (
        <>
          <Input
            placeholder="Enter OTP"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <Button onClick={handleVerifyCode} disabled={loading}>
            Verify OTP
          </Button>
        </>
      )}

      <div id="recaptcha-container"></div>
    </div>
  );
}

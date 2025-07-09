'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { colors } from '@/lib/colors';
import { Card } from '../ui/card';
import { CardContent } from '../ui/cardContent';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { CardHeader } from '../ui/cardHeader';
import { CardTitle } from '../ui/cardTitle';
import { CardDescription } from '../ui/cardDescription';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { loading, error, signInWithGoogle, sendOTP, verifyOTP, clearError } = useAuth();
  
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailSubmit = async () => {
    setFormErrors({}); 
    clearError();

    if (!email.trim()) {
      setFormErrors({ email: 'Email is required' });
      return;
    }

    if (!isValidEmail(email)) {
      setFormErrors({ email: 'Please enter a valid email address' });
      return;
    }

    const success = await sendOTP(email);
    if (success) {
      setStep('otp');
    }
  };

  const handleOTPSubmit = async () => {
    setFormErrors({});
    clearError();

    if (otp.length !== 6) {
      setFormErrors({ otp: 'OTP must be exactly 6 digits' });
      return;
    }

    await verifyOTP(email, otp);
  };

  const handleGoogleSignIn = async () => {
    setFormErrors({});
    clearError();
    await signInWithGoogle();
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setFormErrors({});
    clearError();
  };

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (formErrors.otp) {
      setFormErrors({ ...formErrors, otp: undefined });
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (formErrors.email) {
      setFormErrors({ ...formErrors, email: undefined });
    }
  };
 

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${colors.primary}0D, ${colors.secondary}0D)`
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo and App Info */}
        <div className="text-center mb-6 sm:mb-8">
          <div 
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
            style={{ backgroundColor: colors.primary }}
          >
            <span 
              className="font-bold text-lg sm:text-xl"
              style={{ color: colors.primaryForeground }}
            >
              S
            </span>
          </div>
          <h1 
            className="text-xl sm:text-2xl font-bold mb-1"
            style={{ color: colors.secondary }}
          >
            Savia 2.0
          </h1>
          <p 
            className="text-sm"
            style={{ color: colors.mutedForeground }}
          >
            Purchase Order Management
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {step === 'email' ? 'Welcome back' : 'Enter verification code'}
            </CardTitle>
            <CardDescription>
              {step === 'email' 
                ? 'Sign in to your account to continue' 
                : `We've sent a 6-digit code to ${email}`
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div 
                className="border rounded-md p-3"
                style={{ 
                  backgroundColor: `${colors.destructive}1A`,
                  borderColor: `${colors.destructive}33`
                }}
              >
                <p 
                  className="text-sm text-center"
                  style={{ color: colors.destructive }}
                >
                  {error}
                </p>
              </div>
            )}

            {/* Email Step */}
            {step === 'email' && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleEmailChange}
                      error={!!formErrors.email}
                      disabled={loading}
                      autoComplete="email"
                    />
                    {formErrors.email && (
                      <p 
                        className="text-sm"
                        style={{ color: colors.destructive }}
                      >
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    disabled={loading || !email.trim()}
                    onClick={handleEmailSubmit}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending code...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send verification code
                      </>
                    )}
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span 
                      className="w-full border-t"
                      style={{ borderColor: colors.border }}
                    />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span 
                      className="px-2 text-xs"
                      style={{ 
                        backgroundColor: colors.input,
                        color: colors.mutedForeground 
                      }}
                    >
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Sign In */}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={handleOTPChange}
                    error={!!formErrors.otp}
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    disabled={loading}
                    autoComplete="one-time-code"
                  />
                  {formErrors.otp && (
                    <p 
                      className="text-sm text-center"
                      style={{ color: colors.destructive }}
                    >
                      {formErrors.otp}
                    </p>
                  )}
                  <p 
                    className="text-xs text-center"
                    style={{ color: colors.mutedForeground }}
                  >
                    Try: 123456
                  </p>
                </div>
                
                <Button 
                  className="w-full" 
                  disabled={loading || otp.length !== 6}
                  onClick={handleOTPSubmit}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify and continue'
                  )}
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={handleBackToEmail}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to email
                </Button>

                {/* Resend OTP */}
                <div className="text-center">
                  <p 
                    className="text-sm"
                    style={{ color: colors.mutedForeground }}
                  >
                    Didn't receive the code?{' '}
                    <button 
                      type="button"
                      className="font-medium hover:underline"
                      style={{ color: colors.primary }}
                      onClick={() => sendOTP(email)}
                      disabled={loading}
                    >
                      Resend
                    </button>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terms and Privacy */}
        <div className="text-center mt-6 text-xs sm:text-sm px-4">
          <p style={{ color: colors.mutedForeground }}>
            By continuing, you agree to our{' '}
            <a 
              href="#" 
              className="hover:underline"
              style={{ color: colors.primary }}
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a 
              href="#" 
              className="hover:underline"
              style={{ color: colors.primary }}
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>

  );
}

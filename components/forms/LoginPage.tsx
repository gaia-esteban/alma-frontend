"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { colors } from "@/lib/colors";
import { Card } from "../ui/card";
import { CardContent } from "../ui/cardContent";
import { Mail, Loader2, AlertCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardHeader } from "../ui/cardHeader";
import { CardTitle } from "../ui/cardTitle";
import { CardDescription } from "../ui/cardDescription";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { FormErrors } from "@/types/login";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useVerifyOtpMutation } from "@/store/api/authApi";
import { toast } from "sonner";

export default function LoginPage() {
  const {
    loading,
    error,
    storeCredentials,
    clearError,
    errorMessage,
    setErrorMessage,
  } = useAuth();

  const [verifyPasscode, { isLoading: isVerifyingPasscode }] = useVerifyOtpMutation();
  const [email, setEmail] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [show401Modal, setShow401Modal] = useState(false);
  const [modal401Otp, setModal401Otp] = useState("");

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const router = useRouter();

  const handleEmailSubmit = async () => {
    setFormErrors({});
    clearError();

    if (!email.trim()) {
      setFormErrors({ email: "e-mail es requerido" });
      return;
    }

    if (!isValidEmail(email)) {
      setFormErrors({ email: "Por favor ingresa un e-mail válido" });
      return;
    }

    // Show 2FA modal directly
    setShow401Modal(true);
  };


  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (formErrors.email) {
      setFormErrors({ ...formErrors, email: undefined });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-8"
      style={{
        background: `linear-gradient(135deg, ${colors.primary}0D, ${colors.secondary}0D)`,
      }}
    >
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        {/* Logo and App Info */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-5 lg:mb-6"
            style={{ backgroundColor: colors.primary }}
          >
            <Image
              src="/Icono.jpg"
              alt="Savia Logo"
              width={40}
              height={40}
              className="object-contain w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
            />
          </div>
          <h1
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2"
            style={{ color: colors.secondary }}
          >
            AlMa Consulting
          </h1>
          <p className="text-sm md:text-base lg:text-lg" style={{ color: colors.mutedForeground }}>
            Automatización de Procesos Contables
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="p-4 sm:p-6 md:p-8">
            <CardTitle className="text-xl sm:text-2xl md:text-3xl">
              Ingreso
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Autentícate en la aplicación para continuar
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 md:space-y-6 p-4 pt-0 sm:p-6 sm:pt-0 md:p-8 md:pt-0">
            {/* Error Message */}
            {error && (
              <div
                className="border rounded-md p-3"
                style={{
                  backgroundColor: `${colors.destructive}1A`,
                  borderColor: `${colors.destructive}33`,
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
            <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Ingresa tu e-mail"
                      value={email}
                      onChange={handleEmailChange}
                      error={!!formErrors.email}
                      disabled={loading}
                      autoComplete="email"
                      className="h-12 md:h-14 text-base md:text-lg"
                    />
                    {formErrors.email && (
                      <p
                        className="text-sm md:text-base"
                        style={{ color: colors.destructive }}
                      >
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                  {errorMessage && (
                    <Alert
                      variant="destructive"
                      className="relative pr-10 mb-4"
                    >
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{errorMessage}</AlertDescription>
                      <button
                        onClick={() => setErrorMessage("")}
                        className="absolute right-2 top-2 text-sm text-muted-foreground hover:text-foreground"
                        aria-label="Cerrar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Alert>
                  )}

                  <Button
                    className="w-full h-12 md:h-14 text-base md:text-lg"
                    disabled={loading || !email.trim()}
                    onClick={handleEmailSubmit}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                        Sending code...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Solicitar código OTP
                      </>
                    )}
                  </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 401 Error Modal with OTP Input */}
      <Dialog open={show401Modal} onOpenChange={setShow401Modal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verificación requerida</DialogTitle>
            <DialogDescription>
              Ingresa el código de 6 dígitos de tu aplicación authenticator
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <InputOTP
              maxLength={6}
              value={modal401Otp}
              onChange={setModal401Otp}
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
              onClick={async () => {
                if (modal401Otp.length === 6) {
                  try {
                    const result = await verifyPasscode({
                      email,
                      otp: modal401Otp,
                      appType: "web",
                      authType: "otp",
                    }).unwrap();

                    // Store credentials in Redux
                    storeCredentials(result);

                    // Success - redirect to incoming-orders
                    setShow401Modal(false);
                    setModal401Otp("");
                    router.push("/incoming-orders");
                  } catch (err) {
                    const error = err as { status?: number; data?: { message?: string } };
                    if (error?.status === 401) {
                      toast.error("El código ingresado no es válido");
                    } else {
                      toast.error(error?.data?.message || "Error al verificar el código");
                    }
                  }
                }
              }}
              disabled={modal401Otp.length !== 6 || isVerifyingPasscode}
              className="w-full"
            >
              {isVerifyingPasscode ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

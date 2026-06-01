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
import { Loader2, AlertCircle, X, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
      setFormErrors({ email: "El e-mail es requerido" });
      return;
    }
    if (!isValidEmail(email)) {
      setFormErrors({ email: "Por favor ingresa un e-mail válido" });
      return;
    }
    setShow401Modal(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (formErrors.email) {
      setFormErrors({ ...formErrors, email: undefined });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Brand panel ─────────────────────────────── */}
      <div
        className="relative flex flex-col p-8 lg:p-12 overflow-hidden lg:min-h-screen lg:w-[44%]"
        style={{
          background: `linear-gradient(180deg, #1a4a6e 0%, #1a3a55 45%, ${colors.secondary} 100%)`,
        }}
      >
        {/* Decorative rings */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full border"
          style={{ borderColor: `${colors.primary}18` }} />
        <div className="pointer-events-none absolute -top-16 -right-16 w-[280px] h-[280px] rounded-full border"
          style={{ borderColor: `${colors.primary}0C` }} />
        <div className="pointer-events-none absolute top-1/3 -left-20 w-[300px] h-[300px] rounded-full"
          style={{ background: `radial-gradient(circle, #1e5a8040 0%, transparent 70%)` }} />
        <div className="pointer-events-none absolute -bottom-28 -left-28 w-[360px] h-[360px] rounded-full border"
          style={{ borderColor: `${colors.primary}0A` }} />

        {/* Logo */}
        <div className="relative z-10 mb-auto">
          <Image
            src="/alma_firma_consultora_logo.jpeg"
            alt="AlMa Firma Consultora"
            width={88}
            height={88}
            className="rounded-xl"
          />
        </div>

        {/* Headline */}
        <div className="relative z-10 py-8">
          <span
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] mb-6"
            style={{ color: colors.primary }}
          >
            <span className="w-5 h-px bg-current" />
            Plataforma Contable
          </span>
          <h1 className="text-3xl lg:text-[2.6rem] font-bold text-white leading-tight tracking-tight mb-4">
            AlMa Digital: más simple,<br />
            más ágil, <span style={{ color: colors.primary }}>en tiempo real.</span>
          </h1>
          <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.48)' }}>
            Automatiza procesos contables manuales, ahorrá tiempo e invertilo en análisis, proyecciones y otras actividades de valor agregado.
          </p>
        </div>
      </div>

      {/* ── Form panel ──────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-8 lg:p-16 lg:min-h-screen"
        style={{ backgroundColor: colors.background }}
      >
        <div className="w-full max-w-sm">

          {/* Form header */}
          <div className="mb-8">
            <h2
              className="text-2xl font-bold tracking-tight mb-2"
              style={{ color: colors.foreground }}
            >
              Bienvenido
            </h2>
            <p className="text-sm" style={{ color: colors.mutedForeground }}>
              Accede a AlMa-digital de manera segura con un código de un solo uso (OTP).
            </p>
          </div>

          {/* API error */}
          {error && (
            <div
              className="rounded-lg p-3 mb-5 text-sm text-center"
              style={{
                backgroundColor: `${colors.destructive}18`,
                borderColor: `${colors.destructive}30`,
                color: colors.destructive,
                border: '1px solid',
              }}
            >
              {error}
            </div>
          )}

          {/* Alert error */}
          {errorMessage && (
            <Alert variant="destructive" className="relative pr-10 mb-5">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
              <button
                onClick={() => setErrorMessage("")}
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </Alert>
          )}

          {/* Email field */}
          <div className="space-y-2 mb-5">
            <label
              className="block text-sm font-semibold"
              style={{ color: colors.foreground }}
            >
              Correo electrónico
            </label>
            <Input
              type="email"
              placeholder="tu@empresa.com"
              value={email}
              onChange={handleEmailChange}
              error={!!formErrors.email}
              disabled={loading}
              autoComplete="email"
              onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
            />
            {formErrors.email && (
              <p className="text-xs" style={{ color: colors.destructive }}>
                {formErrors.email}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            className="w-full"
            disabled={loading || !email.trim()}
            onClick={handleEmailSubmit}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando código...
              </>
            ) : (
              <>
                Solicitar código OTP
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-xs text-center mt-5" style={{ color: colors.mutedForeground }}>
            Recibirás un código de 6 dígitos en tu correo.
          </p>
        </div>
      </div>

      {/* ── OTP Dialog ──────────────────────────────── */}
      <Dialog open={show401Modal} onOpenChange={setShow401Modal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verificación requerida</DialogTitle>
            <DialogDescription>
              Ingresá el código de 6 dígitos enviado a {email || 'tu correo'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-5 py-4">
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
                    storeCredentials(result);
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
                "Verificar e ingresar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

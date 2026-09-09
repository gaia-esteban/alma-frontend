"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { clearUser } from "@/store/slices/authSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { colors } from "@/lib/colors";

const COUNTDOWN_SECONDS = 5;

export function SessionExpiredModal() {
  const isSessionExpired = useAppSelector(state => state.auth.isSessionExpired);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!isSessionExpired) {
      setSecondsLeft(COUNTDOWN_SECONDS);
      return;
    }

    const timer = setTimeout(() => {
      if (secondsLeft <= 1) {
        const query = searchParams.toString();
        const currentPath = query ? `${pathname}?${query}` : pathname;
        dispatch(clearUser());
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      } else {
        setSecondsLeft(s => s - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSessionExpired, secondsLeft]);

  return (
    <Dialog open={isSessionExpired} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Tu sesión ha expirado</DialogTitle>
          <DialogDescription>
            Por seguridad, cerramos tu sesión. Serás redirigido a la página de inicio de sesión para volver a ingresar tus credenciales.
          </DialogDescription>
        </DialogHeader>
        <p className="text-center text-sm" style={{ color: colors.mutedForeground }}>
          Redirigiendo en <span className="font-bold" style={{ color: colors.foreground }}>{secondsLeft}</span>…
        </p>
      </DialogContent>
    </Dialog>
  );
}

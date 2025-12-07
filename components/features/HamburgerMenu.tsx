'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Package, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/lib/colors';

export function HamburgerMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  const handleNavigation = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
        <nav className="flex flex-col gap-2 mt-8">
          <Button
            variant="ghost"
            className="justify-start text-base py-6"
            onClick={() => handleNavigation('/home')}
          >
            <Home className="mr-3 h-5 w-5" />
            Inicio
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-base py-6"
            onClick={() => handleNavigation('/incoming-orders')}
          >
            <Package className="mr-3 h-5 w-5" />
            Facturas de entrada
          </Button>

          <Separator className="my-4" />

          <Button
            variant="ghost"
            className="justify-start text-base py-6 hover:bg-red-50"
            onClick={handleLogout}
            style={{ color: colors.destructive }}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar sesión
          </Button>
        </nav>

        {user && (
          <div className="absolute bottom-8 left-6 right-6">
            <div className="bg-slate-100 rounded-lg p-4">
              <p className="text-xs text-slate-600 font-medium">Sesión iniciada como</p>
              <p className="text-sm font-semibold mt-1 truncate">
                {user.email || 'Usuario'}
              </p>
              {user.displayName && (
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {user.displayName}
                </p>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, FileText, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/lib/colors';
import Image from 'next/image';

const navItems = [
  { label: 'Inicio', href: '/home', icon: Home },
  { label: 'Facturas de entrada', href: '/incoming-orders', icon: FileText },
];

export function HamburgerMenu() {
  const router = useRouter();
  const pathname = usePathname();
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
        <button
          className="flex items-center justify-center w-9 h-9 rounded-md transition-colors"
          style={{ color: 'rgba(255,255,255,0.75)' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-72 p-0 border-r-0"
        style={{
          backgroundColor: colors.secondary,
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        <SheetTitle className="sr-only">Menú de navegación</SheetTitle>

        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Image
            src="/alma_firma_consultora_logo.jpeg"
            alt="AlMa"
            width={36}
            height={36}
            className="rounded-md flex-shrink-0"
          />
          <span className="text-white font-semibold text-sm tracking-wide">AlMa Consulting</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 p-3 mt-2">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname?.startsWith(href + '/');
            return (
              <button
                key={href}
                onClick={() => handleNavigation(href)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors"
                style={{
                  backgroundColor: isActive ? `${colors.primary}22` : 'transparent',
                  color: isActive ? colors.primary : 'rgba(255,255,255,0.55)',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                  if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div
          className="absolute bottom-0 left-0 right-0 p-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium mb-2 transition-colors"
            style={{ color: colors.destructive }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            Cerrar sesión
          </button>

          {user && (
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ backgroundColor: colors.primary, color: colors.secondary }}
              >
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {user.displayName || 'Usuario'}
                </div>
                <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {user.email}
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

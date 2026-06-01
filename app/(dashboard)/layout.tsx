import Image from 'next/image';
import { HamburgerMenu } from '@/components/features/HamburgerMenu';
import { colors } from '@/lib/colors';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <header
        className="sticky top-0 z-50 w-full"
        style={{ backgroundColor: colors.secondary, borderBottom: `1px solid rgba(255,255,255,0.07)` }}
      >
        <div className="container flex h-16 items-center px-4 gap-3">
          <HamburgerMenu />
          <Image
            src="/alma_firma_consultora_logo.jpeg"
            alt="AlMa Firma Consultora"
            width={36}
            height={36}
            className="rounded-md"
          />
          <span className="text-white font-semibold text-sm hidden sm:block tracking-wide">
            AlMa Consulting
          </span>
        </div>
      </header>
      <main className="container py-4 px-4 md:py-6 md:px-6">
        {children}
      </main>
    </div>
  );
}

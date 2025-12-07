import { HamburgerMenu } from '@/components/features/HamburgerMenu';

/**
 * Dashboard Layout
 *
 * Provides consistent spacing for all dashboard pages.
 *
 * Layout provides: py-4 px-4 md:py-6 md:px-6
 *
 * IMPORTANT: Individual pages should NOT add their own padding.
 * Pages should use className="w-full" on their root container.
 * This ensures consistent positioning across all dashboard pages.
 *
 * Example:
 * ```tsx
 * export default function MyPage() {
 *   return (
 *     <div className="w-full space-y-6">
 *       <h1>My Page Title</h1>
 *       // ... rest of page content
 *     </div>
 *   );
 * }
 * ```
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <HamburgerMenu />
          <div className="ml-4 flex items-center">
            <h1 className="text-lg font-semibold md:text-xl">AlMa Consulting</h1>
          </div>
        </div>
      </header>
      <main className="container py-4 px-4 md:py-6 md:px-6">
        {children}
      </main>
    </div>
  );
}

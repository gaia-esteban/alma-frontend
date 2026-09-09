import { Suspense } from 'react';
import LoginPage from '@/components/forms/LoginPage';

export default function Login() {
  return (
    <main style={{ background: 'linear-gradient(180deg, #1a4a6e 0%, #1a3a55 45%, #172c3b 100%)' }}>
      <Suspense fallback={null}>
        <LoginPage />
      </Suspense>
    </main>
  );
}

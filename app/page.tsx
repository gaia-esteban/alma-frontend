import { Suspense } from "react";
import LoginPage from "@/components/forms/LoginPage";

export default function Home() {
  return (
    <main className="flex justify-center items-center min-h-screen">
      <Suspense fallback={null}>
        <LoginPage />
      </Suspense>
    </main>
  );
}

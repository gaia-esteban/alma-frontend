'use client';


import { Provider } from "react-redux";
import { Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import { store } from "./";
import { hydrate, setHydrated } from "./slices/authSlice";
import * as authStorage from "@/lib/authStorage";
import { SessionExpiredModal } from "@/components/auth/SessionExpiredModal";


interface Props {
  children: React.ReactNode;
}


// Internal component to handle client-side hydration
function AuthHydration({ children }: Props) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Only runs on client after mount
    const savedAuth = authStorage.loadAuthSession();
    if (savedAuth) {
      dispatch(hydrate(savedAuth));
    } else {
      // Even if no saved session, mark as hydrated so app can proceed
      dispatch(setHydrated());
    }
  }, []); // Run only once on mount

  return <>{children}</>;
}


export const Providers = ({ children }: Props) => {
  return (
    <Provider store={store}>
      <AuthHydration>
        {children}
        <Suspense fallback={null}>
          <SessionExpiredModal />
        </Suspense>
      </AuthHydration>
    </Provider>
  );
}
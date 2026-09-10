import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  user: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    providerId?: string;
    companyAccess: string[];
    role?: string;
  } | null;
  token: string;
  isHydrated: boolean;
  isSessionExpired: boolean;
}

const initialState: AuthState = {
  user: null,
  token: "",
  isHydrated: false,
  isSessionExpired: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isHydrated = true;
      state.isSessionExpired = false;
    },
    clearUser(state) {
      state.user = null;
      state.token = "";
      state.isHydrated = true;
      state.isSessionExpired = false;
    },
    hydrate(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isHydrated = true;
      state.isSessionExpired = false;
    },
    setHydrated(state) {
      state.isHydrated = true;
    },
    sessionExpired(state) {
      state.isSessionExpired = true;
    },
  },
});

export const { setUser, clearUser, hydrate, setHydrated, sessionExpired } = authSlice.actions;
export default authSlice.reducer;

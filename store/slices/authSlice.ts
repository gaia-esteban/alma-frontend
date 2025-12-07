import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  user: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    providerId?: string;
  } | null;
  token: string;
  isHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: "",
  isHydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isHydrated = true;
    },
    clearUser(state) {
      state.user = null;
      state.token = "";
      state.isHydrated = true;
    },
    hydrate(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isHydrated = true;
    },
    setHydrated(state) {
      state.isHydrated = true;
    },
  },
});

export const { setUser, clearUser, hydrate, setHydrated } = authSlice.actions;
export default authSlice.reducer;

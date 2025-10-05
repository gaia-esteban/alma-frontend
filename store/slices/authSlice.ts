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
}

const initialState: AuthState = {
  user: null,
  token: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearUser(state) {
      state.user = null;
      state.token = "";
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;

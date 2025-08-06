import { createSlice } from '@reduxjs/toolkit';

interface AuthState {
  user: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    providerId?: string;
  } | null;
  meta?: Record<string, any>;
}


const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
    },
    clearUser(state) {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;

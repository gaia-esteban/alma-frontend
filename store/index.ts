// src/store/index.ts

import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import authSlice from './slices/authSlice';

// Crea el store de Redux
export const store = configureStore({
  reducer: {
    api: api.reducer,
    auth: authSlice,
    // Aquí irán otros slices que crees en el futuro, como uiSlice, etc.
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['api/executeQuery/fulfilled'],
      },
    }).concat(api.middleware),
});

// ✅ Tipos globales para TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

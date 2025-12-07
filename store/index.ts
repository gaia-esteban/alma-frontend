import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import masterData from "./slices/masterDataSlice";
import { api } from "./api/baseApi";
import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";
import authPersistenceMiddleware from "./middleware/authPersistenceMiddleware";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    masterData: masterData,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(api.middleware)
      .prepend(authPersistenceMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

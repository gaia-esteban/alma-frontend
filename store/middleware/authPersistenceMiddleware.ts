// store/middleware/authPersistenceMiddleware.ts
// RTK listener middleware for auto-syncing Redux state to localStorage

import { createListenerMiddleware } from '@reduxjs/toolkit';
import { setUser, clearUser } from '../slices/authSlice';
import * as authStorage from '@/lib/authStorage';

const authPersistenceMiddleware = createListenerMiddleware();

// Listen to setUser action and save to localStorage
authPersistenceMiddleware.startListening({
  actionCreator: setUser,
  effect: (action) => {
    if (action.payload.token && action.payload.user) {
      authStorage.saveAuthToken(action.payload.token);
      authStorage.saveUser(action.payload.user);
    }
  },
});

// Listen to clearUser action and clear localStorage
authPersistenceMiddleware.startListening({
  actionCreator: clearUser,
  effect: () => {
    authStorage.clearAuthStorage();
  },
});

export default authPersistenceMiddleware;

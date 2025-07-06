import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setUser, clearUser } from '@/store/slices/authSlice';

export function useAuth() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  const login = (userData: any) => {
    dispatch(setUser(userData));
  };

  const logout = () => {
    dispatch(clearUser());
  };

  return { user, login, logout };
}

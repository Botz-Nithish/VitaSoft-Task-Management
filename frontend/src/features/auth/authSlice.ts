import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../../types/auth.types';

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  email: string | null;
  name: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  userId: null,
  email: null,
  name: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<AuthUser>) => {
      state.accessToken = action.payload.accessToken;
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.accessToken = null;
      state.userId = null;
      state.email = null;
      state.name = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

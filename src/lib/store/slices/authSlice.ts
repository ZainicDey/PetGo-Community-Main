import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
}

/**
 * Temporary hardcoded JWT for development.
 * Replace with a proper login flow when auth UI is implemented.
 */
const TEMP_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkxNzUxNjU3LCJpYXQiOjE3ODkxNTk2NTgsImp0aSI6IjNhMjEyNTdjZDViOTQ0NWNhNTM4MjdkNDc2NTZiODY0IiwidXNlcl9pZCI6IjEifQ.rCn5eUXQU6Y_dqGjO67z7_k_6d8QCf3tZHccowxU7Uo';

const initialState: AuthState = {
  token: TEMP_JWT,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    clearToken(state) {
      state.token = null;
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;

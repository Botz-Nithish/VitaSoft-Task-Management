import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type TransitionType = 'LOGIN' | 'LOGOUT' | 'INTERNAL' | null;

interface TransitionState {
  activeTransition: TransitionType;
}

const initialState: TransitionState = {
  activeTransition: null,
};

const transitionSlice = createSlice({
  name: 'transition',
  initialState,
  reducers: {
    startTransition: (state, action: PayloadAction<TransitionType>) => {
      state.activeTransition = action.payload;
    },
    endTransition: (state) => {
      state.activeTransition = null;
    },
  },
});

export const { startTransition, endTransition } = transitionSlice.actions;
export default transitionSlice.reducer;

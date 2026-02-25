import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PendingState {
    pending: boolean;
}

const initialState: PendingState = { pending: false }

const pendingSlice = createSlice({
  name: 'pending',
  initialState,
  reducers: {
    setPending: state => {
      state.pending = true;
    },
    clearPending: state => {
      state.pending = false;
    },
  },
});

export const { setPending, clearPending } = pendingSlice.actions;
export default pendingSlice.reducer; 
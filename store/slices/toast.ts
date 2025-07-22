import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ToastType = "success" | "alert" | "error" | "info";

interface ToastI {
  id: string;
  toastOpenState: boolean;
  headerToast?: ToastType | "";
  messageToast?: string;
}

interface ToastState {
  toasts: ToastI[];
}

const initialState: ToastState = {
  toasts: [],
};

export const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    // Add new toast
    pushToast: (
      state,
      action: PayloadAction<{
        headerToast?: ToastType;
        messageToast?: string;
      }>
    ) => {
      state.toasts.push({
        id: Date.now().toString() + Math.random().toString().slice(2, 8), // unique
        toastOpenState: true,
        headerToast: action.payload.headerToast ?? "",
        messageToast: action.payload.messageToast ?? "",
      });
    },
    // Remove toast by id
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    // Clear all
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { pushToast, removeToast, clearToasts } = toastSlice.actions;
export default toastSlice.reducer;

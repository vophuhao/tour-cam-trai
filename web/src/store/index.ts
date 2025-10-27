import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// ✅ Export type để dùng toàn cục
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

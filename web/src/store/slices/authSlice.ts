import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login, refreshToken, register } from "../../lib/api";

// ================== Thunk ==================
export const refreshTokenThunk = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await refreshToken();
      
      return response;// lấy thẳng data từ API
    } catch (error: any) {
      return rejectWithValue(error.message || "Refresh token thất bại.");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await login({ email, password });
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || "Đăng nhập thất bại.");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    {
      email,
      username,
      password,
      confirmPassword,
    }: {
      email: string;
      username: string;
      password: string;
      confirmPassword: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await register({
        email,
        username,
        password,
        confirmPassword,
      });
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || "Đăng ký thất bại.");
    }
  }
);

// ================== Slice ==================
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null as any, // không định nghĩa riêng User
    isLoading: false,
    role: null as string | null,
    error: null as string | null,
    isRegistered: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetRegistered: (state) => {
      state.isRegistered = false;
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.role = action.payload.data.role;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isRegistered = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Refresh Token
      .addCase(refreshTokenThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.role = action.payload.data.role;
      })
      .addCase(refreshTokenThunk.rejected, (state, action) => {
        state.error = action.payload as string;
        state.user = null;
      })

  },
});

export const { clearError, resetRegistered, setUser, logout } =
  authSlice.actions;
export default authSlice.reducer;

import axios, { AxiosError, AxiosResponse } from "axios";

import { UNAUTHORIZED } from "../constants/http"; // nếu được, đổi sang .ts hoặc .ts const
import { navigate } from "../lib/navigation";
import queryClient from "./queryClient";

// cấu hình chung cho axios
const options = {
  baseURL: process.env.NEXT_PUBLIC_API_URL as string,
  withCredentials: true,
};

// client riêng cho refresh token để tránh loop
const TokenRefreshClient = axios.create(options);
TokenRefreshClient.interceptors.response.use(
  (response: AxiosResponse) => response.data
);

const API = axios.create(options);

API.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError) => {
    const { config, response } = error;
    const status = response?.status;
    const data: any = response?.data;

    if (status === UNAUTHORIZED && data?.code === "INVALID_ACCESS_TOKEN") {
      try {
        // refresh access token xong retry request cũ
        await TokenRefreshClient.get("/auth/refresh");
        if (config) {
          return TokenRefreshClient(config);
        }
      } catch (refreshError) {
        queryClient.clear();
        navigate("/home", {
          state: { redirectUrl: window.location.pathname },
        });
      }
    }

    return Promise.reject({
      status,
      ...data,
    });
  }
);

export default API;

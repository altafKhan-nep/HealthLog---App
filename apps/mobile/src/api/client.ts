import axios from "axios";
import { Platform } from "react-native";

const BASE_URL = Platform.select({
  web: "http://localhost:4000",
  default: "http://10.100.10.95:4000",
});

export const API_BASE_URL = BASE_URL!;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export function setAuthToken(token: string) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAuthToken() {
  delete apiClient.defaults.headers.common.Authorization;
}

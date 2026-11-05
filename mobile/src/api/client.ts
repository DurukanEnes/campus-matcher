import axios from "axios";

// Set EXPO_PUBLIC_API_URL in mobile/.env when the staging API is available.
export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000",
  timeout: 10000,
});

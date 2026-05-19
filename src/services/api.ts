import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333",
  withCredentials: true,
});

/** Exported so tests can spy on it without fighting jsdom's non-configurable window.location */
export const redirect = (url: string): void => {
  globalThis.window.location.href = url;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      redirect("/login?expired=1");
    }
    return Promise.reject(error);
  }
);

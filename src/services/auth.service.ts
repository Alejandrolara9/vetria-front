import { api } from "./api";

interface LoginDTO {
  email: string;
  password: string;
}

export async function login(data: LoginDTO) {
  const response = await api.post("/auth/login", data);
  return response.data;
}
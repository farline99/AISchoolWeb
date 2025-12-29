import client from "./client";

export const authApi = {
  login: (login, password, remember) =>
    client.post("/api/auth/login", { login, password, remember }),

  logout: () => client.get("/api/auth/logout"),

  getMe: () => client.get("/api/auth/me"),

  changePassword: (password) =>
    client.post("/api/auth/change_password", { password }),
};

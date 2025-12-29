import client from "./client";

export const achievementsApi = {
  create: (data) => client.post("/api/achievements", data),
  update: (data) => client.put("/api/achievements", data),
  delete: (id) => client.delete("/api/achievements", { data: { id } }),
};

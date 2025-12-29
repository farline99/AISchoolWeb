import client from "./client";

export const teachersApi = {
  getAll: () => client.get("/api/teachers"),

  create: (data) => client.post("/api/teachers", data),

  update: (data) => client.put("/api/teachers", data),

  delete: (id) => client.delete("/api/teachers", { data: { id } }),

  getClasses: () =>
    client.get("/api/teacher/data", { params: { action: "classes" } }),
  getDisciplines: (classId) =>
    client.get("/api/teacher/data", {
      params: { action: "disciplines", class_id: classId },
    }),
};

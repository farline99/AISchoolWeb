import client from "./client";

export const classesApi = {
  getAll: () => client.get("/api/classes"),

  create: (data) => client.post("/api/classes", data),

  updateHeadTeacher: (data) => client.put("/api/classes", data),
};

export const studentsApi = {
  getByClass: (classId) => client.get(`/api/students?class_id=${classId}`),

  getById: (studentId) => client.get(`/api/students?student_id=${studentId}`),

  create: (data) => client.post("/api/students", data),

  update: (data) => client.put("/api/students", data),

  transfer: (id, newClassId) =>
    client.put("/api/students", { id, new_class_id: newClassId }),

  updateCredentials: (id, login, password) =>
    client.put("/api/students", { action: "credentials", id, login, password }),

  delete: (id) => client.delete("/api/students", { data: { id } }),
};

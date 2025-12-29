import client from "./client";

export const parentsApi = {
  getAvailable: (studentId) =>
    client.get(`/api/parents?student_id=${studentId}`),

  create: (data) => client.post("/api/parents", data),

  getLinked: (studentId) =>
    client.get(`/api/student_parents?student_id=${studentId}`),

  link: (studentId, parentId) =>
    client.post("/api/student_parents", {
      student_id: studentId,
      parent_id: parentId,
    }),

  unlink: (studentId, parentId) =>
    client.delete("/api/student_parents", {
      data: { student_id: studentId, parent_id: parentId },
    }),
};

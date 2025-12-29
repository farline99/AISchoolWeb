import client from "./client";

export const academicYearsApi = {
  getAll: () => client.get("/api/academic_years"),
  create: (data) => client.post("/api/academic_years", data),
  updateStatus: (id, status) =>
    client.put("/api/academic_years", { id, status }),
  promote: (currentId, nextId) =>
    client.post("/api/academic_years", {
      action: "promote",
      current_year_id: currentId,
      next_year_id: nextId,
    }),
};

export const disciplinesApi = {
  getAll: () => client.get("/api/disciplines"),
  create: (data) => client.post("/api/disciplines", data),
  delete: (id) => client.delete("/api/disciplines", { data: { id } }),
};

export const studyPlansApi = {
  getAll: () => client.get("/api/study_plans"),
  getItems: (planId) => client.get(`/api/study_plans?plan_id=${planId}`),
  createPlan: (data) => client.post("/api/study_plans", data),
  upsertItem: (data) => client.post("/api/study_plans", data),
  deleteItem: (itemId) =>
    client.delete("/api/study_plans", { data: { item_id: itemId } }),
};

export const workloadApi = {
  get: (classId, yearId) =>
    client.get(`/api/workload?class_id=${classId}&year_id=${yearId}`),
  assign: (data) => client.post("/api/workload", data),
  remove: (classId, disciplineId, yearId) =>
    client.delete("/api/workload", {
      data: { class_id: classId, discipline_id: disciplineId, year_id: yearId },
    }),
};

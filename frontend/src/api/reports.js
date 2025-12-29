import client from "./client";

export const reportsApi = {
  getPerformance: (yearId, start, end) =>
    client.get(
      `/api/reports?type=performance&year_id=${yearId}&start=${start}&end=${end}`
    ),

  getTeachersWorkload: (yearId) =>
    client.get(`/api/reports?type=teachers&year_id=${yearId}`),

  getMovement: (start, end) =>
    client.get(`/api/reports?type=movement&start=${start}&end=${end}`),
};

export const journalApi = {
  get: (classId, disciplineId, month, year) =>
    client.get(
      `/api/teacher/journal?class_id=${classId}&discipline_id=${disciplineId}&month=${month}&year=${year}`
    ),

  saveGrade: (data) => client.post("/api/teacher/journal", data),

  updateTopic: (data) => client.put("/api/teacher/journal", data),
};

export const profileApi = {
  getInfo: (params) => client.get("/api/student/profile/info", { params }),
  getGrades: (params) => client.get("/api/student/profile/grades", { params }),
  getAchievements: (params) =>
    client.get("/api/student/profile/achievements", { params }),
};

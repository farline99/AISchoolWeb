import client from "./client";

export const userApi = {
  uploadAvatar: (formData) =>
    client.post("/api/upload_avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteAvatar: (role, id) => client.post("/api/delete_avatar", { role, id }),
};

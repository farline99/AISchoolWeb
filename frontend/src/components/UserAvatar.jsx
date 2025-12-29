import { Avatar, Upload, message, Button, Modal } from "antd";
import {
  UserOutlined,
  LoadingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { userApi } from "../api/user";

const UserAvatar = ({
  src,
  size = 64,
  name,
  role,
  userId,
  editable = false,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(src);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setImageUrl(src);
  }, [src]);

  const fullSrc = imageUrl
    ? `${import.meta.env.VITE_API_URL}${imageUrl}`
    : null;

  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("role", role);
    formData.append("id", userId);

    setLoading(true);
    try {
      const res = await userApi.uploadAvatar(formData);
      const newUrl = res.url;
      setImageUrl(newUrl);
      message.success("Аватар обновлен");
      if (onUpdate) {
        onUpdate(newUrl);
      }
    } catch (e) {
      message.error("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    Modal.confirm({
      title: "Удалить фото?",
      okText: "Да",
      cancelText: "Нет",
      onOk: async () => {
        try {
          await userApi.deleteAvatar(role, userId);
          setImageUrl(null);
          message.success("Фото удалено");
          if (onUpdate) onUpdate(null);
        } catch (e) {
          message.error("Ошибка удаления");
        }
      },
    });
  };

  const avatarContent = (
    <Avatar
      size={size}
      src={fullSrc}
      icon={loading ? <LoadingOutlined /> : <UserOutlined />}
      style={{
        backgroundColor: fullSrc ? "transparent" : "#1890ff",
        cursor: editable ? "pointer" : "default",
        fontSize: size > 40 ? size / 2 : 18,
      }}
    >
      {!fullSrc && !loading && name ? name[0] : null}
    </Avatar>
  );

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {editable ? (
        <Upload
          showUploadList={false}
          customRequest={handleUpload}
          accept="image/*"
        >
          {avatarContent}
        </Upload>
      ) : (
        avatarContent
      )}

      {editable && fullSrc && !loading && (
        <Button
          type="primary"
          danger
          shape="circle"
          size="small"
          icon={<DeleteOutlined />}
          onClick={handleDelete}
          style={{
            position: "absolute",
            bottom: -5,
            right: -5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            minWidth: "24px",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
            pointerEvents: isHovered ? "auto" : "none",
          }}
        />
      )}
    </div>
  );
};

export default UserAvatar;

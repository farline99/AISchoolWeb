import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Typography,
  theme,
  Modal,
  Form,
  Input,
  Button,
  Dropdown,
  Space,
  message,
  Upload,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  ReadOutlined,
  BankOutlined,
  LogoutOutlined,
  AuditOutlined,
  PieChartOutlined,
  IdcardOutlined,
  KeyOutlined,
  CameraOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../api/user";
import UserAvatar from "../components/UserAvatar";
import { authApi } from "../api/auth";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [collapsed, setCollapsed] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const currentKey = location.pathname.split("/")[1] || "profile";

  const fluidHeightPages = ["reports", "profile", "journal"];
  const isFluidLayout = fluidHeightPages.includes(currentKey);

  const adminItems = [
    { key: "teachers", icon: <UserOutlined />, label: "Учителя" },
    { key: "classes", icon: <TeamOutlined />, label: "Классы и Ученики" },
    { key: "plans", icon: <ReadOutlined />, label: "Учебные планы" },
    { key: "workload", icon: <AuditOutlined />, label: "Нагрузка" },
    { key: "reports", icon: <PieChartOutlined />, label: "Отчеты" },
  ];
  const teacherItems = [
    { key: "journal", icon: <ReadOutlined />, label: "Журнал" },
  ];
  const studentItems = [
    { key: "profile", icon: <IdcardOutlined />, label: "Мой профиль" },
  ];

  let menuItems = [];
  let title = "";

  switch (user.role) {
    case "admin":
      menuItems = adminItems;
      title = "Администрирование";
      break;
    case "teacher":
      menuItems = teacherItems;
      title = "Кабинет учителя";
      break;
    case "student":
    case "parent":
      menuItems = studentItems;
      title = "Электронный дневник";
      break;
    default:
      menuItems = [];
  }

  const handleMenuClick = (e) => {
    navigate(`/${e.key}`);
  };

  const handleHeaderAvatarUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("role", user.role);
    formData.append("id", user.id);

    try {
      const res = await userApi.uploadAvatar(formData);
      onSuccess("ok");
      updateUser({ avatar: res.url });
      message.success("Фотография обновлена");
    } catch (err) {
      onError(err);
      message.error("Ошибка загрузки фото");
    }
  };

  const Logo = () => (
    <div
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#002140",
        cursor: "pointer",
      }}
      onClick={() => navigate("/")}
    >
      <BankOutlined
        style={{ fontSize: 24, color: "#fff", marginRight: collapsed ? 0 : 10 }}
      />
      {!collapsed && (
        <span
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
            whiteSpace: "nowrap",
          }}
        >
          АИС «Школа»
        </span>
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <Logo />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentKey]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 200,
          transition: "all 0.2s",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>
          <Dropdown
            menu={{
              items: [
                {
                  key: "upload-photo",
                  label: (
                    <Upload
                      showUploadList={false}
                      customRequest={handleHeaderAvatarUpload}
                      accept="image/*"
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                        }}
                      >
                        <CameraOutlined /> Сменить фото
                      </div>
                    </Upload>
                  ),
                },
                ...(user.avatar
                  ? [
                      {
                        key: "delete-photo",
                        danger: true,
                        icon: <DeleteOutlined />,
                        label: "Удалить фото",
                        onClick: () => {
                          Modal.confirm({
                            title: "Удалить фото профиля?",
                            onOk: () => {
                              userApi
                                .deleteAvatar(user.role, user.id)
                                .then(() => {
                                  updateUser({ avatar: null });
                                  message.success("Фото удалено");
                                });
                            },
                          });
                        },
                      },
                    ]
                  : []),
                { type: "divider" },
                {
                  key: "change-password",
                  icon: <KeyOutlined />,
                  label: "Сменить пароль",
                  onClick: () => setIsPassModalOpen(true),
                },
                {
                  type: "divider",
                },
                {
                  key: "logout",
                  icon: <LogoutOutlined />,
                  label: "Выход",
                  danger: true,
                  onClick: logout,
                },
              ],
            }}
            trigger={["click"]}
          >
            <a
              onClick={(e) => e.preventDefault()}
              className="user-dropdown-trigger"
            >
              <Space>
                <UserAvatar
                  src={user.avatar}
                  name={user.name}
                  size="large"
                  role={user.role}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    lineHeight: "1.2",
                    justifyContent: "center",
                  }}
                >
                  <Typography.Text strong style={{ color: "#333" }}>
                    {user.name}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {{
                      admin: "Завуч",
                      teacher: "Учитель",
                      student: "Ученик",
                      parent: "Родитель",
                    }[user.role] || user.role}
                  </Typography.Text>
                </div>
              </Space>
            </a>
          </Dropdown>
        </Header>
        <Content
          style={{
            padding: "24px 16px 24px",
            flex: 1,
            overflow: isFluidLayout ? "auto" : "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              display: "flex",
              flexDirection: "column",
              height: isFluidLayout ? "auto" : "100%",
              minHeight: isFluidLayout ? "100%" : "unset",
              flex: isFluidLayout ? "none" : 1,
              overflow: isFluidLayout ? "visible" : "hidden",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>

      <Modal
        title="Смена пароля"
        open={isPassModalOpen}
        onCancel={() => setIsPassModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          onFinish={(values) => {
            if (values.newPass !== values.confirmPass) {
              message.error("Пароли не совпадают");
              return;
            }
            authApi
              .changePassword(values.newPass)
              .then(() => {
                message.success("Пароль успешно изменен");
                setIsPassModalOpen(false);
              })
              .catch(() => message.error("Ошибка при смене пароля"));
          }}
        >
          <Form.Item
            name="newPass"
            rules={[
              { required: true, message: "Введите новый пароль", min: 3 },
            ]}
          >
            <Input.Password placeholder="Новый пароль" />
          </Form.Item>
          <Form.Item
            name="confirmPass"
            rules={[{ required: true, message: "Повторите пароль" }]}
          >
            <Input.Password placeholder="Повторите пароль" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Сохранить
          </Button>
        </Form>
      </Modal>
    </Layout>
  );
};

export default MainLayout;

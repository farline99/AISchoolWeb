import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Checkbox,
  Modal,
  Space,
  Divider,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  ReadOutlined,
  TrophyOutlined,
  PieChartOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const hasVisited = localStorage.getItem("has_visited_portal");
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(!hasVisited);

  const savedLogin = localStorage.getItem("site_login");
  const savedRemember = localStorage.getItem("site_remember");

  const initialValues = {
    login: savedLogin || "",
    password: "",
    remember: savedRemember === "true",
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const closeWelcomeModal = () => {
    localStorage.setItem("has_visited_portal", "true");
    setIsWelcomeModalOpen(false);
  };

  const onFinish = async (values) => {
    try {
      localStorage.setItem("site_login", values.login);
      localStorage.setItem("site_remember", values.remember ? "true" : "false");

      await login(values.login, values.password, values.remember);
      message.success("Добро пожаловать!");
      navigate("/");
    } catch (error) {
      message.error(error.response?.data?.error || "Ошибка входа");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #e6f7ff 0%, #e0eafc 100%)",
      }}
    >
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircleOutlined style={{ color: "#1890ff", fontSize: 24 }} />
            <span>Добро пожаловать в АИС «Школа»!</span>
          </div>
        }
        open={isWelcomeModalOpen}
        onOk={closeWelcomeModal}
        onCancel={closeWelcomeModal}
        footer={[
          <Button
            key="submit"
            type="primary"
            size="large"
            onClick={closeWelcomeModal}
          >
            Приступить к работе
          </Button>,
        ]}
        width={500}
        centered
        maskClosable={false}
      >
        <Paragraph style={{ fontSize: 16, marginTop: 10 }}>
          Единая информационная система для управления учебным процессом.
        </Paragraph>
        <Divider />
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div style={{ display: "flex", gap: 15 }}>
            <ReadOutlined
              style={{ fontSize: 24, color: "#1890ff", marginTop: 5 }}
            />
            <div>
              <Text strong>Электронный журнал</Text>
              <div style={{ color: "#8c8c8c" }}>
                Доступ к оценкам и истории успеваемости.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 15 }}>
            <TrophyOutlined
              style={{ fontSize: 24, color: "#faad14", marginTop: 5 }}
            />
            <div>
              <Text strong>Достижения учащихся</Text>
              <div style={{ color: "#8c8c8c" }}>
                Просмотр наград и участия в олимпиадах.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 15 }}>
            <PieChartOutlined
              style={{ fontSize: 24, color: "#722ed1", marginTop: 5 }}
            />
            <div>
              <Text strong>Мониторинг и аналитика</Text>
              <div style={{ color: "#8c8c8c" }}>
                Сводные отчеты для администрации.
              </div>
            </div>
          </div>
        </Space>
        <Divider />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Для входа используйте учетные данные, предоставленные в учебном
          заведении.
        </Text>
      </Modal>

      <div style={{ display: isWelcomeModalOpen ? "none" : "block" }}>
        <Card
          style={{
            width: 380,
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            borderRadius: 16,
            border: "none",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Title level={3} style={{ margin: 0, color: "#0050b3" }}>
              АИС «Школа»
            </Title>
            <Text type="secondary">Вход в личный кабинет</Text>
          </div>
          <Form
            name="login"
            onFinish={onFinish}
            size="large"
            initialValues={initialValues}
            layout="vertical"
          >
            <Form.Item
              name="login"
              rules={[{ required: true, message: "Введите логин" }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Логин"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Введите пароль" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Пароль"
              />
            </Form.Item>
            <Form.Item
              name="remember"
              valuePropName="checked"
              style={{ marginBottom: 24 }}
            >
              <Checkbox>Запомнить меня</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                icon={<LoginOutlined />}
                style={{
                  height: 45,
                  fontSize: 16,
                  fontWeight: 500,
                  borderRadius: 8,
                }}
              >
                Войти
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;

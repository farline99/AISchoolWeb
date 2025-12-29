import { useEffect, useState } from "react";
import {
  Card,
  Tabs,
  List,
  Tag,
  Typography,
  Table,
  Modal,
  Empty,
  Button,
  Space,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Popconfirm,
  message,
} from "antd";
import {
  ReadOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import UserAvatar from "../components/UserAvatar";
import { useAuth } from "../context/AuthContext";
import { profileApi } from "../api/reports";
import { achievementsApi } from "../api/achievements";

const { Title, Text } = Typography;

const StudentProfilePage = ({ studentIdOverride, yearId }) => {
  const { user, updateUser } = useAuth();
  const [info, setInfo] = useState(null);
  const [gradesData, setGradesData] = useState([]);
  const [achievements, setAchievements] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [achievementForm] = Form.useForm();

  const targetStudentId =
    studentIdOverride ||
    (user?.role === "student" ? user.id : user?.related_student_id);

  const canEditAvatar =
    user && (user.id === targetStudentId || user.role === "admin");

  const canManageAchievements =
    user && ["admin", "teacher"].includes(user.role);

  const fetchData = () => {
    const params = {};
    if (studentIdOverride) params.student_id = studentIdOverride;
    if (yearId) params.year_id = yearId;

    profileApi.getInfo(params).then((data) => setInfo(data));
    profileApi.getGrades(params).then((data) => setGradesData(data || []));
    profileApi
      .getAchievements(params)
      .then((data) => setAchievements(data || []));
  };

  useEffect(() => {
    fetchData();
  }, [studentIdOverride, yearId]);

  const handleOpenAchievementModal = (record = null) => {
    setEditingAchievement(record);
    if (record) {
      achievementForm.setFieldsValue({
        ...record,
        event_date: dayjs(record.event_date),
      });
    } else {
      achievementForm.resetFields();
    }
    setIsAchievementModalOpen(true);
  };

  const handleSaveAchievement = (values) => {
    const payload = {
      ...values,
      event_date: values.event_date.format("YYYY-MM-DD HH:mm:ss"),
      student_id: info.id,
    };

    if (editingAchievement) {
      achievementsApi
        .update({ ...payload, id: editingAchievement.id })
        .then(() => {
          message.success("Достижение обновлено");
          setIsAchievementModalOpen(false);
          fetchData();
        })
        .catch((e) => message.error(e.response?.data?.error || "Ошибка"));
    } else {
      achievementsApi
        .create(payload)
        .then(() => {
          message.success("Достижение добавлено");
          setIsAchievementModalOpen(false);
          fetchData();
        })
        .catch((e) => message.error(e.response?.data?.error || "Ошибка"));
    }
  };

  const handleDeleteAchievement = (id) => {
    achievementsApi
      .delete(id)
      .then(() => {
        message.success("Достижение удалено");
        fetchData();
      })
      .catch((e) => message.error(e.response?.data?.error || "Ошибка"));
  };

  const getGradeColor = (grade) => {
    if (grade === "5" || grade >= 4.5) return "green";
    if (grade === "4" || grade >= 3.5) return "blue";
    if (grade === "3" || grade >= 2.5) return "orange";
    return "red";
  };

  const getRecentGrades = () => {
    let allGrades = [];
    gradesData.forEach((subject) => {
      subject.grades.forEach((g) => {
        allGrades.push({ ...g, discipline: subject.discipline });
      });
    });
    return allGrades
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  const GradesTab = () => {
    const recentGrades = getRecentGrades();
    return (
      <div>
        {recentGrades.length > 0 && (
          <Card
            size="small"
            title={
              <span>
                <ClockCircleOutlined /> Последние оценки
              </span>
            }
            style={{ marginBottom: 16, background: "#fafafa" }}
          >
            <List
              grid={{ gutter: 16, xs: 2, sm: 3, md: 5, lg: 5, xl: 5, xxl: 5 }}
              dataSource={recentGrades}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    size="small"
                    bordered={false}
                    style={{
                      textAlign: "center",
                      boxShadow: "none",
                      background: "transparent",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: getGradeColor(item.grade),
                      }}
                    >
                      {item.grade || item.type}
                    </div>
                    <div style={{ fontSize: "12px", color: "#888" }}>
                      {dayjs(item.date).format("DD.MM")}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={item.discipline}
                    >
                      {item.discipline}
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        )}
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
          dataSource={gradesData}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                onClick={() => {
                  setSelectedSubject(item);
                  setIsGradeModalOpen(true);
                }}
                actions={[<div key="view">Подробнее</div>]}
              >
                <Card.Meta
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        title={item.discipline}
                        style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {item.discipline}
                      </span>
                    </div>
                  }
                  description={
                    <div style={{ marginTop: 16, textAlign: "center" }}>
                      <Text type="secondary">Средний балл</Text>
                      <div
                        style={{
                          fontSize: "36px",
                          fontWeight: "bold",
                          color: getGradeColor(item.average),
                          lineHeight: 1,
                        }}
                      >
                        {item.average}
                      </div>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
        <Modal
          title={selectedSubject?.discipline}
          open={isGradeModalOpen}
          onCancel={() => setIsGradeModalOpen(false)}
          footer={null}
          width={700}
          destroyOnClose
        >
          {selectedSubject && (
            <Table
              dataSource={selectedSubject.grades}
              rowKey="date"
              pagination={false}
              size="small"
              columns={[
                {
                  title: "Дата",
                  dataIndex: "date",
                  width: 100,
                  render: (d) => (
                    <span style={{ color: "#666" }}>
                      {dayjs(d).format("DD.MM.YYYY")}
                    </span>
                  ),
                },
                {
                  title: "Тема урока / Работа",
                  dataIndex: "topic",
                  render: (t) =>
                    t || <i style={{ color: "#ccc" }}>Тема не указана</i>,
                },
                {
                  title: "Оценка",
                  dataIndex: "grade",
                  width: 80,
                  align: "center",
                  render: (g, r) => (
                    <Tag
                      color={getGradeColor(g)}
                      style={{
                        fontWeight: "bold",
                        fontSize: "14px",
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      {r.type === "Н" ? "Н" : g}
                    </Tag>
                  ),
                },
              ]}
            />
          )}
        </Modal>
      </div>
    );
  };

  const AchievementsTab = () => {
    const columns = [
      {
        title: "Дата",
        dataIndex: "event_date",
        width: 120,
        render: (d) => dayjs(d).format("DD.MM.YYYY"),
      },
      {
        title: "Событие",
        dataIndex: "event_name",
        render: (t) => <b>{t}</b>,
      },
      { title: "Уровень", dataIndex: "level" },
      {
        title: "Место",
        dataIndex: "place",
        width: 100,
        render: (p) => (p ? <Tag color="gold">{p} место</Tag> : "-"),
      },
    ];

    if (canManageAchievements) {
      columns.push({
        title: "Действия",
        key: "actions",
        width: 100,
        render: (_, r) => (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenAchievementModal(r)}
            />
            <Popconfirm
              title="Удалить?"
              onConfirm={() => handleDeleteAchievement(r.id)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      });
    }

    return (
      <div>
        {canManageAchievements && (
          <div style={{ marginBottom: 16, textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenAchievementModal(null)}
            >
              Добавить достижение
            </Button>
          </div>
        )}
        <Table
          dataSource={achievements}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: <Empty description="Нет достижений" /> }}
          columns={columns}
        />
      </div>
    );
  };

  if (!info) return null;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Card style={{ marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ marginRight: 20 }}>
            <UserAvatar
              src={info.avatar_path}
              size={80}
              name={info.first_name}
              userId={info.id}
              role="student"
              editable={canEditAvatar}
              onUpdate={(newPath) => {
                setInfo((prev) => ({ ...prev, avatar_path: newPath }));
                if (user.id === info.id) {
                  updateUser({ avatar: newPath });
                }
              }}
            />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {info.last_name} {info.first_name} {info.patronymic}
            </Title>
            <div style={{ marginTop: 4 }}>
              <Tag color="blue">{info.class_name}</Tag>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                День рождения: {dayjs(info.birth_date).format("DD.MM.YYYY")}
              </Text>
            </div>
          </div>
        </div>
      </Card>
      <Card
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
        bodyStyle={{ flex: 1, overflow: "auto", paddingRight: 8 }}
      >
        <Tabs
          items={[
            {
              key: "grades",
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ReadOutlined /> Дневник
                </span>
              ),
              children: <GradesTab />,
            },
            {
              key: "achievements",
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <TrophyOutlined /> Достижения
                </span>
              ),
              children: <AchievementsTab />,
            },
          ]}
        />
      </Card>

      <Modal
        title={
          editingAchievement ? "Редактировать достижение" : "Новое достижение"
        }
        open={isAchievementModalOpen}
        onCancel={() => setIsAchievementModalOpen(false)}
        onOk={() => achievementForm.submit()}
        destroyOnClose
      >
        <Form
          form={achievementForm}
          layout="vertical"
          onFinish={handleSaveAchievement}
        >
          <Form.Item
            name="event_name"
            label="Название события"
            rules={[{ required: true, message: "Введите название" }]}
          >
            <Input placeholder="Например: Олимпиада по математике" />
          </Form.Item>
          <Form.Item
            name="event_date"
            label="Дата"
            rules={[{ required: true, message: "Выберите дату" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item name="level" label="Уровень">
            <Input placeholder="Школьный, Городской, Всероссийский" />
          </Form.Item>
          <Form.Item name="place" label="Занятое место (если есть)">
            <InputNumber min={1} max={100} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentProfilePage;

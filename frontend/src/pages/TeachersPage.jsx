import { useEffect, useState, useRef } from "react";
import {
  Table,
  Typography,
  message,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  Tooltip,
  Pagination,
  Card,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { teachersApi } from "../api/teachers";
import UserAvatar from "../components/UserAvatar";
import { useAuth } from "../context/AuthContext";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const HEADER_HEIGHT = 55;
const HEIGHT_BUFFER = 1;
const ROW_HEIGHT = 65;

const TeachersPage = () => {
  const { user, updateUser } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [form] = Form.useForm();
  const searchInput = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const tableContainerRef = useRef(null);

  const fetchTeachers = () => {
    setLoading(true);
    teachersApi
      .getAll()
      .then((data) => {
        setTeachers(data);
        setLoading(false);
      })
      .catch(() => {
        message.error("Ошибка");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const containerHeight = entry.contentRect.height;

        const availableHeightForRows =
          containerHeight - HEADER_HEIGHT - HEIGHT_BUFFER;

        if (availableHeightForRows <= 0) {
          setPageSize(1);
          continue;
        }

        const calcSize = Math.floor(availableHeightForRows / ROW_HEIGHT);

        setPageSize(Math.max(1, calcSize));
      }
    });

    if (tableContainerRef.current) {
      observer.observe(tableContainerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const currentData = teachers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Поиск`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Найти
          </Button>
          <Button
            onClick={() => {
              clearFilters();
              confirm();
            }}
            size="small"
            style={{ width: 90 }}
          >
            Сброс
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) setTimeout(() => searchInput.current?.select(), 100);
    },
  });

  const openCreateModal = () => {
    setEditingTeacher(null);
    form.resetFields();
    form.setFieldsValue({ role: "teacher" });
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    form.setFieldsValue(teacher);
    setIsModalOpen(true);
  };

  const handleSave = (values) => {
    if (editingTeacher) {
      const dataToUpdate = { ...values, id: editingTeacher.id };
      teachersApi
        .update(dataToUpdate)
        .then(() => {
          message.success("Обновлено");
          setIsModalOpen(false);
          fetchTeachers();
        })
        .catch((e) => message.error(e.response?.data?.error));
    } else {
      teachersApi
        .create(values)
        .then(() => {
          message.success("Создано");
          setIsModalOpen(false);
          fetchTeachers();
        })
        .catch((e) => message.error(e.response?.data?.error));
    }
  };

  const handleDelete = (id) => {
    teachersApi
      .delete(id)
      .then(() => {
        message.success("Удалено");
        fetchTeachers();
      })
      .catch((e) => message.error(e.response?.data?.error));
  };

  const columns = [
    {
      title: "",
      dataIndex: "avatar_path",
      key: "avatar",
      width: 80,
      render: (path, r) => (
        <UserAvatar
          src={path}
          name={r.first_name}
          size={40}
          role="teacher"
          userId={r.id}
        />
      ),
    },
    {
      title: "Фамилия",
      dataIndex: "last_name",
      key: "last_name",
      sortDirections: ["descend"],
      sorter: (a, b) => a.last_name.localeCompare(b.last_name),
      ...getColumnSearchProps("last_name"),
    },
    { title: "Имя", dataIndex: "first_name", key: "first_name" },
    { title: "Отчество", dataIndex: "patronymic", key: "patronymic" },
    { title: "Телефон", dataIndex: "phone", key: "phone" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Роль",
      dataIndex: "role",
      key: "role",
      filters: [
        { text: "Учитель", value: "teacher" },
        { text: "Администратор", value: "admin" },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => (
        <Tag color={role === "admin" ? "volcano" : "geekblue"}>
          {role === "admin" ? "АДМИНИСТРАТОР" : "УЧИТЕЛЬ"}
        </Tag>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Редактировать">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Удалить?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Удалить">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const paginationFooterStyle = {
    padding: "12px 24px",
    display: "flex",
    justifyContent: "flex-end",
    borderTop: "1px solid #f0f0f0",
    background: "#fff",
    minHeight: "57px",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Учителя
          </Title>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchTeachers} />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Добавить учителя
            </Button>
          </Space>
        }
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
        bodyStyle={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div ref={tableContainerRef} style={{ flex: 1, overflow: "hidden" }}>
          <Table
            dataSource={teachers}
            columns={columns}
            rowKey="id"
            loading={loading}
            bordered={false}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: teachers.length,
              onChange: (page) => setCurrentPage(page),
              position: ["none"],
            }}
          />
        </div>
        <div style={paginationFooterStyle}>
          {teachers.length > 0 && (
            <Pagination
              simple
              current={currentPage}
              total={teachers.length}
              pageSize={pageSize}
              onChange={setCurrentPage}
              showSizeChanger={false}
            />
          )}
        </div>
      </Card>

      <Modal
        title={editingTeacher ? `Редактирование` : "Новый учитель"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Сохранить"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            {!editingTeacher && (
              <div style={{ color: "#999", fontSize: 12 }}>
                Аватар можно загрузить после создания
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="last_name"
              label="Фамилия"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="first_name"
              label="Имя"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <Input />
            </Form.Item>
          </div>
          <Form.Item name="patronymic" label="Отчество">
            <Input />
          </Form.Item>
          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item name="phone" label="Телефон" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" style={{ flex: 1 }}>
              <Input type="email" />
            </Form.Item>
          </div>
          <Form.Item name="login" label="Логин" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {!editingTeacher && (
            <Form.Item
              name="password"
              label="Пароль"
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="role" label="Роль" rules={[{ required: true }]}>
            <Select>
              <Option value="teacher">Учитель</Option>
              <Option value="admin">Администратор</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Заметки">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeachersPage;

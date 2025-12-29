import { useEffect, useState, useRef } from "react";
import {
  Table,
  Typography,
  message,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Pagination,
} from "antd";
import {
  PlusOutlined,
  UserSwitchOutlined,
  DeleteOutlined,
  EditOutlined,
  ArrowRightOutlined,
  TeamOutlined,
  KeyOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import StudentParentsModal from "../components/StudentParentsModal";
import StudentProfilePage from "./StudentProfilePage";
import { classesApi, studentsApi } from "../api/classes";
import { teachersApi } from "../api/teachers";

const { Option } = Select;
const { TextArea } = Input;

const HEADER_HEIGHT = 55;
const HEIGHT_BUFFER = 1;
const CLASS_ROW_HEIGHT = 53.1;
const STUDENT_ROW_HEIGHT = 62;

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedClassRecord, setSelectedClassRecord] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isHeadTeacherModalOpen, setIsHeadTeacherModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isParentsModalOpen, setIsParentsModalOpen] = useState(false);
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);

  const [profileStudentId, setProfileStudentId] = useState(null);

  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForParents, setStudentForParents] = useState(null);

  const [classForm] = Form.useForm();
  const [headTeacherForm] = Form.useForm();
  const [studentForm] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [credsForm] = Form.useForm();

  const [classPageSize, setClassPageSize] = useState(10);
  const [studentPageSize, setStudentPageSize] = useState(10);
  const [classesPage, setClassesPage] = useState(1);
  const [studentsPage, setStudentsPage] = useState(1);

  const tableContainerRef = useRef(null);

  const fetchClasses = () => {
    setLoadingClasses(true);
    classesApi
      .getAll()
      .then((data) => {
        setClasses(data || []);
        setLoadingClasses(false);
      })
      .catch(() => {
        message.error("Ошибка загрузки классов");
        setLoadingClasses(false);
      });
  };

  const fetchTeachers = () => {
    teachersApi
      .getAll()
      .then((data) => setTeachers(data || []))
      .catch(() => message.error("Ошибка загрузки учителей"));
  };

  const fetchStudents = (classId) => {
    if (!classId) {
      setStudents([]);
      return;
    }
    setLoadingStudents(true);
    studentsApi
      .getByClass(classId)
      .then((data) => {
        setStudents(data || []);
        setLoadingStudents(false);
        setStudentsPage(1);
      })
      .catch(() => {
        message.error("Ошибка загрузки учеников");
        setLoadingStudents(false);
      });
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  useEffect(() => {
    fetchStudents(selectedClassId);
  }, [selectedClassId]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const containerHeight = entry.contentRect.height;
        const availableHeightForRows =
          containerHeight - HEADER_HEIGHT - HEIGHT_BUFFER;

        if (availableHeightForRows <= 0) {
          setClassPageSize(1);
          setStudentPageSize(1);
          continue;
        }

        const calcClassSize = Math.floor(
          availableHeightForRows / CLASS_ROW_HEIGHT
        );
        const calcStudentSize = Math.floor(
          availableHeightForRows / STUDENT_ROW_HEIGHT
        );

        setClassPageSize(Math.max(1, calcClassSize));
        setStudentPageSize(Math.max(1, calcStudentSize));
      }
    });

    if (tableContainerRef.current) {
      observer.observe(tableContainerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleCreateClass = (values) => {
    classesApi
      .create(values)
      .then(() => {
        message.success("Класс создан");
        setIsClassModalOpen(false);
        classForm.resetFields();
        fetchClasses();
      })
      .catch((err) => message.error(err.response?.data?.error));
  };

  const handleUpdateHeadTeacher = (values) => {
    classesApi
      .updateHeadTeacher({
        class_id: selectedClassRecord.class_id,
        head_teacher_id: values.head_teacher_id,
      })
      .then(() => {
        message.success("Руководитель обновлен");
        setIsHeadTeacherModalOpen(false);
        fetchClasses();
      })
      .catch((err) => message.error(err.response?.data?.error));
  };

  const handleSaveStudent = (values) => {
    const formattedValues = {
      ...values,
      birth_date: values.birth_date.format("YYYY-MM-DD"),
      class_id: selectedClassId,
    };

    if (editingStudent) {
      studentsApi
        .update({ ...formattedValues, id: editingStudent.id })
        .then(() => {
          message.success("Ученик обновлен");
          setIsStudentModalOpen(false);
          fetchStudents(selectedClassId);
        })
        .catch((err) => message.error(err.response?.data?.error));
    } else {
      studentsApi
        .create(formattedValues)
        .then(() => {
          message.success("Ученик добавлен");
          setIsStudentModalOpen(false);
          studentForm.resetFields();
          fetchStudents(selectedClassId);
        })
        .catch((err) => message.error(err.response?.data?.error));
    }
  };

  const handleTransferStudent = (values) => {
    studentsApi
      .transfer(editingStudent.id, values.new_class_id)
      .then(() => {
        message.success("Ученик переведен");
        setIsTransferModalOpen(false);
        fetchStudents(selectedClassId);
      })
      .catch((err) => message.error(err.response?.data?.error));
  };

  const handleExpelStudent = (id) => {
    studentsApi
      .delete(id)
      .then(() => {
        message.success("Ученик отчислен");
        fetchStudents(selectedClassId);
      })
      .catch((err) => message.error(err.response?.data?.error));
  };

  const handleUpdateCreds = (values) => {
    studentsApi
      .updateCredentials(editingStudent.id, values.login, values.password)
      .then(() => {
        message.success("Доступы обновлены");
        setIsCredsModalOpen(false);
      })
      .catch((err) => message.error(err.response?.data?.error));
  };

  useEffect(() => {
    if (isStudentModalOpen) {
      if (editingStudent) {
        const birthDateParsed = editingStudent.birth_date
          ? dayjs(editingStudent.birth_date)
          : null;
        studentForm.setFieldsValue({
          ...editingStudent,
          birth_date: birthDateParsed,
        });
      } else {
        studentForm.resetFields();
      }
    }
  }, [isStudentModalOpen, editingStudent, studentForm]);

  const noWrapStyle = { whiteSpace: "nowrap" };

  const classColumns = [
    {
      title: <span style={noWrapStyle}>Класс</span>,
      dataIndex: "class_name",
      key: "class_name",
      width: "30%",
      sorter: (a, b) => parseInt(a.class_name) - parseInt(b.class_name),
      sortDirections: ["descend"],
      filters: Array.from({ length: 11 }, (_, i) => ({
        text: `${i + 1}-е классы`,
        value: (i + 1).toString(),
      })),
      onFilter: (value, record) => record.class_name.startsWith(value + " "),
      render: (text) => (
        <div style={noWrapStyle}>
          <strong>{text}</strong>
        </div>
      ),
    },
    {
      title: <span style={noWrapStyle}>Руководитель</span>,
      dataIndex: "head_teacher_full_name",
      key: "head_teacher",
      filters: [
        { text: "Назначен", value: "assigned" },
        { text: "Не назначен", value: "not_assigned" },
      ],
      onFilter: (value, record) =>
        value === "assigned"
          ? !!record.head_teacher_full_name
          : !record.head_teacher_full_name,
      render: (text) => (
        <div style={noWrapStyle}>
          {text || (
            <Typography.Text type="secondary" italic>
              (Нет)
            </Typography.Text>
          )}
        </div>
      ),
    },
  ];

  const studentColumns = [
    {
      title: <span style={noWrapStyle}>Фамилия</span>,
      dataIndex: "last_name",
      key: "last_name",
      sorter: (a, b) => a.last_name.localeCompare(b.last_name),
      sortDirections: ["descend"],
      render: (text) => <div style={noWrapStyle}>{text}</div>,
    },
    {
      title: <span style={noWrapStyle}>Имя</span>,
      dataIndex: "first_name",
      key: "first_name",
      render: (text) => <div style={noWrapStyle}>{text}</div>,
    },
    {
      title: <span style={noWrapStyle}>Отчество</span>,
      dataIndex: "patronymic",
      key: "patronymic",
      render: (text) => <div style={noWrapStyle}>{text}</div>,
    },
    {
      title: "Действия",
      key: "actions",
      width: 190,
      render: (_, record) => (
        <Space style={noWrapStyle}>
          <Button
            type="text"
            icon={<IdcardOutlined />}
            onClick={() => setProfileStudentId(record.id)}
            title="Портфолио и Достижения"
            style={{ color: "#1890ff" }}
          />
          <Button
            type="text"
            icon={<KeyOutlined />}
            onClick={() => {
              setEditingStudent(record);
              credsForm.resetFields();
              setIsCredsModalOpen(true);
            }}
            title="Доступы"
          />
          <Button
            type="text"
            icon={<TeamOutlined />}
            onClick={() => {
              setStudentForParents(record);
              setIsParentsModalOpen(true);
            }}
            title="Родители"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              studentsApi
                .getById(record.id)
                .then((data) => {
                  setEditingStudent(data);
                  setIsStudentModalOpen(true);
                })
                .catch(() => message.error("Ошибка загрузки данных ученика"));
            }}
          />
          <Button
            type="text"
            icon={<ArrowRightOutlined />}
            onClick={() => {
              setEditingStudent(record);
              setIsTransferModalOpen(true);
            }}
            title="Перевести"
          />
          <Popconfirm
            title="Отчислить?"
            onConfirm={() => handleExpelStudent(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
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
    <>
      <Row gutter={16} style={{ height: "100%", flex: 1, minHeight: 0 }}>
        <Col
          span={8}
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <Card
            title="Классы"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsClassModalOpen(true)}
              >
                Создать
              </Button>
            }
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
            bodyStyle={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: 0,
              overflow: "hidden",
            }}
          >
            <div
              ref={tableContainerRef}
              style={{ flex: 1, overflow: "hidden" }}
            >
              <Table
                dataSource={classes}
                columns={classColumns}
                rowKey="class_id"
                loading={loadingClasses}
                onRow={(record) => ({
                  onClick: () => {
                    setSelectedClassId(record.class_id);
                    setSelectedClassRecord(record);
                  },
                  style: {
                    cursor: "pointer",
                    background:
                      record.class_id === selectedClassId ? "#e6f7ff" : "",
                  },
                })}
                bordered={false}
                pagination={{
                  current: classesPage,
                  pageSize: classPageSize,
                  total: classes.length,
                  onChange: setClassesPage,
                  position: ["none"],
                }}
              />
            </div>
            <div style={paginationFooterStyle}>
              {classes.length > 0 && (
                <Pagination
                  simple
                  current={classesPage}
                  total={classes.length}
                  pageSize={classPageSize}
                  onChange={setClassesPage}
                />
              )}
            </div>
          </Card>
        </Col>
        <Col
          span={16}
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <Card
            title={
              selectedClassRecord
                ? `Ученики: ${selectedClassRecord.class_name}`
                : "Выберите класс слева"
            }
            extra={
              <Space>
                {selectedClassRecord && (
                  <Button
                    icon={<UserSwitchOutlined />}
                    onClick={() => {
                      headTeacherForm.setFieldsValue({
                        head_teacher_id: selectedClassRecord.head_teacher_id,
                      });
                      setIsHeadTeacherModalOpen(true);
                    }}
                  >
                    Руководитель
                  </Button>
                )}
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  disabled={!selectedClassId}
                  onClick={() => {
                    setEditingStudent(null);
                    studentForm.resetFields();
                    setIsStudentModalOpen(true);
                  }}
                >
                  Добавить ученика
                </Button>
              </Space>
            }
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
            bodyStyle={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: 0,
              overflow: "hidden",
            }}
          >
            <div style={{ flex: 1, overflow: "hidden" }}>
              <Table
                dataSource={students}
                columns={studentColumns}
                rowKey="id"
                loading={loadingStudents}
                bordered={false}
                pagination={{
                  current: studentsPage,
                  pageSize: studentPageSize,
                  total: students.length,
                  onChange: setStudentsPage,
                  position: ["none"],
                }}
              />
            </div>
            <div style={paginationFooterStyle}>
              {students.length > 0 && (
                <Pagination
                  simple
                  current={studentsPage}
                  total={students.length}
                  pageSize={studentPageSize}
                  onChange={setStudentsPage}
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Новый класс"
        open={isClassModalOpen}
        onCancel={() => setIsClassModalOpen(false)}
        onOk={() => classForm.submit()}
        destroyOnClose
      >
        <Form form={classForm} layout="vertical" onFinish={handleCreateClass}>
          <Form.Item
            name="parallel_number"
            label="Параллель (1-11)"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={11} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="letter"
            label="Буква"
            rules={[{ required: true, max: 1 }]}
            normalize={(value) => (value || "").toUpperCase()}
          >
            <Input maxLength={1} />
          </Form.Item>
          <Form.Item name="head_teacher_id" label="Классный руководитель">
            <Select allowClear showSearch optionFilterProp="children">
              {teachers.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.last_name} {t.first_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Назначить руководителя"
        open={isHeadTeacherModalOpen}
        onCancel={() => setIsHeadTeacherModalOpen(false)}
        onOk={() => headTeacherForm.submit()}
        destroyOnClose
      >
        <Form
          form={headTeacherForm}
          layout="vertical"
          onFinish={handleUpdateHeadTeacher}
        >
          <Form.Item name="head_teacher_id" label="Учитель">
            <Select allowClear showSearch optionFilterProp="children">
              {teachers.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.last_name} {t.first_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingStudent ? "Редактирование ученика" : "Новый ученик"}
        open={isStudentModalOpen}
        onCancel={() => setIsStudentModalOpen(false)}
        onOk={() => studentForm.submit()}
      >
        <Form form={studentForm} layout="vertical" onFinish={handleSaveStudent}>
          <Form.Item
            name="last_name"
            label="Фамилия"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="first_name" label="Имя" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="patronymic" label="Отчество">
            <Input />
          </Form.Item>
          <Form.Item
            name="birth_date"
            label="Дата рождения"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item name="notes" label="Заметки">
            <TextArea />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Перевод ученика"
        open={isTransferModalOpen}
        onCancel={() => setIsTransferModalOpen(false)}
        onOk={() => transferForm.submit()}
        destroyOnClose
      >
        <p>
          Ученик:{" "}
          <b>
            {editingStudent?.last_name} {editingStudent?.first_name}
          </b>
        </p>
        <Form
          form={transferForm}
          layout="vertical"
          onFinish={handleTransferStudent}
        >
          <Form.Item
            name="new_class_id"
            label="Новый класс"
            rules={[{ required: true }]}
          >
            <Select showSearch optionFilterProp="children">
              {classes
                .filter((c) => c.class_id !== selectedClassId)
                .map((c) => (
                  <Option key={c.class_id} value={c.class_id}>
                    {c.class_name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Доступ: ${editingStudent?.last_name}`}
        open={isCredsModalOpen}
        onCancel={() => setIsCredsModalOpen(false)}
        onOk={() => credsForm.submit()}
        destroyOnClose={true}
      >
        <Form form={credsForm} layout="vertical" onFinish={handleUpdateCreds}>
          <Form.Item
            name="login"
            label="Логин"
            rules={[{ required: true, message: "Введите логин" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Новый пароль"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <StudentParentsModal
        open={isParentsModalOpen}
        onCancel={() => setIsParentsModalOpen(false)}
        student={studentForParents}
      />

      <Modal
        open={!!profileStudentId}
        onCancel={() => setProfileStudentId(null)}
        footer={null}
        width={800}
        destroyOnClose
        style={{ top: 20 }}
      >
        {profileStudentId && (
          <StudentProfilePage studentIdOverride={profileStudentId} />
        )}
      </Modal>
    </>
  );
};

export default ClassesPage;

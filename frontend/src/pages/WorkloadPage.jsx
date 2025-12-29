import { useEffect, useState, useRef } from "react";
import {
  Table,
  Typography,
  message,
  Button,
  Modal,
  Form,
  Select,
  Card,
  Space,
  Popconfirm,
  Row,
  Col,
  Tag,
  Alert,
  Pagination,
} from "antd";
import {
  UserAddOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { classesApi } from "../api/classes";
import { teachersApi } from "../api/teachers";
import { academicYearsApi, workloadApi } from "../api/study";

const { Text } = Typography;
const { Option } = Select;

const HEADER_HEIGHT = 55;
const HEIGHT_BUFFER = 1;
const ROW_HEIGHT = 55;

const WorkloadPage = () => {
  const [classes, setClasses] = useState([]);
  const [years, setYears] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [workload, setWorkload] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedYearId, setSelectedYearId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    classesApi.getAll().then((data) => setClasses(data || []));
    teachersApi.getAll().then((data) => setTeachers(data || []));
    academicYearsApi.getAll().then((data) => {
      setYears(data || []);
      const current = (data || []).find((y) => y.status === "Current");
      if (current) setSelectedYearId(current.id);
      else if (data && data.length > 0) setSelectedYearId(data[0].id);
    });
  }, []);

  const fetchWorkload = () => {
    if (!selectedClassId || !selectedYearId) {
      setWorkload([]);
      return;
    }
    setLoading(true);
    workloadApi
      .get(selectedClassId, selectedYearId)
      .then((data) => {
        setWorkload(data || []);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch(() => {
        message.error("Ошибка загрузки");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWorkload();
  }, [selectedClassId, selectedYearId]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const containerHeight = entry.contentRect.height;
        const availableHeight = containerHeight - HEADER_HEIGHT - HEIGHT_BUFFER;
        if (availableHeight <= 0) {
          setPageSize(1);
          continue;
        }
        const rows = Math.floor(availableHeight / ROW_HEIGHT);
        setPageSize(Math.max(1, rows));
      }
    });
    if (tableContainerRef.current) {
      observer.observe(tableContainerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleAssign = (values) => {
    workloadApi
      .assign({
        class_id: selectedClassId,
        year_id: selectedYearId,
        discipline_id: editingItem.discipline_id,
        teacher_id: values.teacher_id,
      })
      .then(() => {
        message.success("Учитель назначен");
        setIsModalOpen(false);
        fetchWorkload();
      })
      .catch((err) => message.error(err.response?.data?.error));
  };

  const handleRemove = (disciplineId) => {
    workloadApi
      .remove(selectedClassId, disciplineId, selectedYearId)
      .then(() => {
        message.success("Учитель снят");
        fetchWorkload();
      })
      .catch((err) => message.error(err.response?.data?.error));
  };

  const getSelectedClass = () =>
    classes.find((c) => c.class_id === selectedClassId);
  const isPrimarySchool = () => {
    const c = getSelectedClass();
    return c && c.parallel_number <= 4;
  };

  const noWrapStyle = { whiteSpace: "nowrap" };
  const columns = [
    {
      title: <span style={noWrapStyle}>Предмет</span>,
      dataIndex: "discipline_name",
      key: "disc",
      sorter: (a, b) => a.discipline_name.localeCompare(b.discipline_name),
      sortDirections: ["descend"],
      render: (t) => <div style={noWrapStyle}>{t}</div>,
    },
    {
      title: <span style={noWrapStyle}>Часов</span>,
      dataIndex: "lessons_count",
      key: "hours",
      width: 80,
      sorter: (a, b) => a.lessons_count - b.lessons_count,
      sortDirections: ["descend"],
      render: (t) => <div style={noWrapStyle}>{t}</div>,
    },
    {
      title: <span style={noWrapStyle}>Учитель</span>,
      dataIndex: "teacher_full_name",
      key: "teacher",
      filters: [
        { text: "Учитель назначен", value: "assigned" },
        { text: "ВАКАНСИЯ (Нет учителя)", value: "vacancy" },
      ],
      onFilter: (value, record) => {
        if (value === "assigned") return !!record.teacher_id;
        if (value === "vacancy") return !record.teacher_id;
      },
      render: (name) => (
        <div style={noWrapStyle}>
          {name ? (
            <Tag color="blue">{name}</Tag>
          ) : (
            <Tag color="red">Не назначен</Tag>
          )}
        </div>
      ),
    },
  ];

  if (!isPrimarySchool()) {
    columns.push({
      title: "Действия",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space style={noWrapStyle}>
          <Button
            type="text"
            icon={record.teacher_id ? <EditOutlined /> : <UserAddOutlined />}
            onClick={() => {
              setEditingItem(record);
              form.setFieldsValue({ teacher_id: record.teacher_id });
              setIsModalOpen(true);
            }}
            title={record.teacher_id ? "Изменить" : "Назначить"}
          />
          {record.teacher_id && (
            <Popconfirm
              title="Снять учителя?"
              onConfirm={() => handleRemove(record.discipline_id)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    });
  }

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
        gap: 16,
      }}
    >
      <Card bodyStyle={{ padding: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Text strong style={{ marginRight: 8 }}>
              Учебный год:
            </Text>
            <Select
              style={{ width: "100%" }}
              value={selectedYearId}
              onChange={setSelectedYearId}
            >
              {years.map((y) => (
                <Option key={y.id} value={y.id}>
                  {y.name} {y.status === "Current" && "(Текущий)"}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Text strong style={{ marginRight: 8 }}>
              Класс:
            </Text>
            <Select
              style={{ width: "100%" }}
              placeholder="Выберите класс"
              value={selectedClassId}
              onChange={setSelectedClassId}
              showSearch
              optionFilterProp="children"
            >
              {classes.map((c) => (
                <Option key={c.class_id} value={c.class_id}>
                  {c.class_name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8} style={{ textAlign: "right" }}>
            <Button icon={<ReloadOutlined />} onClick={fetchWorkload}>
              Обновить
            </Button>
          </Col>
        </Row>
      </Card>

      <Card
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
        bodyStyle={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: 0,
          overflow: "hidden",
        }}
      >
        {isPrimarySchool() && (
          <div style={{ padding: "16px 16px 0 16px", marginBottom: 16 }}>
            <Alert
              message="Начальная школа"
              description="Для 1-4 классов все предметы ведет классный руководитель."
              type="info"
              showIcon
            />
          </div>
        )}
        <div ref={tableContainerRef} style={{ flex: 1, overflow: "hidden" }}>
          <Table
            dataSource={workload}
            columns={columns}
            rowKey="discipline_id"
            loading={loading}
            bordered={false}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: workload.length,
              onChange: setCurrentPage,
              position: ["none"],
            }}
          />
        </div>
        <div style={paginationFooterStyle}>
          {workload.length > 0 && (
            <Pagination
              simple
              current={currentPage}
              total={workload.length}
              pageSize={pageSize}
              onChange={setCurrentPage}
              showSizeChanger={false}
            />
          )}
        </div>
      </Card>

      <Modal
        title={`Назначение учителя: ${editingItem?.discipline_name}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAssign}
          preserve={false}
        >
          <Form.Item
            name="teacher_id"
            label="Выберите учителя"
            rules={[{ required: true, message: "Выберите учителя" }]}
          >
            <Select showSearch optionFilterProp="children">
              {teachers.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.last_name} {t.first_name} {t.patronymic}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkloadPage;

import { useEffect, useState, useRef } from "react";
import {
  Table,
  message,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Card,
  Space,
  Popconfirm,
  DatePicker,
  Tag,
  Pagination,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
  BookOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { academicYearsApi, disciplinesApi, studyPlansApi } from "../api/study";

const { Option } = Select;

const HEADER_HEIGHT = 55;
const HEIGHT_BUFFER = 1;
const PLAN_ROW_HEIGHT = 53.1;
const ITEM_ROW_HEIGHT = 62;

const StudyPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [planItems, setPlanItems] = useState([]);
  const [years, setYears] = useState([]);
  const [disciplines, setDisciplines] = useState([]);

  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedPlanRecord, setSelectedPlanRecord] = useState(null);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isYearsModalOpen, setIsYearsModalOpen] = useState(false);
  const [isNewYearModalOpen, setIsNewYearModalOpen] = useState(false);
  const [isDisciplinesModalOpen, setIsDisciplinesModalOpen] = useState(false);

  const [disciplineForm] = Form.useForm();
  const [planForm] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [yearForm] = Form.useForm();

  const [plansPageSize, setPlansPageSize] = useState(10);
  const [itemsPageSize, setItemsPageSize] = useState(10);
  const [plansPage, setPlansPage] = useState(1);
  const [itemsPage, setItemsPage] = useState(1);

  const MODAL_PAGE_SIZE = 7;
  const [yearsPage, setYearsPage] = useState(1);
  const [disciplinesPage, setDisciplinesPage] = useState(1);

  const tableContainerRef = useRef(null);

  const fetchYears = () =>
    academicYearsApi.getAll().then((data) => setYears(data || []));

  const fetchDisciplines = () =>
    disciplinesApi.getAll().then((data) => setDisciplines(data || []));

  const fetchPlans = () =>
    studyPlansApi.getAll().then((data) => setPlans(data || []));

  const fetchPlanItems = (id) => {
    if (!id) {
      setPlanItems([]);
      return;
    }
    studyPlansApi.getItems(id).then((data) => {
      setPlanItems(data || []);
      setItemsPage(1);
    });
  };

  useEffect(() => {
    fetchYears();
    fetchDisciplines();
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchPlanItems(selectedPlanId);
  }, [selectedPlanId]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const containerHeight = entry.contentRect.height;
        const availableHeight = containerHeight - HEADER_HEIGHT - HEIGHT_BUFFER;
        if (availableHeight <= 0) {
          setPlansPageSize(1);
          setItemsPageSize(1);
          continue;
        }
        const calcPlanSize = Math.floor(availableHeight / PLAN_ROW_HEIGHT);
        const calcItemSize = Math.floor(availableHeight / ITEM_ROW_HEIGHT);
        setPlansPageSize(Math.max(1, calcPlanSize));
        setItemsPageSize(Math.max(1, calcItemSize));
      }
    });
    if (tableContainerRef.current) {
      observer.observe(tableContainerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const currentYears = years.slice(
    (yearsPage - 1) * MODAL_PAGE_SIZE,
    yearsPage * MODAL_PAGE_SIZE
  );
  const currentDisciplines = disciplines.slice(
    (disciplinesPage - 1) * MODAL_PAGE_SIZE,
    disciplinesPage * MODAL_PAGE_SIZE
  );

  const handleCreatePlan = (values) => {
    studyPlansApi
      .createPlan(values)
      .then(() => {
        message.success("План создан");
        setIsPlanModalOpen(false);
        planForm.resetFields();
        fetchPlans();
      })
      .catch((err) => message.error(err.response?.data?.error));
  };

  const handleAddItem = (values) => {
    studyPlansApi
      .upsertItem({ ...values, study_plan_id: selectedPlanId })
      .then(() => {
        message.success("Предмет добавлен");
        setIsItemModalOpen(false);
        itemForm.resetFields();
        fetchPlanItems(selectedPlanId);
      })
      .catch((err) => message.error(err.response?.data?.error));
  };

  const handleDeleteItem = (id) => {
    studyPlansApi.deleteItem(id).then(() => {
      message.success("Предмет удален");
      fetchPlanItems(selectedPlanId);
    });
  };

  const handleCreateYear = (values) => {
    const payload = {
      name: values.name,
      start_date: values.dates[0].format("YYYY-MM-DD"),
      end_date: values.dates[1].format("YYYY-MM-DD"),
    };
    academicYearsApi.create(payload).then(() => {
      message.success("Год создан");
      setIsNewYearModalOpen(false);
      fetchYears();
    });
  };

  const handleChangeYearStatus = (id, status) => {
    academicYearsApi
      .updateStatus(id, status)
      .then(() => {
        message.success("Статус обновлен");
        fetchYears();
      })
      .catch((err) => message.error(err.response?.data?.error));
  };

  const handleCreateDiscipline = (values) => {
    disciplinesApi
      .create(values)
      .then(() => {
        message.success("Предмет создан");
        disciplineForm.resetFields();
        fetchDisciplines();
      })
      .catch((err) => message.error(err.response?.data?.error));
  };

  const handleDeleteDiscipline = (id) => {
    disciplinesApi
      .delete(id)
      .then(() => {
        message.success("Предмет удален");
        fetchDisciplines();
      })
      .catch((err) => message.error(err.response?.data?.error));
  };

  const handlePromoteStudents = () => {
    const currentYear = years.find((y) => y.status === "Current");
    const nextYear = years
      .filter((y) => y.status === "Upcoming")
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0];

    if (!currentYear) {
      message.error("Нет текущего года для завершения");
      return;
    }
    if (!nextYear) {
      message.error("Нет следующего года (Upcoming)");
      return;
    }

    Modal.confirm({
      title: `Завершить ${currentYear.name} и перевести всех в ${nextYear.name}?`,
      content: "Это действие необратимо. 11-е классы будут выпущены.",
      okText: "Да, перевести",
      cancelText: "Отмена",
      onOk: () => {
        academicYearsApi
          .promote(currentYear.id, nextYear.id)
          .then(() => {
            message.success("Ученики переведены!");
            fetchYears();
          })
          .catch((err) => message.error(err.response?.data?.error || "Ошибка"));
      },
    });
  };

  const noWrapStyle = { whiteSpace: "nowrap" };
  const paginationFooterStyle = {
    padding: "12px 24px",
    display: "flex",
    justifyContent: "flex-end",
    borderTop: "1px solid #f0f0f0",
    background: "#fff",
    minHeight: "57px",
    boxSizing: "border-box",
  };

  const planColumns = [
    {
      title: <span style={noWrapStyle}>Название</span>,
      dataIndex: "name",
      key: "name",
      sorter: (a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true }),
      sortDirections: ["descend"],
      render: (t) => <div style={noWrapStyle}>{t}</div>,
    },
    {
      title: <span style={noWrapStyle}>Учебный год</span>,
      dataIndex: "academic_year_name",
      key: "year",
      sorter: (a, b) =>
        a.academic_year_name.localeCompare(b.academic_year_name),
      sortDirections: ["descend"],
      render: (t) => <div style={noWrapStyle}>{t}</div>,
    },
    {
      title: <span style={noWrapStyle}>Параллель</span>,
      dataIndex: "parallel_number",
      key: "parallel",
      sorter: (a, b) => a.parallel_number - b.parallel_number,
      sortDirections: ["descend"],
      filters: Array.from({ length: 11 }, (_, i) => ({
        text: `${i + 1}-е классы`,
        value: i + 1,
      })),
      onFilter: (value, record) => record.parallel_number === value,
      render: (t) => <div style={noWrapStyle}>{t}</div>,
    },
  ];

  const itemColumns = [
    {
      title: <span style={noWrapStyle}>Дисциплина</span>,
      dataIndex: "discipline_name",
      key: "discipline",
      sorter: (a, b) => a.discipline_name.localeCompare(b.discipline_name),
      sortDirections: ["descend"],
      render: (t) => <div style={noWrapStyle}>{t}</div>,
    },
    {
      title: <span style={noWrapStyle}>Часов</span>,
      dataIndex: "lessons_count",
      key: "lessons",
      width: 100,
      sorter: (a, b) => a.lessons_count - b.lessons_count,
      sortDirections: ["descend"],
      render: (t) => <div style={noWrapStyle}>{t}</div>,
    },
    {
      title: "Действия",
      key: "act",
      width: 120,
      align: "center",
      render: (_, r) => (
        <Popconfirm title="Удалить?" onConfirm={() => handleDeleteItem(r.id)}>
          <Button danger type="text" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const yearColumns = [
    {
      title: <span style={noWrapStyle}>Название</span>,
      dataIndex: "name",
      key: "name",
      render: (t) => <div style={noWrapStyle}>{t}</div>,
    },
    {
      title: <span style={noWrapStyle}>Начало</span>,
      dataIndex: "start_date",
      key: "start",
      render: (t) => <div style={noWrapStyle}>{t}</div>,
    },
    {
      title: <span style={noWrapStyle}>Конец</span>,
      dataIndex: "end_date",
      key: "end",
      render: (t) => <div style={noWrapStyle}>{t}</div>,
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status, r) => (
        <Space style={noWrapStyle}>
          <Tag
            color={
              status === "Current"
                ? "green"
                : status === "Archived"
                ? "gray"
                : "blue"
            }
          >
            {status}
          </Tag>
          {status !== "Current" && status !== "Archived" && (
            <Button
              size="small"
              type="link"
              onClick={() => handleChangeYearStatus(r.id, "Current")}
            >
              Сделать текущим
            </Button>
          )}
          {status === "Current" && (
            <Button
              size="small"
              type="link"
              danger
              onClick={() => handleChangeYearStatus(r.id, "Archived")}
            >
              В архив
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const disciplinesColumns = [
    {
      title: <span style={noWrapStyle}>Название</span>,
      dataIndex: "name",
      key: "name",
      render: (t) => <div style={noWrapStyle}>{t}</div>,
    },
    {
      title: "Действия",
      key: "act",
      width: 80,
      render: (_, r) => (
        <Popconfirm
          title="Удалить?"
          onConfirm={() => handleDeleteDiscipline(r.id)}
        >
          <Button danger type="text" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Row gutter={16} style={{ height: "100%", flex: 1, minHeight: 0 }}>
      <Col
        span={12}
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <Card
          title="Учебные планы"
          extra={
            <Space>
              <Button
                icon={<BookOutlined />}
                onClick={() => {
                  setDisciplinesPage(1);
                  setIsDisciplinesModalOpen(true);
                }}
              >
                Предметы
              </Button>
              <Button
                icon={<CalendarOutlined />}
                onClick={() => {
                  setYearsPage(1);
                  yearForm.resetFields();
                  setIsYearsModalOpen(true);
                }}
              >
                Учебные годы
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  planForm.resetFields();
                  setIsPlanModalOpen(true);
                }}
              >
                Создать план
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
              dataSource={plans}
              columns={planColumns}
              rowKey="id"
              bordered={false}
              onRow={(record) => ({
                onClick: () => {
                  setSelectedPlanId(record.id);
                  setSelectedPlanRecord(record);
                },
                style: {
                  cursor: "pointer",
                  background: record.id === selectedPlanId ? "#e6f7ff" : "",
                },
              })}
              pagination={{
                current: plansPage,
                pageSize: plansPageSize,
                total: plans.length,
                onChange: setPlansPage,
                position: ["none"],
              }}
            />
          </div>
          <div style={paginationFooterStyle}>
            {plans.length > 0 && (
              <Pagination
                simple
                current={plansPage}
                total={plans.length}
                pageSize={plansPageSize}
                onChange={setPlansPage}
              />
            )}
          </div>
        </Card>
      </Col>

      <Col
        span={12}
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <Card
          title={
            selectedPlanRecord
              ? `Предметы плана: ${selectedPlanRecord.name}`
              : "Выберите план слева"
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={!selectedPlanId}
              onClick={() => {
                itemForm.resetFields();
                setIsItemModalOpen(true);
              }}
            >
              Добавить предмет
            </Button>
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
          <div style={{ flex: 1, overflow: "hidden" }}>
            <Table
              dataSource={planItems}
              columns={itemColumns}
              rowKey="id"
              bordered={false}
              pagination={{
                current: itemsPage,
                pageSize: itemsPageSize,
                total: planItems.length,
                onChange: setItemsPage,
                position: ["none"],
              }}
            />
          </div>
          <div style={paginationFooterStyle}>
            {planItems.length > 0 && (
              <Pagination
                simple
                current={itemsPage}
                total={planItems.length}
                pageSize={itemsPageSize}
                onChange={setItemsPage}
              />
            )}
          </div>
        </Card>
      </Col>

      <Modal
        title="Новый учебный план"
        open={isPlanModalOpen}
        onCancel={() => setIsPlanModalOpen(false)}
        onOk={() => planForm.submit()}
        destroyOnClose={true}
      >
        <Form
          form={planForm}
          layout="vertical"
          onFinish={handleCreatePlan}
          initialValues={{ parallel_number: 1 }}
          preserve={false}
        >
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: "Введите название плана" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="academic_year_id"
            label="Учебный год"
            rules={[{ required: true, message: "Выберите учебный год" }]}
          >
            <Select>
              {years.map((y) => (
                <Option key={y.id} value={y.id}>
                  {y.name} ({y.status})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="parallel_number" label="Параллель (1-11)">
            <InputNumber min={1} max={11} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Добавить предмет в план"
        open={isItemModalOpen}
        onCancel={() => setIsItemModalOpen(false)}
        onOk={() => itemForm.submit()}
        destroyOnClose={true}
      >
        <Form
          form={itemForm}
          layout="vertical"
          onFinish={handleAddItem}
          initialValues={{ lessons_count: 1 }}
          preserve={false}
        >
          <Form.Item
            name="discipline_id"
            label="Предмет"
            rules={[{ required: true, message: "Выберите предмет" }]}
          >
            <Select showSearch optionFilterProp="children">
              {disciplines.map((d) => (
                <Option key={d.id} value={d.id}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="lessons_count" label="Часов в год">
            <InputNumber min={1} max={500} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Управление учебными годами"
        open={isYearsModalOpen}
        onCancel={() => setIsYearsModalOpen(false)}
        width={800}
        footer={[
          <Button
            key="promote"
            type="dashed"
            danger
            icon={<RiseOutlined />}
            onClick={handlePromoteStudents}
          >
            Завершить год
          </Button>,
          <Button
            key="add"
            icon={<PlusOutlined />}
            onClick={() => {
              yearForm.resetFields();
              setIsNewYearModalOpen(true);
            }}
          >
            Создать год
          </Button>,
          <Button key="close" onClick={() => setIsYearsModalOpen(false)}>
            Закрыть
          </Button>,
        ]}
      >
        <Table
          dataSource={currentYears}
          columns={yearColumns}
          rowKey="id"
          pagination={false}
        />
        {years.length > 0 && (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Pagination
              simple
              current={yearsPage}
              total={years.length}
              pageSize={MODAL_PAGE_SIZE}
              onChange={setYearsPage}
            />
          </div>
        )}
      </Modal>

      <Modal
        title="Новый учебный год"
        open={isNewYearModalOpen}
        onCancel={() => setIsNewYearModalOpen(false)}
        onOk={() => yearForm.submit()}
        destroyOnClose={true}
      >
        <Form
          form={yearForm}
          layout="vertical"
          onFinish={handleCreateYear}
          preserve={false}
        >
          <Form.Item
            name="name"
            label="Название (напр. 2024-2025)"
            rules={[{ required: true, message: "Введите название года" }]}
          >
            <Input placeholder="2025-2026" />
          </Form.Item>
          <Form.Item
            name="dates"
            label="Период"
            rules={[{ required: true, message: "Выберите даты" }]}
          >
            <DatePicker.RangePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Справочник дисциплин"
        open={isDisciplinesModalOpen}
        onCancel={() => setIsDisciplinesModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDisciplinesModalOpen(false)}>
            Закрыть
          </Button>,
        ]}
      >
        <Form
          layout="inline"
          form={disciplineForm}
          onFinish={handleCreateDiscipline}
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Название" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="Название предмета" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Добавить
            </Button>
          </Form.Item>
        </Form>
        <Table
          dataSource={currentDisciplines}
          columns={disciplinesColumns}
          rowKey="id"
          pagination={false}
          size="small"
          bordered
        />
        {disciplines.length > 0 && (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Pagination
              simple
              current={disciplinesPage}
              total={disciplines.length}
              pageSize={MODAL_PAGE_SIZE}
              onChange={setDisciplinesPage}
            />
          </div>
        )}
      </Modal>
    </Row>
  );
};

export default StudyPlansPage;

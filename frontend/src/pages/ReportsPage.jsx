import { useState, useEffect, useMemo } from "react";
import {
  Tabs,
  Form,
  Select,
  DatePicker,
  Button,
  Table,
  Card,
  Row,
  Col,
  Tag,
  Pagination,
  Statistic,
  Typography,
  Modal,
} from "antd";
import {
  BarChartOutlined,
  LineChartOutlined,
  TeamOutlined,
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import dayjs from "dayjs";
import { academicYearsApi } from "../api/study";
import { reportsApi } from "../api/reports";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;
const PAGE_SIZE = 10;

const exportToCSV = (data, columns, filename) => {
  if (!data || !data.length) return;
  const header = columns.map((c) => c.title).join(",");
  const body = data
    .map((row) => {
      return columns
        .map((c) => {
          let val = row[c.dataIndex] || row[c.key];
          if (typeof val === "string") val = `"${val.replace(/"/g, '""')}"`;
          return val;
        })
        .join(",");
    })
    .join("\n");
  const blob = new Blob([`\uFEFF${header}\n${body}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `${filename}_${dayjs().format("YYYY-MM-DD")}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const parseWorkloadString = (str) => {
  if (!str) return [];
  return str
    .split(";")
    .map((item) => {
      const trimmed = item.trim();
      const match = trimmed.match(/^(.*?) - (.*?) \((\d+)\s*з\.\)$/);
      if (match)
        return {
          class: match[1],
          subject: match[2],
          hours: parseInt(match[3]),
        };
      return { class: "", subject: trimmed, hours: 0 };
    })
    .filter((x) => x.subject);
};

const CustomChartLegend = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: 24,
      marginTop: 0,
      paddingTop: 12,
      borderTop: "1px solid #f0f0f0",
      flexWrap: "wrap",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{ width: 24, height: 0, borderTop: "2px dashed #52c41a" }}
      ></div>
      <Text type="secondary" style={{ fontSize: 12 }}>
        5 - Отлично
      </Text>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{ width: 24, height: 0, borderTop: "2px dashed #a0d911" }}
      ></div>
      <Text type="secondary" style={{ fontSize: 12 }}>
        4 - Хорошо
      </Text>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{ width: 24, height: 0, borderTop: "2px dashed #faad14" }}
      ></div>
      <Text type="secondary" style={{ fontSize: 12 }}>
        3 - Удовлетворительно
      </Text>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{ width: 24, height: 0, borderTop: "2px dashed #ff4d4f" }}
      ></div>
      <Text type="secondary" style={{ fontSize: 12 }}>
        2 - Неудовлетворительно
      </Text>
    </div>
  </div>
);

const ReportsPage = () => {
  const [years, setYears] = useState([]);
  const [currentYearId, setCurrentYearId] = useState(null);

  useEffect(() => {
    academicYearsApi.getAll().then((data) => {
      setYears(data || []);
      const active =
        (data || []).find((y) => y.is_current || y.status === "Current") ||
        data[0];
      if (active) setCurrentYearId(active.id);
    });
  }, []);

  if (years.length === 0 && !currentYearId)
    return <Card loading bordered={false} />;

  const items = [
    {
      key: "performance",
      label: (
        <span>
          <BarChartOutlined /> Успеваемость
        </span>
      ),
      children: <PerformanceTab defaultYear={currentYearId} years={years} />,
    },
    {
      key: "teachers",
      label: (
        <span>
          <LineChartOutlined /> Нагрузка учителей
        </span>
      ),
      children: <TeachersTab defaultYear={currentYearId} years={years} />,
    },
    {
      key: "movement",
      label: (
        <span>
          <TeamOutlined /> Движение
        </span>
      ),
      children: <MovementTab />,
    },
  ];

  return (
    <div style={{ padding: 16, paddingBottom: 40 }}>
      <Tabs
        defaultActiveKey="performance"
        items={items}
        type="line"
        tabBarStyle={{ background: "#fff", paddingLeft: 16 }}
        style={{ overflow: "visible" }}
      />
    </div>
  );
};

const PerformanceTab = ({ defaultYear, years }) => {
  const [allData, setAllData] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [form] = Form.useForm();

  useEffect(() => {
    if (defaultYear) {
      const start = dayjs().startOf("year");
      const end = dayjs().endOf("year");
      form.setFieldsValue({ year_id: defaultYear, dates: [start, end] });
      fetchData({ year_id: defaultYear, dates: [start, end] });
    }
  }, [defaultYear]);

  const fetchData = (values) => {
    setLoading(true);
    const start = values.dates[0].format("YYYY-MM-DD");
    const end = values.dates[1].format("YYYY-MM-DD");

    reportsApi
      .getPerformance(values.year_id, start, end)
      .then((data) => {
        setAllData(data || []);
        setActiveFilters({});
        setCurrentPage(1);
      })
      .finally(() => setLoading(false));
  };

  const filteredData = useMemo(() => {
    if (Object.keys(activeFilters).length === 0) return allData;
    return allData.filter((item) => {
      return Object.keys(activeFilters).every((key) => {
        const filterValues = activeFilters[key];
        if (!filterValues || filterValues.length === 0) return true;
        return filterValues.includes(item[key]);
      });
    });
  }, [allData, activeFilters]);

  const handleTableChange = (pagination, filters, sorter) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  const currentTableData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const chartData = useMemo(() => {
    if (filteredData.length === 0) return [];
    const uniqueClasses = new Set(filteredData.map((d) => d.class_name));
    if (uniqueClasses.size <= 1) {
      return filteredData
        .map((d) => ({
          name: d.discipline_name,
          value: parseFloat(d.avg_grade),
        }))
        .sort((a, b) => b.value - a.value);
    }
    const aggregation = {};
    filteredData.forEach((d) => {
      if (!aggregation[d.discipline_name])
        aggregation[d.discipline_name] = { total: 0, count: 0 };
      aggregation[d.discipline_name].total += parseFloat(d.avg_grade);
      aggregation[d.discipline_name].count += 1;
    });
    return Object.keys(aggregation)
      .map((key) => ({
        name: key,
        value: (aggregation[key].total / aggregation[key].count).toFixed(2),
        isAggregated: true,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 25);
  }, [filteredData]);

  const columns = [
    {
      title: "Класс",
      dataIndex: "class_name",
      key: "class_name",
      width: 100,
      filters: [...new Set(allData.map((d) => d.class_name))]
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((c) => ({ text: c, value: c })),
      filteredValue: activeFilters.class_name || null,
    },
    {
      title: "Предмет",
      dataIndex: "discipline_name",
      key: "discipline_name",
      filters: [...new Set(allData.map((d) => d.discipline_name))]
        .sort()
        .map((d) => ({ text: d, value: d })),
      filteredValue: activeFilters.discipline_name || null,
    },
    {
      title: "Ср. балл",
      dataIndex: "avg_grade",
      key: "avg_grade",
      width: 120,
      sorter: (a, b) => a.avg_grade - b.avg_grade,
      render: (val) => {
        let color =
          val >= 4.5
            ? "green"
            : val >= 3.6
            ? "blue"
            : val >= 2.6
            ? "orange"
            : "red";
        return (
          <Tag color={color} style={{ fontSize: 14, fontWeight: 600 }}>
            {val}
          </Tag>
        );
      },
    },
    {
      title: "Качество знаний",
      dataIndex: "quality_percent",
      key: "quality_percent",
      render: (val) => (
        <div style={{ width: 150 }}>
          <div
            style={{
              height: 6,
              background: "#f0f0f0",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${val}%`,
                background: val > 50 ? "#52c41a" : "#faad14",
                height: "100%",
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
            {val}%
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card bodyStyle={{ padding: 16 }}>
        <Form form={form} layout="inline" onFinish={fetchData}>
          <Form.Item name="year_id" label="Год">
            <Select style={{ width: 120 }}>
              {years.map((y) => (
                <Option key={y.id} value={y.id}>
                  {y.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="dates" label="Период">
            <RangePicker style={{ width: 220 }} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={loading}
            >
              Загрузить
            </Button>
          </Form.Item>
          <Form.Item style={{ marginLeft: "auto", marginRight: 0 }}>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => exportToCSV(filteredData, columns, "performance")}
            >
              CSV
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Card bodyStyle={{ padding: 0 }} style={{ overflow: "hidden" }}>
        {chartData.length > 0 && (
          <div style={{ padding: 20, borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  barSize={30}
                  margin={{ top: 10, bottom: 110, left: 30, right: 30 }}
                >
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={110}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis domain={[0, 5.2]} hide />
                  <ReferenceLine y={5} stroke="#52c41a" strokeDasharray="5 5" />
                  <ReferenceLine y={4} stroke="#a0d911" strokeDasharray="5 5" />
                  <ReferenceLine y={3} stroke="#faad14" strokeDasharray="5 5" />
                  <ReferenceLine y={2} stroke="#ff4d4f" strokeDasharray="5 5" />
                  <RechartsTooltip
                    formatter={(val) => [val, "Средний балл"]}
                    cursor={{ fill: "#f5f5f5" }}
                  />
                  <Bar dataKey="value" fill="#1890ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <CustomChartLegend />
          </div>
        )}
        <Table
          dataSource={currentTableData}
          columns={columns}
          rowKey={(r) => r.class_name + r.discipline_name}
          loading={loading}
          onChange={handleTableChange}
          pagination={false}
          size="middle"
        />
        {filteredData.length > 0 && (
          <div
            style={{
              padding: "12px 24px",
              display: "flex",
              justifyContent: "flex-end",
              borderTop: "1px solid #f0f0f0",
              background: "#fff",
            }}
          >
            <Pagination
              simple
              showSizeChanger={false}
              current={currentPage}
              total={filteredData.length}
              pageSize={PAGE_SIZE}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

const TeachersTab = ({ defaultYear, years }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [detailsModal, setDetailsModal] = useState({
    open: false,
    teacherName: "",
    items: [],
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (defaultYear) {
      form.setFieldsValue({ year_id: defaultYear });
      fetchData({ year_id: defaultYear });
    }
  }, [defaultYear]);

  const fetchData = (values) => {
    setLoading(true);
    reportsApi
      .getTeachersWorkload(values.year_id)
      .then((data) => {
        setData(data || []);
        setCurrentPage(1);
      })
      .finally(() => setLoading(false));
  };

  const showDetails = (record) => {
    const items = parseWorkloadString(record.workload_details);
    items.sort((a, b) => {
      const numA = parseInt(a.class) || 0;
      const numB = parseInt(b.class) || 0;
      if (numA !== numB) return numA - numB;
      return a.class.localeCompare(b.class);
    });
    setDetailsModal({
      open: true,
      teacherName: record.teacher_full_name,
      items: items,
    });
  };

  const currentTableData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, currentPage]);

  const columns = [
    {
      title: "ФИО Учителя",
      dataIndex: "teacher_full_name",
      key: "name",
      width: "25%",
    },
    {
      title: "Часы",
      dataIndex: "total_lessons_count",
      key: "total",
      width: 100,
      sorter: (a, b) => a.total_lessons_count - b.total_lessons_count,
      render: (val) => <b>{val}</b>,
    },
    {
      title: "Нагрузка",
      key: "viz",
      render: (_, record) => {
        const max = 1200;
        const percent = Math.min(100, (record.total_lessons_count / max) * 100);
        return (
          <div style={{ width: "90%" }}>
            <div
              style={{
                height: 8,
                background: "#f5f5f5",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${percent}%`,
                  height: "100%",
                  background: percent > 85 ? "#faad14" : "#1890ff",
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      title: "",
      key: "actions",
      width: 60,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => showDetails(record)}
          title="Детали"
        />
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card bodyStyle={{ padding: 16 }}>
        <Form form={form} layout="inline" onFinish={fetchData}>
          <Form.Item name="year_id" label="Год">
            <Select style={{ width: 120 }}>
              {years.map((y) => (
                <Option key={y.id} value={y.id}>
                  {y.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={loading}
            >
              Загрузить
            </Button>
          </Form.Item>
          <Form.Item style={{ marginLeft: "auto", marginRight: 0 }}>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => exportToCSV(data, columns, "teachers_workload")}
            >
              CSV
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Card bodyStyle={{ padding: 0 }} style={{ overflow: "hidden" }}>
        <Table
          dataSource={currentTableData}
          columns={columns}
          rowKey="teacher_id"
          pagination={false}
          size="middle"
        />
        {data.length > 0 && (
          <div
            style={{
              padding: "12px 24px",
              display: "flex",
              justifyContent: "flex-end",
              borderTop: "1px solid #f0f0f0",
              background: "#fff",
            }}
          >
            <Pagination
              simple
              showSizeChanger={false}
              current={currentPage}
              total={data.length}
              pageSize={PAGE_SIZE}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </Card>
      <Modal
        title={detailsModal.teacherName}
        open={detailsModal.open}
        onCancel={() => setDetailsModal({ ...detailsModal, open: false })}
        footer={null}
        width={600}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          dataSource={detailsModal.items}
          rowKey={(r) => r.class + r.subject}
          pagination={false}
          size="small"
          scroll={{ y: 400 }}
          columns={[
            { title: "Класс", dataIndex: "class", width: 80 },
            { title: "Предмет", dataIndex: "subject" },
            {
              title: "Часы",
              dataIndex: "hours",
              width: 80,
              align: "right",
              render: (val) => <Tag>{val}</Tag>,
            },
          ]}
        />
      </Modal>
    </div>
  );
};

const MovementTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleReport = (values) => {
    setLoading(true);
    const start = values.dates[0].format("YYYY-MM-DD");
    const end = values.dates[1].format("YYYY-MM-DD");
    reportsApi
      .getMovement(start, end)
      .then((data) => {
        setData(data);
        setCurrentPage(1);
      })
      .finally(() => setLoading(false));
  };

  const tableData = data
    ? [
        ...data.arrivedStudents.map((s) => ({ ...s, status: "arrival" })),
        ...data.departedStudents.map((s) => ({ ...s, status: "departure" })),
      ]
    : [];
  const currentTableData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return tableData.slice(start, start + PAGE_SIZE);
  }, [tableData, currentPage]);
  const columns = [
    {
      title: "Статус",
      dataIndex: "status",
      width: 100,
      render: (val) =>
        val === "arrival" ? (
          <Tag color="green">Прибыл</Tag>
        ) : (
          <Tag color="red">Выбыл</Tag>
        ),
    },
    { title: "ФИО Ученика", dataIndex: "fullName" },
    { title: "Класс", dataIndex: "className", width: 100 },
    {
      title: "Дата",
      dataIndex: "enrollmentDate",
      render: (v, r) => v || r.departureDate,
      width: 120,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card bodyStyle={{ padding: 16 }}>
        <Form layout="inline" onFinish={handleReport}>
          <Form.Item name="dates" label="Период" rules={[{ required: true }]}>
            <RangePicker />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={loading}
            >
              Сформировать
            </Button>
          </Form.Item>
          <Form.Item style={{ marginLeft: "auto", marginRight: 0 }}>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => exportToCSV(tableData, columns, "movement")}
              disabled={!data}
            >
              CSV
            </Button>
          </Form.Item>
        </Form>
      </Card>
      {data && (
        <>
          <Row gutter={16}>
            <Col span={6}>
              <Card size="small">
                <Statistic title="На начало" value={data.totalAtStart} />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Прибыло"
                  value={data.arrivedCount}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={<ArrowRightOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Выбыло"
                  value={data.departedCount}
                  valueStyle={{ color: "#cf1322" }}
                  prefix={<ArrowRightOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic title="На конец" value={data.totalAtEnd} />
              </Card>
            </Col>
          </Row>
          <Card
            bodyStyle={{ padding: 0 }}
            title="Детализация движения"
            style={{ overflow: "hidden" }}
          >
            <Table
              dataSource={currentTableData}
              columns={columns}
              rowKey="fullName"
              pagination={false}
              size="middle"
            />
            {tableData.length > 0 && (
              <div
                style={{
                  padding: "12px 24px",
                  display: "flex",
                  justifyContent: "flex-end",
                  borderTop: "1px solid #f0f0f0",
                  background: "#fff",
                }}
              >
                <Pagination
                  simple
                  showSizeChanger={false}
                  current={currentPage}
                  total={tableData.length}
                  pageSize={PAGE_SIZE}
                  onChange={setCurrentPage}
                />
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default ReportsPage;

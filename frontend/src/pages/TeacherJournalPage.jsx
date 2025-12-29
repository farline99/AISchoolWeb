import { useEffect, useState } from "react";
import {
  Table,
  Select,
  DatePicker,
  Card,
  message,
  Input,
  Dropdown,
  Button,
  Modal,
  Form,
  Space,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import StudentProfilePage from "./StudentProfilePage";
import { teachersApi } from "../api/teachers";
import { journalApi } from "../api/reports";

const TeacherJournalPage = () => {
  const [classes, setClasses] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState(null);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [gradesMap, setGradesMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [topicForm] = Form.useForm();
  const [profileStudentId, setProfileStudentId] = useState(null);
  const [loadedYearId, setLoadedYearId] = useState(null);

  useEffect(() => {
    teachersApi.getClasses().then((data) => setClasses(data || []));
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      teachersApi.getDisciplines(selectedClassId).then((data) => {
        setDisciplines(data || []);
        setSelectedDisciplineId(null);
      });
    }
  }, [selectedClassId]);

  const fetchJournal = () => {
    if (!selectedClassId || !selectedDisciplineId) return;
    setLoading(true);
    journalApi
      .get(
        selectedClassId,
        selectedDisciplineId,
        currentDate.format("MM"),
        currentDate.format("YYYY")
      )
      .then((data) => {
        const { students, lessons, grades, year_id } = data;
        const map = {};
        students.forEach((s) => (map[s.student_id] = {}));
        grades.forEach((g) => {
          if (map[g.student_id])
            map[g.student_id][g.lesson_id] =
              g.work_type === "Н" ? "Н" : g.grade;
        });
        setStudents(students);
        setLessons(lessons);
        setGradesMap(map);
        setLoadedYearId(year_id);
        setLoading(false);
      })
      .catch((err) => {
        message.error("Ошибка");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJournal();
  }, [selectedClassId, selectedDisciplineId, currentDate]);

  const handleGradeChange = (studentId, lessonId, value, lessonDate) => {
    const oldVal = gradesMap[studentId][lessonId];
    setGradesMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [lessonId]: value },
    }));
    journalApi
      .saveGrade({
        action: "single",
        student_id: studentId,
        lesson_id: lessonId,
        value,
        lesson_date: lessonDate,
      })
      .catch(() =>
        setGradesMap((prev) => ({
          ...prev,
          [studentId]: { ...prev[studentId], [lessonId]: oldVal },
        }))
      );
  };

  const handleBulkAction = (lessonId, lessonDate, type) => {
    let payload = {
      action: "bulk",
      lesson_id: lessonId,
      lesson_date: lessonDate,
      student_ids: students.map((s) => s.student_id),
    };
    if (type === "clear") {
      payload.grade = 0;
      payload.work_type = "";
    } else if (type === "absent") {
      payload.grade = null;
      payload.work_type = "Н";
    } else {
      payload.grade = parseInt(type);
      payload.work_type = "Работа на уроке";
    }
    journalApi.saveGrade(payload).then(() => {
      message.success("Успешно");
      fetchJournal();
    });
  };

  const handleUpdateTopic = (values) => {
    journalApi
      .updateTopic({
        lesson_id: editingLesson.lesson_id,
        lesson_date: values.lesson_date.format("YYYY-MM-DD"),
        topic: values.topic,
      })
      .then(() => {
        message.success("Урок обновлен");
        setIsTopicModalOpen(false);
        fetchJournal();
      });
  };

  const columns = [
    {
      title: "Ученик",
      dataIndex: "full_name",
      key: "student",
      width: 200,
      fixed: "left",
      render: (_, r) => (
        <a onClick={() => setProfileStudentId(r.student_id)}>
          {r.last_name} {r.first_name}
        </a>
      ),
    },
  ];

  lessons.forEach((lesson) => {
    const dateStr = lesson.lesson_date ? (
      dayjs(lesson.lesson_date).format("DD.MM")
    ) : (
      <span style={{ color: "#999", fontSize: "12px" }}>План</span>
    );
    const menuItems = [
      {
        key: "edit",
        label: "Редактировать урок",
        icon: <EditOutlined />,
        onClick: () => {
          setEditingLesson(lesson);
          topicForm.setFieldsValue({
            lesson_date: dayjs(lesson.lesson_date || new Date()),
            topic: lesson.topic,
          });
          setIsTopicModalOpen(true);
        },
      },
      { type: "divider" },
      {
        key: "5",
        label: "Поставить всем 5",
        onClick: () =>
          handleBulkAction(lesson.lesson_id, lesson.lesson_date, "5"),
      },
      {
        key: "absent",
        label: "Отметить пропуски (Н)",
        onClick: () =>
          handleBulkAction(lesson.lesson_id, lesson.lesson_date, "absent"),
      },
      { type: "divider" },
      {
        key: "clear",
        label: "Очистить столбец",
        danger: true,
        icon: <DeleteOutlined />,
        onClick: () =>
          handleBulkAction(lesson.lesson_id, lesson.lesson_date, "clear"),
      },
    ];
    columns.push({
      title: (
        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <div style={{ cursor: "pointer", textAlign: "center" }}>
            <div>{dateStr}</div>
          </div>
        </Dropdown>
      ),
      dataIndex: `lesson_${lesson.lesson_id}`,
      key: lesson.lesson_id,
      width: 70,
      align: "center",
      render: (_, student) => {
        const val = gradesMap[student.student_id]?.[lesson.lesson_id] || "";
        return (
          <Input
            value={val}
            onChange={(e) => {
              const v = e.target.value.toUpperCase();
              if (v === "" || ["2", "3", "4", "5", "Н", "H"].includes(v))
                handleGradeChange(
                  student.student_id,
                  lesson.lesson_id,
                  v,
                  lesson.lesson_date
                );
            }}
            style={{
              textAlign: "center",
              border: "none",
              background: "transparent",
              padding: 0,
              color: val === "Н" ? "red" : val === 5 ? "green" : "black",
              fontWeight: "bold",
            }}
            maxLength={1}
          />
        );
      },
    });
  });

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            <Select
              style={{ width: 200 }}
              placeholder="Выберите класс"
              onChange={setSelectedClassId}
              options={classes.map((c) => ({ value: c.id, label: c.name }))}
            />
            <Select
              style={{ width: 250 }}
              placeholder="Выберите предмет"
              onChange={setSelectedDisciplineId}
              options={disciplines.map((d) => ({
                value: d.discipline_id,
                label: d.discipline_name,
              }))}
              disabled={!selectedClassId}
              value={selectedDisciplineId}
            />
          </Space>
          <Space>
            <Button
              icon={<LeftOutlined />}
              onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
            />
            <DatePicker
              picker="month"
              value={currentDate}
              onChange={(date) => date && setCurrentDate(date)}
              allowClear={false}
              format="MMMM YYYY"
              style={{
                width: 160,
                textAlign: "center",
                fontWeight: "bold",
                textTransform: "capitalize",
              }}
              inputReadOnly
            />
            <Button
              icon={<RightOutlined />}
              onClick={() => setCurrentDate(currentDate.add(1, "month"))}
            />
          </Space>
        </div>
      </Card>
      <Table
        dataSource={students}
        columns={columns}
        rowKey="student_id"
        loading={loading}
        bordered
        pagination={false}
        scroll={{ x: "max-content" }}
        locale={{
          emptyText: !selectedDisciplineId
            ? "Выберите класс и предмет"
            : "Нет данных",
        }}
      />
      <Modal
        title="Редактирование урока"
        open={isTopicModalOpen}
        onCancel={() => setIsTopicModalOpen(false)}
        onOk={() => topicForm.submit()}
      >
        <Form form={topicForm} layout="vertical" onFinish={handleUpdateTopic}>
          <Form.Item
            name="lesson_date"
            label="Дата"
            rules={[{ required: true }]}
          >
            <DatePicker format="DD.MM.YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="topic" label="Тема урока">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={!!profileStudentId}
        onCancel={() => setProfileStudentId(null)}
        footer={null}
        width={800}
        destroyOnClose
      >
        {profileStudentId && (
          <StudentProfilePage
            studentIdOverride={profileStudentId}
            yearId={loadedYearId}
          />
        )}
      </Modal>
    </div>
  );
};

export default TeacherJournalPage;

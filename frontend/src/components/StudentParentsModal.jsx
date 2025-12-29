import React, { useEffect, useState } from "react";
import {
  Modal,
  Table,
  Button,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Divider,
} from "antd";
import {
  DeleteOutlined,
  UserAddOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { parentsApi } from "../api/parents";

const { Option } = Select;

const StudentParentsModal = ({ open, onCancel, student }) => {
  const [parents, setParents] = useState([]);
  const [availableParents, setAvailableParents] = useState([]);
  const [newParentForm] = Form.useForm();
  const [linkParentForm] = Form.useForm();

  const fetchLinkedParents = () => {
    if (!student) return;
    parentsApi.getLinked(student.id).then((data) => setParents(data || []));
  };

  const fetchAvailableParents = () => {
    if (!student) return;
    parentsApi
      .getAvailable(student.id)
      .then((data) => setAvailableParents(data || []));
  };

  useEffect(() => {
    if (open && student) {
      fetchLinkedParents();
      fetchAvailableParents();
      const autoLogin = `${student.last_name.toLowerCase()}_${student.first_name[0].toLowerCase()}_p`;
      newParentForm.setFieldsValue({ login: autoLogin });
    }
  }, [open, student]);

  const handleCreateParent = (values) => {
    parentsApi
      .create(values)
      .then((data) => {
        const parentId = data.id;
        return parentsApi.link(student.id, parentId);
      })
      .then(() => {
        message.success("Родитель создан и привязан");
        newParentForm.resetFields();
        fetchLinkedParents();
        fetchAvailableParents();
      })
      .catch((err) => message.error(err.response?.data?.error || "Ошибка"));
  };

  const handleLinkParent = (values) => {
    parentsApi
      .link(student.id, values.parent_id)
      .then(() => {
        message.success("Родитель привязан");
        linkParentForm.resetFields();
        fetchLinkedParents();
        fetchAvailableParents();
      })
      .catch((err) => message.error(err.response?.data?.error));
  };

  const handleUnlink = (parentId) => {
    parentsApi.unlink(student.id, parentId).then(() => {
      message.success("Родитель отвязан");
      fetchLinkedParents();
      fetchAvailableParents();
    });
  };

  const columns = [
    {
      title: "ФИО",
      key: "name",
      render: (_, r) => `${r.last_name} ${r.first_name} ${r.patronymic || ""}`,
    },
    { title: "Телефон", dataIndex: "phone", key: "phone" },
    { title: "Логин", dataIndex: "login", key: "login" },
    {
      key: "act",
      width: 60,
      render: (_, r) => (
        <Popconfirm title="Отвязать?" onConfirm={() => handleUnlink(r.id)}>
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title={`Родители ученика: ${student?.last_name} ${student?.first_name}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Table
        dataSource={parents}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
        locale={{ emptyText: "Нет привязанных родителей" }}
        bordered
      />
      <Divider>Привязать существующего</Divider>
      <Form layout="inline" form={linkParentForm} onFinish={handleLinkParent}>
        <Form.Item
          name="parent_id"
          style={{ flex: 1 }}
          rules={[{ required: true, message: "Выберите родителя" }]}
        >
          <Select
            placeholder="Найти родителя по ФИО..."
            showSearch
            optionFilterProp="children"
          >
            {availableParents.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.last_name} {p.first_name} {p.patronymic} ({p.login})
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Button type="default" htmlType="submit" icon={<LinkOutlined />}>
          Привязать
        </Button>
      </Form>
      <Divider>Или создать нового</Divider>
      <Form
        layout="vertical"
        form={newParentForm}
        onFinish={handleCreateParent}
      >
        <Space style={{ display: "flex", marginBottom: 8 }} align="start">
          <Form.Item
            name="last_name"
            rules={[{ required: true, message: "Фамилия" }]}
          >
            <Input placeholder="Фамилия" />
          </Form.Item>
          <Form.Item
            name="first_name"
            rules={[{ required: true, message: "Имя" }]}
          >
            <Input placeholder="Имя" />
          </Form.Item>
          <Form.Item name="patronymic">
            <Input placeholder="Отчество" />
          </Form.Item>
        </Space>
        <Space style={{ display: "flex" }} align="start">
          <Form.Item name="phone">
            <Input placeholder="Телефон" />
          </Form.Item>
          <Form.Item name="login" rules={[{ required: true }]}>
            <Input placeholder="Логин" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="Пароль" />
          </Form.Item>
        </Space>
        <Button
          type="primary"
          htmlType="submit"
          icon={<UserAddOutlined />}
          block
        >
          Создать и привязать
        </Button>
      </Form>
    </Modal>
  );
};

export default StudentParentsModal;

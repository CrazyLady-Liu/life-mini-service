import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const Umbrellas = () => {
  const [umbrellas, setUmbrellas] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUmbrella, setEditingUmbrella] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUmbrellas();
    fetchStations();
  }, []);

  const fetchUmbrellas = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/umbrellas');
      setUmbrellas(res.data);
    } catch (err) {
      message.error('获取雨伞列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const res = await axios.get('/api/stations');
      setStations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = () => {
    setEditingUmbrella(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingUmbrella(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/umbrellas/${id}`);
      message.success('删除成功');
      fetchUmbrellas();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUmbrella) {
        await axios.put(`/api/umbrellas/${editingUmbrella._id}`, values);
        message.success('更新成功');
      } else {
        await axios.post('/api/umbrellas', values);
        message.success('添加成功');
      }
      setModalVisible(false);
      fetchUmbrellas();
    } catch (err) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '雨伞编号',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '所在站点',
      dataIndex: 'station',
      key: 'station',
      render: (station) => station?.name || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const map = {
          available: { text: '可用', color: 'green' },
          in_use: { text: '使用中', color: 'orange' },
          maintenance: { text: '维护中', color: 'gold' },
          lost: { text: '丢失', color: 'red' },
        };
        return <span style={{ color: map[status]?.color }}>{map[status]?.text}</span>;
      },
    },
    {
      title: '电量',
      dataIndex: 'battery',
      key: 'battery',
      render: (val) => `${val}%`,
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm
            title="确定删除这个雨伞？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<DeleteOutlined />} danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>设备管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加雨伞
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={umbrellas} 
        rowKey="_id"
        loading={loading}
      />

      <Modal
        title={editingUmbrella ? '编辑雨伞' : '添加雨伞'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="雨伞编号"
            rules={[{ required: true, message: '请输入雨伞编号' }]}
          >
            <Input placeholder="请输入雨伞编号" disabled={!!editingUmbrella} />
          </Form.Item>
          <Form.Item
            name="station"
            label="所在站点"
          >
            <Select placeholder="请选择站点" allowClear>
              {stations.map(station => (
                <Option key={station._id} value={station._id}>{station.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
          >
            <Select placeholder="请选择状态">
              <Option value="available">可用</Option>
              <Option value="in_use">使用中</Option>
              <Option value="maintenance">维护中</Option>
              <Option value="lost">丢失</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="battery"
            label="电量"
          >
            <InputNumber min={0} max={100} placeholder="请输入电量" style={{ width: '100%' }} suffix="%" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Umbrellas;

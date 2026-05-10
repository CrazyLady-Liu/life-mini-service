import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const Stations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/stations');
      setStations(res.data);
    } catch (err) {
      message.error('获取站点列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingStation(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingStation(record);
    form.setFieldsValue({
      ...record,
      lng: record.location.coordinates[0],
      lat: record.location.coordinates[1],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/stations/${id}`);
      message.success('删除成功');
      fetchStations();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingStation) {
        await axios.put(`/api/stations/${editingStation._id}`, values);
        message.success('更新成功');
      } else {
        await axios.post('/api/stations', values);
        message.success('添加成功');
      }
      setModalVisible(false);
      fetchStations();
    } catch (err) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '站点名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: '可用雨伞',
      dataIndex: 'availableCount',
      key: 'availableCount',
      render: (val, record) => `${val}/${record.capacity}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const map = {
          active: { text: '正常', color: 'green' },
          maintenance: { text: '维护中', color: 'orange' },
          inactive: { text: '停用', color: 'red' },
        };
        return <span style={{ color: map[status]?.color }}>{map[status]?.text}</span>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm
            title="确定删除这个站点？"
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
        <h2>点位管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加站点
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={stations} 
        rowKey="_id"
        loading={loading}
      />

      <Modal
        title={editingStation ? '编辑站点' : '添加站点'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="站点名称"
            rules={[{ required: true, message: '请输入站点名称' }]}
          >
            <Input placeholder="请输入站点名称" />
          </Form.Item>
          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item label="坐标">
            <Space>
              <Form.Item
                name="lng"
                noStyle
                rules={[{ required: true, message: '请输入经度' }]}
              >
                <InputNumber placeholder="经度" style={{ width: '48%' }} />
              </Form.Item>
              <Form.Item
                name="lat"
                noStyle
                rules={[{ required: true, message: '请输入纬度' }]}
              >
                <InputNumber placeholder="纬度" style={{ width: '48%' }} />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item
            name="capacity"
            label="容量"
            rules={[{ required: true, message: '请输入容量' }]}
          >
            <InputNumber min={1} placeholder="请输入容量" style={{ width: '100%' }} />
          </Form.Item>
          {editingStation && (
            <Form.Item
              name="status"
              label="状态"
            >
              <Select placeholder="请选择状态">
                <Option value="active">正常</Option>
                <Option value="maintenance">维护中</Option>
                <Option value="inactive">停用</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Stations;

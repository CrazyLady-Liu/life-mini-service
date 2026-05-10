import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Select, DatePicker, message, Space, Tag } from 'antd';
import { EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateRange]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (dateRange) {
        params.startDate = dateRange[0].toISOString();
        params.endDate = dateRange[1].toISOString();
      }
      const res = await axios.get('/api/orders', { params });
      setOrders(res.data);
    } catch (err) {
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkException = async (record) => {
    try {
      await Modal.confirm({
        title: '标记异常订单',
        icon: <ExclamationCircleOutlined />,
        content: '确定要将此订单标记为异常吗？',
        async onOk() {
          await axios.put(`/api/orders/${record._id}/exception`, {
            exceptionReason: '管理员标记异常'
          });
          message.success('标记成功');
          fetchOrders();
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusTag = (status) => {
    const map = {
      ongoing: { color: 'orange', text: '进行中' },
      completed: { color: 'green', text: '已完成' },
      cancelled: { color: 'default', text: '已取消' },
      exception: { color: 'red', text: '异常' },
    };
    return <Tag color={map[status]?.color}>{map[status]?.text}</Tag>;
  };

  const columns = [
    {
      title: '订单编号',
      dataIndex: '_id',
      key: '_id',
      width: 200,
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.nickname || '-',
    },
    {
      title: '雨伞',
      dataIndex: 'umbrella',
      key: 'umbrella',
      render: (umbrella) => umbrella?.code || '-',
    },
    {
      title: '借伞站点',
      dataIndex: 'borrowStation',
      key: 'borrowStation',
      render: (station) => station?.name || '-',
    },
    {
      title: '借伞时间',
      dataIndex: 'borrowTime',
      key: 'borrowTime',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '还伞站点',
      dataIndex: 'returnStation',
      key: 'returnStation',
      render: (station) => station?.name || '-',
    },
    {
      title: '还伞时间',
      dataIndex: 'returnTime',
      key: 'returnTime',
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => duration ? `${duration}小时` : '-',
    },
    {
      title: '费用',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost) => cost ? `¥${cost}` : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'ongoing' && (
            <Button 
              icon={<ExclamationCircleOutlined />} 
              danger 
              onClick={() => handleMarkException(record)}
            >
              标记异常
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>订单管理</h2>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Select
          placeholder="订单状态"
          style={{ width: 150 }}
          allowClear
          value={statusFilter || undefined}
          onChange={setStatusFilter}
        >
          <Option value="ongoing">进行中</Option>
          <Option value="completed">已完成</Option>
          <Option value="cancelled">已取消</Option>
          <Option value="exception">异常</Option>
        </Select>
        <RangePicker
          onChange={setDateRange}
          value={dateRange}
        />
        <Button onClick={fetchOrders}>查询</Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={orders} 
        rowKey="_id"
        loading={loading}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default Orders;

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Table } from 'antd';
import { 
  UserOutlined, 
  EnvironmentOutlined, 
  UmbrellaOutlined, 
  DollarOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [overviewRes, revenueRes] = await Promise.all([
        axios.get('/api/stats/overview'),
        axios.get('/api/stats/revenue')
      ]);
      setStats(overviewRes.data);
      setRevenueData(revenueRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const revenueColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '订单数',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: '收入 (元)',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (val) => `¥${val}`,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2>数据概览</h2>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats?.totalUsers || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃站点"
              value={stats?.totalStations || 0}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="雨伞总数"
              value={stats?.totalUmbrellas || 0}
              prefix={<UmbrellaOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="使用中"
              value={stats?.inUseUmbrellas || 0}
              prefix={<UmbrellaOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={stats?.totalOrders || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日订单"
              value={stats?.todayOrders || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日收入"
              value={stats?.todayRevenue || 0}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中订单"
              value={stats?.ongoingOrders || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近收入统计" style={{ marginTop: 24 }}>
        <Table 
          dataSource={revenueData}
          columns={revenueColumns}
          rowKey="date"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Dashboard;

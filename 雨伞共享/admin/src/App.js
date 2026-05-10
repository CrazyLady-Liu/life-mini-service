import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import { 
  DashboardOutlined, 
  EnvironmentOutlined, 
  UmbrellaOutlined, 
  FileTextOutlined, 
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import Stations from './pages/Stations';
import Umbrellas from './pages/Umbrellas';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Login from './pages/Login';
import axios from 'axios';

const { Header, Sider, Content } = Layout;

function App() {
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminInfo = localStorage.getItem('adminInfo');
    if (token && adminInfo) {
      setUser(JSON.parse(adminInfo));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '数据概览',
    },
    {
      key: '/stations',
      icon: <EnvironmentOutlined />,
      label: '点位管理',
    },
    {
      key: '/umbrellas',
      icon: <UmbrellaOutlined />,
      label: '设备管理',
    },
    {
      key: '/orders',
      icon: <FileTextOutlined />,
      label: '订单管理',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: '报修管理',
    },
  ];

  const userMenu = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  if (!user) {
    return <Login onLogin={(userData, token) => {
      setUser(userData);
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminInfo', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }} />;
  }

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <div style={{ 
            height: 64, 
            margin: 16, 
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 14 : 18,
            fontWeight: 'bold'
          }}>
            {collapsed ? '雨伞' : '共享雨伞'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['/']}
            items={menuItems}
            onClick={({ key }) => window.location.pathname = key}
          />
        </Sider>
        <Layout>
          <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Dropdown menu={{ items: userMenu }}>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user.username}</span>
              </Space>
            </Dropdown>
          </Header>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stations" element={<Stations />} />
              <Route path="/umbrellas" element={<Umbrellas />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;

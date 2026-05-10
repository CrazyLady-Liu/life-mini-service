import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, message, Space, Tag, TextArea } from 'antd';
import { CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [handleForm] = Form.useForm();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/reports');
      setReports(res.data);
    } catch (err) {
      message.error('获取报修列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setCurrentReport(record);
    handleForm.resetFields();
    setDetailModalVisible(true);
  };

  const handleResolve = async (report) => {
    try {
      await Modal.confirm({
        title: '处理报修',
        content: '确定要将此报修标记为已解决吗？',
        async onOk() {
          await axios.put(`/api/reports/${report._id}`, {
            status: 'resolved'
          });
          message.success('处理成功');
          fetchReports();
        }
      });
    } catch (err) {
      message.error('处理失败');
    }
  };

  const getStatusTag = (status) => {
    const map = {
      pending: { color: 'orange', text: '待处理' },
      processing: { color: 'blue', text: '处理中' },
      resolved: { color: 'green', text: '已解决' },
      closed: { color: 'default', text: '已关闭' },
    };
    return <Tag color={map[status]?.color}>{map[status]?.text}</Tag>;
  };

  const getTypeText = (type) => {
    return type === 'umbrella' ? '雨伞故障' : '站点故障';
  };

  const columns = [
    {
      title: '报修编号',
      dataIndex: '_id',
      key: '_id',
      width: 200,
    },
    {
      title: '报修类型',
      dataIndex: 'type',
      key: 'type',
      render: getTypeText,
    },
    {
      title: '报修用户',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.nickname || '-',
    },
    {
      title: '故障描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>查看</Button>
          {record.status === 'pending' && (
            <Button 
              icon={<CheckCircleOutlined />} 
              type="primary"
              onClick={() => handleResolve(record)}
            >
              处理
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>报修管理</h2>
      <Table 
        columns={columns} 
        dataSource={reports} 
        rowKey="_id"
        loading={loading}
      />

      <Modal
        title="报修详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {currentReport && (
          <div>
            <p><strong>报修编号：</strong>{currentReport._id}</p>
            <p><strong>报修类型：</strong>{getTypeText(currentReport.type)}</p>
            <p><strong>报修用户：</strong>{currentReport.user?.nickname || '-'}</p>
            <p><strong>状态：</strong>{getStatusTag(currentReport.status)}</p>
            <p><strong>故障描述：</strong></p>
            <p style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
              {currentReport.description}
            </p>
            {currentReport.images?.length > 0 && (
              <>
                <p><strong>图片：</strong></p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {currentReport.images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`报修图片${idx + 1}`}
                      style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                    />
                  ))}
                </div>
              </>
            )}
            {currentReport.handleResult && (
              <>
                <p><strong>处理结果：</strong></p>
                <p style={{ background: '#e6f7ff', padding: 12, borderRadius: 4 }}>
                  {currentReport.handleResult}
                </p>
              </>
            )}
            <p><strong>提交时间：</strong>{dayjs(currentReport.createdAt).format('YYYY-MM-DD HH:mm:ss')}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reports;

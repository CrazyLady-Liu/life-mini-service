import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../storage';
import { typeLabels, formatDate } from '../utils';
import '../App.css';

type Tab = 'all' | 'history' | 'manage';

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [user, setUser] = useState<any>(null);
  const [allCountdowns, setAllCountdowns] = useState<any[]>([]);
  const [deletedCountdowns, setDeletedCountdowns] = useState<any[]>([]);

  useEffect(() => {
    setUser(storage.getUser());
    setAllCountdowns(storage.getActiveCountdowns());
    setDeletedCountdowns(storage.getDeletedCountdowns());
  }, []);

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      storage.removeUser();
      navigate('/login');
    }
  };

  const handleClearAll = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      storage.clearAllData();
      navigate('/login');
    }
  };

  return (
    <div className="page">
      <div className="header">
        <button className="icon-btn" onClick={() => navigate('/')}>←</button>
        <h1>个人中心</h1>
        <div style={{ width: 40 }}></div>
      </div>

      <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>👤</div>
        <h3 style={{ color: '#333' }}>{user?.phone || '未登录'}</h3>
        {user && (
          <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>
            登录时间：{formatDate(user.loginTime)}
          </p>
        )}
      </div>

      <div className="nav-tabs">
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          全部倒计时
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          历史记录
        </button>
        <button
          className={activeTab === 'manage' ? 'active' : ''}
          onClick={() => setActiveTab('manage')}
        >
          数据管理
        </button>
      </div>

      {activeTab === 'all' && (
        <div>
          {allCountdowns.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📭</div>
              <p>暂无倒计时</p>
            </div>
          ) : (
            allCountdowns.map((c) => (
              <div
                key={c.id}
                className="card"
                onClick={() => navigate(`/detail/${c.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: '#333', marginBottom: 4 }}>{c.name}</h4>
                    <span style={{ fontSize: 12, color: '#666' }}>
                      {typeLabels[c.type]} · {formatDate(c.date)}
                    </span>
                  </div>
                  <span style={{ color: '#667eea', fontWeight: 'bold' }}>→</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          {deletedCountdowns.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📜</div>
              <p>暂无历史记录</p>
            </div>
          ) : (
            deletedCountdowns.map((c) => (
              <div key={c.id} className="card" style={{ opacity: 0.6 }}>
                <div>
                  <h4 style={{ color: '#333', marginBottom: 4 }}>{c.name}</h4>
                  <span style={{ fontSize: 12, color: '#666' }}>
                    {typeLabels[c.type]} · 删除于 {formatDate(c.deletedAt!)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="card">
          <h4 style={{ color: '#333', marginBottom: 16 }}>数据管理</h4>
          <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #e0e0e0' }}>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
              倒计时数量：{allCountdowns.length}
            </p>
            <p style={{ color: '#666', fontSize: 14 }}>
              历史记录：{deletedCountdowns.length}
            </p>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ width: '100%', marginBottom: 12 }}>
            退出登录
          </button>
          <button className="btn btn-danger" onClick={handleClearAll} style={{ width: '100%' }}>
            清除所有数据
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../storage';
import { useAuth } from '../contexts/AuthContext';
import { calculateRemainingTime, typeLabels, typeColors } from '../utils';
import { Countdown } from '../types';
import '../App.css';

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadCountdowns = () => {
    const active = storage.getActiveCountdowns();
    active.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    setCountdowns(active);
  };

  useEffect(() => {
    loadCountdowns();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePin = (e: React.MouseEvent, id: string, isPinned: boolean) => {
    e.stopPropagation();
    storage.updateCountdown(id, { isPinned: !isPinned });
    loadCountdowns();
  };

  const handleLogout = () => {
    setShowMenu(false);
    if (confirm('确定要退出登录吗？')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="page">
      <div className="header">
        <h1>朝夕倒数</h1>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            className="icon-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            👤
          </button>
          {showMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: 'white',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                minWidth: 180,
                marginTop: 8,
                zIndex: 100,
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>
                  {user?.phone}
                </div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                  已登录
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate('/profile');
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#333',
                }}
              >
                📋 个人中心
              </button>
              <button
                onClick={handleLogout}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#ff4757',
                }}
              >
                🚪 退出登录
              </button>
            </div>
          )}
        </div>
      </div>

      {countdowns.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📅</div>
          <p>还没有倒计时，点击下方按钮添加一个吧</p>
        </div>
      ) : (
        countdowns.map((countdown) => {
          const remaining = calculateRemainingTime(countdown.date);
          return (
            <div
              key={countdown.id}
              className={`card ${countdown.isPinned ? 'pinned' : ''}`}
              onClick={() => navigate(`/detail/${countdown.id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: 16,
                      fontSize: 12,
                      background: typeColors[countdown.type],
                      color: countdown.type === 'festival' ? 'white' : '#333'
                    }}
                  >
                    {typeLabels[countdown.type]}
                  </span>
                  <h3 style={{ color: '#333' }}>{countdown.name}</h3>
                </div>
                <button
                  onClick={(e) => togglePin(e, countdown.id, countdown.isPinned)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 20,
                    cursor: 'pointer',
                    padding: 4
                  }}
                >
                  {countdown.isPinned ? '📌' : '📍'}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 'bold', color: '#667eea' }}>
                  {remaining.isPast ? '已到' : remaining.days}
                </span>
                <span style={{ color: '#666', fontSize: 18 }}>天</span>
              </div>
            </div>
          );
        })
      )}

      <button className="fab" onClick={() => navigate('/add')}>+</button>
    </div>
  );
}

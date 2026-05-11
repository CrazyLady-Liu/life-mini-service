import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storage } from '../storage';
import { calculateRemainingTime, typeLabels, typeColors, formatDate } from '../utils';
import '../App.css';

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<any>(null);
  const [time, setTime] = useState(calculateRemainingTime(''));

  useEffect(() => {
    if (id) {
      const countdowns = storage.getCountdowns();
      const c = countdowns.find(cd => cd.id === id);
      if (c) {
        setCountdown(c);
        setTime(calculateRemainingTime(c.date));
      }
    }
  }, [id]);

  useEffect(() => {
    if (!countdown) return;
    const timer = setInterval(() => {
      setTime(calculateRemainingTime(countdown.date));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleDelete = () => {
    if (confirm('确定要删除这个倒计时吗？')) {
      storage.deleteCountdown(id!);
      navigate('/');
    }
  };

  if (!countdown) return null;

  return (
    <div className="page">
      <div className="header">
        <button className="icon-btn" onClick={() => navigate('/')}>←</button>
        <h1>倒计时详情</h1>
        <div style={{ width: 40 }}></div>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 16 }}>
          <span
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: 14,
              background: typeColors[countdown.type],
              color: countdown.type === 'festival' ? 'white' : '#333'
            }}
          >
            {typeLabels[countdown.type]}
          </span>
        </div>
        <h2 style={{ fontSize: 24, color: '#333', marginBottom: 24 }}>{countdown.name}</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 'bold', color: '#667eea' }}>{String(time.days).padStart(2, '0')}</div>
            <div style={{ color: '#666', fontSize: 12 }}>天</div>
          </div>
          <div style={{ fontSize: 40, color: '#666' }}>:</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 'bold', color: '#667eea' }}>{String(time.hours).padStart(2, '0')}</div>
            <div style={{ color: '#666', fontSize: 12 }}>时</div>
          </div>
          <div style={{ fontSize: 40, color: '#666' }}>:</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 'bold', color: '#667eea' }}>{String(time.minutes).padStart(2, '0')}</div>
            <div style={{ color: '#666', fontSize: 12 }}>分</div>
          </div>
          <div style={{ fontSize: 40, color: '#666' }}>:</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 'bold', color: '#667eea' }}>{String(time.seconds).padStart(2, '0')}</div>
            <div style={{ color: '#666', fontSize: 12 }}>秒</div>
          </div>
        </div>

        <p style={{ color: '#666', marginBottom: 8 }}>目标日期：{formatDate(countdown.date)}</p>
        {countdown.remindDays > 0 && (
          <p style={{ color: '#666' }}>提前 {countdown.remindDays} 天提醒</p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate(`/add/${id}`)}
          style={{ flex: 1 }}
        >
          编辑
        </button>
        <button
          className="btn btn-danger"
          onClick={handleDelete}
          style={{ flex: 1 }}
        >
          删除
        </button>
      </div>
    </div>
  );
}

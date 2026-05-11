import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../storage';
import '../App.css';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const handleSendCode = () => {
    if (!phone || phone.length !== 11) {
      alert('请输入正确的手机号');
      return;
    }
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = () => {
    if (!phone || phone.length !== 11) {
      alert('请输入正确的手机号');
      return;
    }
    if (!code) {
      alert('请输入验证码');
      return;
    }
    storage.setUser({
      phone,
      loginTime: new Date().toISOString()
    });
    navigate('/');
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⏰</div>
        <h1 style={{ color: '#333', fontSize: 28, marginBottom: 8 }}>朝夕倒数</h1>
        <p style={{ color: '#666' }}>记录每一个重要时刻</p>
      </div>

      <div className="input-group">
        <label>手机号</label>
        <input
          type="tel"
          placeholder="请输入手机号"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={11}
        />
      </div>

      <div className="input-group">
        <label>验证码</label>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            placeholder="请输入验证码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-secondary"
            onClick={handleSendCode}
            disabled={countdown > 0}
            style={{ width: 120, whiteSpace: 'nowrap' }}
          >
            {countdown > 0 ? `${countdown}s` : '获取验证码'}
          </button>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleLogin} style={{ marginTop: 20 }}>
        登录
      </button>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const MOCK_CODE = '123456';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [phoneError, setPhoneError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const validatePhone = (value: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!value) {
      setPhoneError('请输入手机号');
      return false;
    }
    if (!phoneRegex.test(value)) {
      setPhoneError('手机号格式不正确，请输入11位有效手机号');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateCode = (value: string): boolean => {
    if (!value) {
      setCodeError('请输入验证码');
      return false;
    }
    if (value.length !== 6) {
      setCodeError('验证码为6位数字');
      return false;
    }
    if (!/^\d{6}$/.test(value)) {
      setCodeError('验证码只能是数字');
      return false;
    }
    setCodeError('');
    return true;
  };

  const handleSendCode = () => {
    setLoginError('');
    if (!validatePhone(phone)) {
      return;
    }
    
    setCodeSent(true);
    setCountdown(60);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = () => {
    setLoginError('');
    const isPhoneValid = validatePhone(phone);
    const isCodeValid = validateCode(code);
    
    if (!isPhoneValid || !isCodeValid) {
      return;
    }
    
    if (code !== MOCK_CODE) {
      setLoginError('验证码错误，请检查后重新输入');
      return;
    }
    
    login(phone);
    navigate('/');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
    setPhone(value);
    if (phoneError) {
      validatePhone(value);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    if (codeError) {
      validateCode(value);
    }
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
          placeholder="请输入11位手机号"
          value={phone}
          onChange={handlePhoneChange}
          maxLength={11}
          style={{ borderColor: phoneError ? '#ff4757' : undefined }}
        />
        {phoneError && <p style={{ color: '#ff4757', fontSize: 14, marginTop: 8 }}>{phoneError}</p>}
      </div>

      <div className="input-group">
        <label>验证码</label>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            placeholder="请输入验证码"
            value={code}
            onChange={handleCodeChange}
            maxLength={6}
            style={{ 
              flex: 1,
              borderColor: codeError ? '#ff4757' : undefined 
            }}
          />
          <button
            className="btn btn-secondary"
            onClick={handleSendCode}
            disabled={countdown > 0}
            style={{ 
              width: 120, 
              whiteSpace: 'nowrap',
              opacity: countdown > 0 ? 0.6 : 1
            }}
          >
            {countdown > 0 ? `${countdown}s` : codeSent ? '重新获取' : '获取验证码'}
          </button>
        </div>
        {codeError && <p style={{ color: '#ff4757', fontSize: 14, marginTop: 8 }}>{codeError}</p>}
      </div>

      {loginError && (
        <div style={{ 
          backgroundColor: '#fff3f3', 
          border: '1px solid #ffcdd2',
          borderRadius: 8, 
          padding: 12, 
          marginBottom: 20,
          color: '#ff4757'
        }}>
          {loginError}
        </div>
      )}

      <button className="btn btn-primary" onClick={handleLogin} style={{ marginTop: 8 }}>
        登录
      </button>

      <p style={{ 
        textAlign: 'center', 
        color: '#999', 
        fontSize: 12, 
        marginTop: 20 
      }}>
        测试验证码：123456
      </p>
    </div>
  );
}

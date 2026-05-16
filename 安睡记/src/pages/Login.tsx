import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Phone, ShieldCheck, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useStore } from '@/store';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCode, setShowCode] = useState(false);
  
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const handleSendCode = useCallback(() => {
    if (!/^1\d{10}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    setError('');
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
  }, [phone]);

  const handleLogin = useCallback(async () => {
    if (!/^1\d{10}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    if (code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }
    if (code !== '123456') {
      setError('验证码错误，测试验证码为：123456');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const success = await login(phone, code);
      if (success) {
        navigate('/', { replace: true });
      } else {
        setError('登录失败，请重试');
      }
    } catch (e) {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [phone, code, login, navigate]);

  const handleQuickLogin = useCallback(() => {
    setPhone('13800138000');
    setCode('123456');
    setError('');
  }, []);

  return (
    <div className="min-h-full bg-gradient-to-b from-sleep-dark via-sleep-deep to-sleep-medium flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-5 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl" />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative z-10">
        <div className="mb-12 text-center animate-fade-in-up">
          <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-soft border border-white/10 shadow-2xl">
            <Moon size={44} className="text-white" fill="white" fillOpacity={0.2} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">安睡记</h1>
          <p className="text-white/50 text-base">记录每一夜好眠，拥抱美好生活</p>
        </div>

        <div className="w-full max-w-sm space-y-5">
          <div className="card-glass p-6 space-y-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="space-y-2.5">
              <label className="text-white/70 text-sm font-medium ml-1">手机号</label>
              <div className="input-field">
                <Phone size={19} className="input-icon" />
                <input
                  type="tel"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 11));
                    setError('');
                  }}
                  className="input-text"
                  maxLength={11}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-white/70 text-sm font-medium ml-1">验证码</label>
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-1 input-field min-w-0">
                  <ShieldCheck size={19} className="input-icon" />
                  <input
                    type={showCode ? 'text' : 'password'}
                    placeholder="请输入6位验证码"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError('');
                    }}
                    className="input-text tracking-widest min-w-0"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="text-white/40 hover:text-white/70 transition-colors ml-2 p-1 flex-shrink-0"
                  >
                    {showCode ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className={`btn-small whitespace-nowrap flex-shrink-0 w-28 ${
                    countdown > 0
                      ? 'bg-white/[0.04] text-white/40 cursor-not-allowed border border-white/[0.06]'
                      : 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 border border-primary-500/30'
                  }`}
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl py-2.5 px-4">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  登录中...
                </span>
              ) : '登录'}
            </button>
          </div>

          <p className="text-center text-white/30 text-xs animate-fade-in" style={{ animationDelay: '0.2s' }}>
            登录即表示同意 <span className="text-primary-400/80">用户协议</span> 和 <span className="text-primary-400/80">隐私政策</span>
          </p>
          
          <button
            type="button"
            onClick={handleQuickLogin}
            className="w-full card-soft p-5 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer group animate-fade-in-up"
            style={{ animationDelay: '0.25s' }}
          >
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <Sparkles size={16} className="text-primary-400" />
              <p className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                点击使用测试账号
              </p>
            </div>
            <p className="text-white/40 text-xs text-center">
              手机号：<span className="text-white/60 font-mono">13800138000</span> · 验证码：<span className="text-primary-400 font-mono">123456</span>
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

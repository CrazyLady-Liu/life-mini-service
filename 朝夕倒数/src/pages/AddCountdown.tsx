import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storage } from '../storage';
import { generateId, typeLabels } from '../utils';
import { Countdown, CountdownType } from '../types';
import '../App.css';

export default function AddCountdown() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState<CountdownType>('birthday');
  const [date, setDate] = useState('');
  const [remindDays, setRemindDays] = useState('0');

  useEffect(() => {
    if (id) {
      const countdowns = storage.getCountdowns();
      const countdown = countdowns.find(c => c.id === id);
      if (countdown) {
        setName(countdown.name);
        setType(countdown.type);
        setDate(countdown.date.split('T')[0]);
        setRemindDays(String(countdown.remindDays));
      }
    }
  }, [id]);

  const handleSave = () => {
    if (!name.trim()) {
      alert('请输入名称');
      return;
    }
    if (!date) {
      alert('请选择日期');
      return;
    }

    const countdownData: Countdown = {
      id: id || generateId(),
      name: name.trim(),
      type,
      date: new Date(date).toISOString(),
      remindDays: parseInt(remindDays) || 0,
      isPinned: false,
      createdAt: id ? '' : new Date().toISOString()
    };

    if (id) {
      storage.updateCountdown(id, countdownData);
    } else {
      storage.addCountdown(countdownData);
    }

    navigate('/');
  };

  return (
    <div className="page">
      <div className="header">
        <button className="icon-btn" onClick={() => navigate(-1)}>←</button>
        <h1>{id ? '编辑倒计时' : '新建倒计时'}</h1>
        <div style={{ width: 40 }}></div>
      </div>

      <div className="input-group">
        <label>名称</label>
        <input
          type="text"
          placeholder="例如：小明的生日"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>类型</label>
        <select value={type} onChange={(e) => setType(e.target.value as CountdownType)}>
          {(Object.keys(typeLabels) as CountdownType[]).map((key) => (
            <option key={key} value={key}>{typeLabels[key]}</option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label>日期</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>提前提醒天数</label>
        <input
          type="number"
          placeholder="0"
          value={remindDays}
          onChange={(e) => setRemindDays(e.target.value)}
          min="0"
        />
      </div>

      <button className="btn btn-primary" onClick={handleSave}>
        保存
      </button>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Moon, Target, TrendingUp, Award, Clock, LogOut, ChevronRight, Info, X } from 'lucide-react';
import { useStore } from '@/store';
import { useOverallStats } from '@/hooks/useSleepStats';

export default function Profile() {
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const logout = useStore(state => state.logout);
  const updateUser = useStore(state => state.updateUser);
  
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [tempTarget, setTempTarget] = useState(user?.targetSleepHours || 8);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const stats = useOverallStats();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const handleSaveTarget = useCallback(() => {
    updateUser({ targetSleepHours: tempTarget });
    setShowTargetModal(false);
  }, [tempTarget, updateUser]);

  const handleOpenTargetModal = useCallback(() => {
    setTempTarget(user?.targetSleepHours || 8);
    setShowTargetModal(true);
  }, [user?.targetSleepHours]);

  const targetHours = user?.targetSleepHours || 8;

  return (
    <div className="min-h-full bg-gradient-to-b from-sleep-dark via-sleep-deep to-sleep-medium relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-primary-500/5 to-transparent" />
        <div className="absolute bottom-40 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        <div className="px-5 pt-12 pb-6">
          <h1 className="text-2xl font-bold text-white mb-1">我的</h1>
          <p className="text-white/50 text-sm">个人中心与设置</p>
        </div>

        <div className="px-5 pb-6">
          <div className="bg-gradient-to-r from-primary-500/15 to-primary-600/10 backdrop-blur-soft rounded-3xl p-6 border border-primary-500/20 shadow-xl shadow-primary-500/5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400/90 to-primary-600/90 flex items-center justify-center shadow-lg shadow-primary-500/20 border border-white/10">
                <User size={30} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-white text-xl font-bold">{user?.nickname || '睡眠达人'}</h2>
                <p className="text-white/50 text-sm mt-0.5">{user?.phone}</p>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="px-2.5 py-1 bg-yellow-500/15 text-yellow-400 text-xs rounded-full font-medium border border-yellow-500/20">
                    连续记录 {stats.currentStreak} 天
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-6">
          <h3 className="text-white/70 text-sm font-medium mb-3 px-1">睡眠数据</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="card-soft p-4.5">
              <div className="flex items-center gap-2 mb-2.5">
                <Clock size={18} className="text-primary-400" />
                <span className="text-white/50 text-sm">累计记录</span>
              </div>
              <p className="text-white text-2xl font-bold">{stats.totalRecords}</p>
              <p className="text-white/40 text-xs mt-0.5">天</p>
            </div>
            <div className="card-soft p-4.5">
              <div className="flex items-center gap-2 mb-2.5">
                <TrendingUp size={18} className="text-green-400" />
                <span className="text-white/50 text-sm">平均时长</span>
              </div>
              <p className="text-white text-2xl font-bold">{stats.avgDuration}</p>
              <p className="text-white/40 text-xs mt-0.5">小时/天</p>
            </div>
            <div className="card-soft p-4.5">
              <div className="flex items-center gap-2 mb-2.5">
                <Moon size={18} className="text-blue-400" />
                <span className="text-white/50 text-sm">总睡眠</span>
              </div>
              <p className="text-white text-2xl font-bold">{stats.totalHours}</p>
              <p className="text-white/40 text-xs mt-0.5">小时</p>
            </div>
            <div className="card-soft p-4.5">
              <div className="flex items-center gap-2 mb-2.5">
                <Award size={18} className="text-yellow-400" />
                <span className="text-white/50 text-sm">达标率</span>
              </div>
              <p className="text-white text-2xl font-bold">{stats.goodRate}%</p>
              <p className="text-white/40 text-xs mt-0.5">共 {stats.goodDays} 天达标</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-24">
          <h3 className="text-white/70 text-sm font-medium mb-3 px-1">设置</h3>
          <div className="card-glass overflow-hidden">
            <button
              onClick={handleOpenTargetModal}
              className="w-full flex items-center justify-between p-4.5 hover:bg-white/5 transition-all duration-200 border-b border-white/5"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-primary-500/15 flex items-center justify-center border border-primary-500/20">
                  <Target size={20} className="text-primary-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">睡眠目标</p>
                  <p className="text-white/50 text-sm">每天 {targetHours} 小时</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-white/30" />
            </button>
            
            <div className="flex items-center justify-between p-4.5 border-b border-white/5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-green-500/15 flex items-center justify-center border border-green-500/20">
                  <Award size={20} className="text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">最长连续</p>
                  <p className="text-white/50 text-sm">{stats.bestStreak} 天</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4.5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/20">
                  <Info size={20} className="text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">关于</p>
                  <p className="text-white/50 text-sm">安睡记 v1.0.0</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full mt-5 bg-red-500/10 backdrop-blur-soft text-red-400 font-semibold py-4.5 rounded-2xl border border-red-500/20 hover:bg-red-500/15 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            退出登录
          </button>
        </div>
      </div>

      {showTargetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowTargetModal(false)}>
          <div className="bg-sleep-deep/95 backdrop-blur-soft rounded-3xl p-6 mx-4 max-w-sm w-full border border-white/10 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl font-bold">设置睡眠目标</h3>
              <button
                onClick={() => setShowTargetModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-white/50 text-sm mb-6">设置每天的目标睡眠时长，推荐成年人 7-9 小时</p>
            
            <div className="flex items-center justify-center gap-5 mb-8">
              <button
                onClick={() => setTempTarget(prev => Math.max(4, prev - 0.5))}
                className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white text-2xl font-bold hover:bg-white/10 transition-all duration-200 border border-white/5"
              >
                -
              </button>
              <div className="text-center w-32">
                <p className="text-white text-5xl font-bold">{tempTarget}</p>
                <p className="text-white/40 text-sm mt-1">小时/天</p>
              </div>
              <button
                onClick={() => setTempTarget(prev => Math.min(12, prev + 0.5))}
                className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white text-2xl font-bold hover:bg-white/10 transition-all duration-200 border border-white/5"
              >
                +
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowTargetModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSaveTarget}
                className="flex-1 btn-primary"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-sleep-deep/95 backdrop-blur-soft rounded-3xl p-6 mx-4 max-w-sm w-full border border-white/10 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <LogOut size={32} className="text-red-400" />
            </div>
            <h3 className="text-white text-xl font-bold text-center mb-2">确认退出</h3>
            <p className="text-white/50 text-center mb-6">退出后需要重新登录才能查看数据</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500/90 hover:bg-red-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 active:scale-[0.98] shadow-lg shadow-red-500/20"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

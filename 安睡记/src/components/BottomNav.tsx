import { NavLink } from 'react-router-dom';
import { Home, BarChart3, History, User } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: '打卡' },
  { to: '/week', icon: BarChart3, label: '周统计' },
  { to: '/history', icon: History, label: '历史' },
  { to: '/profile', icon: User, label: '我的' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-soft border-t border-gray-100 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-full transition-all duration-300 ${
                isActive 
                  ? 'text-primary-500 scale-105' 
                  : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-primary-500/10' : ''
                }`}>
                  <Icon 
                    size={22} 
                    strokeWidth={2} 
                    fill={isActive ? 'currentColor' : 'none'}
                    fillOpacity={0.15}
                  />
                </div>
                <span className="text-xs mt-1 font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

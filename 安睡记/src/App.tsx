import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '@/store';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import WeekStats from '@/pages/WeekStats';
import History from '@/pages/History';
import Profile from '@/pages/Profile';
import BottomNav from '@/components/BottomNav';

function App() {
  const isLoggedIn = useStore(state => state.isLoggedIn);

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-slate-50">
      <div className="flex-1 overflow-auto pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/week" element={<WeekStats />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { storage } from './storage';
import Login from './pages/Login';
import Home from './pages/Home';
import AddCountdown from './pages/AddCountdown';
import Detail from './pages/Detail';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = storage.getUser();
    setIsLoggedIn(!!user);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />
          <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
          <Route path="/add" element={isLoggedIn ? <AddCountdown /> : <Navigate to="/login" />} />
          <Route path="/add/:id" element={isLoggedIn ? <AddCountdown /> : <Navigate to="/login" />} />
          <Route path="/detail/:id" element={isLoggedIn ? <Detail /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

import { useEffect } from 'react'
import api from './config/api'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import AllTasks from './pages/AllTasks'
import TimeTable from './pages/TimeTable'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Analytics from './pages/Analytics'
import { useAuthContext } from './hooks/useAuthContext'

function App() {
  const { user } = useAuthContext();

  useEffect(() => {
    // Add a request interceptor to automatically add the auth token
    const interceptor = api.interceptors.request.use((config) => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser?.token) {
        config.headers.Authorization = `Bearer ${storedUser.token}`;
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/tasks" element={user ? <AllTasks /> : <Navigate to="/login" />} />
        <Route path="/timetable" element={user ? <TimeTable /> : <Navigate to="/login" />} />
        <Route path="/analytics" element={user ? <Analytics /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App

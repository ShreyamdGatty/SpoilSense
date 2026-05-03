import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import HomePage from './HomePage';
import Register from './Register';
import Login from './Login';
import Food from './Food';
import ResultPage from './ResultPage';
import AdminDashboard from './Admindashboard';

function HomePageWrapper() {
  const navigate = useNavigate();

  const handleNavigate = (page) => {
    navigate(`/${page}`);
  };

  return <HomePage onNavigate={handleNavigate} />;
}

function RegisterWrapper() {
  const navigate = useNavigate();

  const handleRegistrationSuccess = () => {
    navigate('/login');
  };

  return <Register onSuccess={handleRegistrationSuccess} />;
}

function LoginWrapper() {
  const navigate = useNavigate();

  const handleLoginSuccess = (role) => {
    if (role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/food');
    }
  };

  return <Login onLoginSuccess={handleLoginSuccess} />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePageWrapper />} />
        <Route path="/register" element={<RegisterWrapper />} />
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/food" element={<Food />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admindashboard.css';

function Admindashboard() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({
    total: 0,
    packed: 0,
    nonPacked: 0,
    expired: 0
  });

  useEffect(() => {
    fetch('http://localhost:5000/predictions')
      .then((res) => res.json())
      .then((data) => {
        setPredictions(data);
        calculateMetrics(data);
      })
      .catch((err) => {
        console.error(err);
        setError('Error loading predictions');
      });
  }, []);

  const calculateMetrics = (data) => {
    const total = data.length;
    const packed = data.filter(p => p.food_type === 'packed').length;
    const nonPacked = data.filter(p => p.food_type === 'non-packed').length;
    const expired = data.filter(p => p.is_expired).length;
    setMetrics({ total, packed, nonPacked, expired });
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="sidebar-title">📦 FoodSpoilage Admin</h2>
        <div className="admin-profile">
          <p>👤 Admin</p>
          <p className="admin-email">admin@gmail.com</p>
        </div>
        <div className="sidebar-section">
          <h4>📊 ML Metrics</h4>
          <ul className="metrics-list">
            <li>Total Predictions: {metrics.total}</li>
            <li>Packed: {metrics.packed}</li>
            <li>Non-Packed: {metrics.nonPacked}</li>
            <li>Expired: {metrics.expired}</li>
          </ul>
        </div>
        <nav className="admin-nav">
          <ul>
            <li onClick={() => navigate('/dashboard')}>📊 Dashboard</li>
            <li onClick={() => navigate('/predictions')}>🍱 All Predictions</li>
            <li onClick={() => navigate('/upload-packed')}>🧪 Packed Food Upload</li>
            <li onClick={() => navigate('/upload-nonpacked')}>🍎 Non-Packed Upload</li>
            <li onClick={() => navigate('/users')}>🔧 Manage Users</li>
            <li onClick={handleLogout}>🔓 Logout</li>
          </ul>
        </nav>
      </aside>

      <main className="admin-content">
        <h1>Welcome, Admin</h1>
        {error && <p className="error-msg">{error}</p>}
        <div className="predictions-table">
          <h2>Recent Predictions</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Class / Expiry</th>
                <th>Confidence / Days Left</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((pred, index) => (
                <tr key={index}>
                  <td>{pred.food_type}</td>
                  <td>{pred.predicted_class || pred.expiry_date || 'N/A'}</td>
                  <td>
                    {pred.confidence ? `${(pred.confidence * 100).toFixed(2)}%` :
                      pred.days_left !== undefined ? `${pred.days_left} days` : 'N/A'}
                  </td>
                  <td>{pred.timestamp || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Admindashboard;

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResultPage.css';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { message, foodType } = location.state || {};

  const handleAction = (action) => {
    alert(`You selected to "${action}" the ${foodType} item.`);
    navigate('/'); // Go back to FoodPage
  };

  return (
    <div className="result-page">
      <div className="result-card">
        <h2>Prediction Result</h2>
        <p className="result-message">{message}</p>
        <div className="action-buttons">
          <button className="btn use" onClick={() => handleAction('Use It')}>Use It</button>
          <button className="btn donate" onClick={() => handleAction('Donate')}>Donate</button>
          <button className="btn throw" onClick={() => handleAction('Throw')}>Throw</button>
        </div>
      </div>
    </div>
  );
}

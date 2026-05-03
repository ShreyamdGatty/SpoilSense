import React, { useState } from 'react';

function Register({ onSuccess }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      setMessage(data.message);

      // If successful or email already exists
      if (res.ok || res.status === 409) {
        setTimeout(() => {
          onSuccess(); // Redirect to login
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setMessage('Registration failed');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(to right, #b993d6, #8ca6db)'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: '40px',
        borderRadius: '20px',
        width: '350px',
        textAlign: 'center',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        backdropFilter: 'blur(8px)',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{
          backgroundColor: '#0a0a23',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          margin: '0 auto 20px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '30px', color: 'white' }}>👤</span>
        </div>

        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          required
          style={inputStyle}
        /><br /><br />
        <input
          type="email"
          name="email"
          placeholder="Email ID"
          onChange={handleChange}
          required
          style={inputStyle}
        /><br /><br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          style={inputStyle}
        /><br /><br />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#fff'
        }}>
          <label>
            <input type="checkbox" style={{ marginRight: '5px' }} /> Remember me
          </label>
          <a href="#" style={{ color: '#fff', textDecoration: 'underline' }}>Forgot Password?</a>
        </div><br />

        <button onClick={handleSubmit} style={buttonStyle}>REGISTER</button>
        <p style={{ marginTop: '10px' }}>{message}</p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '5px',
  border: 'none',
  outline: 'none',
  backgroundColor: '#2c3e50',
  color: 'white'
};

const buttonStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '5px',
  border: 'none',
  backgroundColor: '#0a0a23',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer'
};

export default Register;






























import React, { useState } from 'react';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setMsg(data.message);
      setLoading(false);

      if (res.ok) {
        // Save to localStorage
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);

        // Redirect to appropriate dashboard
        onLoginSuccess(data.role); // 'admin' or 'user'
      }
    } catch (err) {
      console.error('Login error:', err);
      setMsg('Server error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          /><br />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="login-msg">{msg}</p>
      </div>
    </div>
  );
}

export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        alert(data.message || 'Invalid credentials');
      }
    } catch (err) {
      alert('Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regName,
          email: regEmail,
          password: regPassword
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('Registration successful! You can now log in.');
        setShowRegister(false);
        setEmail(regEmail);
        setPassword('');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div>
      {!showRegister ? (
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>

          <button
            type="button"
            onClick={() => setShowRegister(true)}
            style={{ marginLeft: '1em' }}
          >
            Register
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <h2>Register</h2>

          <input
            type="text"
            placeholder="Name"
            value={regName}
            onChange={e => setRegName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={regEmail}
            onChange={e => setRegEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={regPassword}
            onChange={e => setRegPassword(e.target.value)}
          />

          <button type="submit">Sign Up</button>

          <button
            type="button"
            onClick={() => setShowRegister(false)}
            style={{ marginLeft: '1em' }}
          >
            Back to Login
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;
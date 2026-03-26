import { type FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMappdNavigate } from '../hooks/useMappdNavigate';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUsername: setAuthUsername } = useAuth();
  const navigate = useMappdNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAuthUsername(username);
    navigate('/dashboard', { username });
  };

  return (
    <div className="login">
      <div className="card login-card">
        <h2>Sign In</h2>
        <p className="muted">Welcome back. Enter your credentials to continue.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

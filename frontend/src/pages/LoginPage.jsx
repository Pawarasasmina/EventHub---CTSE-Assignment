import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout">
      <article className="auth-showcase glass-card">
        <span className="section-tag">Welcome back</span>
        <h1>Log in to manage tickets, bookings, notifications, and organizer operations.</h1>
        <p>EventHub connects attendees and organizers through one secure platform powered by your deployed microservices.</p>
        <div className="auth-showcase__metrics">
          <div>
            <strong>JWT secured</strong>
            <span>Protected customer and organizer routes</span>
          </div>
          <div>
            <strong>Real-time workflow</strong>
            <span>Bookings and notifications flow across services</span>
          </div>
        </div>
      </article>
      <section className="auth-card glass-card">
        <span className="section-tag">Sign in</span>
        <h2>Access your account</h2>
        <ErrorMessage message={error} />
        <form onSubmit={handleSubmit} className="stack">
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p className="auth-switch">No account yet? <Link to="/register">Create one here</Link></p>
      </section>
    </section>
  );
};

export default LoginPage;

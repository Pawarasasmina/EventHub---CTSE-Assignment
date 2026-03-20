import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout">
      <article className="auth-showcase glass-card">
        <span className="section-tag">Get started</span>
        <h1>Create a modern attendee or organizer account and step straight into the EventHub ecosystem.</h1>
        <p>Choose the role that matches your workflow and use the same platform to publish experiences or reserve your next event.</p>
        <div className="auth-showcase__metrics">
          <div>
            <strong>Customer</strong>
            <span>Browse events, book tickets, and track notifications</span>
          </div>
          <div>
            <strong>Organizer</strong>
            <span>Create and manage event inventory from the dashboard</span>
          </div>
        </div>
      </article>
      <section className="auth-card glass-card">
        <span className="section-tag">Create account</span>
        <h2>Join EventHub</h2>
        <ErrorMessage message={error} />
        <form onSubmit={handleSubmit} className="stack">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="customer">Customer</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </section>
    </section>
  );
};

export default RegisterPage;

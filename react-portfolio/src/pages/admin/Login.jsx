import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import './Admin.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const { signIn, user, loading, initializeAuth } = useAuthStore();

  useEffect(() => {
    const subscription = initializeAuth();
    return () => {
      subscription?.unsubscribe();
    };
  }, [initializeAuth]);

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Checking authentication...</div>;
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h2>CMS Admin</h2>
          <p>Login to manage your portfolio</p>
        </div>
        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && <div className="admin-error">{error}</div>}
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <button type="submit" className="admin-btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

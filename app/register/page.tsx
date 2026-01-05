'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import Layout from '@/app/components/Layout';
import '../auth.css';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      await register(username, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create your account</h1>
            <p>Enter your details to get started</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <div className="form-input-wrapper">
                <div className="form-input-icon">
                  <Mail size={18} />
                </div>
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="form-input-wrapper">
                <div className="form-input-icon">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="form-input-wrapper">
                <div className="form-input-icon">
                  <Lock size={18} />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading && <Loader2 size={16} className="spinner" />}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link href="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

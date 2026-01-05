'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import Layout from '@/app/components/Layout';
import '../auth.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Sign in to your account</h1>
            <p>Enter your credentials to access your account</p>
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
                  placeholder="Enter your username"
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/register">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Layout from '@/app/components/Layout';
import { AuthCard } from '@/app/components/ui/AuthCard';
import { Input } from '@/app/components/ui/Input';
import { LoadingButton } from '@/app/components/LoadingButton';
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
      <AuthCard
        title="Sign in to your account"
        subtitle="Enter your credentials to access your account"
        footer={
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register">Create one</Link>
          </p>
        }
      >
        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            id="username"
            label="Username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            icon={<Mail size={18} />}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock size={18} />}
          />

          <LoadingButton
            type="submit"
            className="submit-btn"
            isLoading={loading}
            loadingText="Signing in..."
          >
            Sign in
          </LoadingButton>
        </form>
      </AuthCard>
    </Layout>
  );
}

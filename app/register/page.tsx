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
      <AuthCard
        title="Create your account"
        subtitle="Enter your details to get started"
        footer={
          <p>
            Already have an account?{' '}
            <Link href="/login">Sign in</Link>
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
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            icon={<Mail size={18} />}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock size={18} />}
          />

          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            icon={<Lock size={18} />}
          />

          <LoadingButton
            type="submit"
            className="submit-btn"
            isLoading={loading}
            loadingText="Creating account..."
          >
            Create account
          </LoadingButton>
        </form>
      </AuthCard>
    </Layout>
  );
}

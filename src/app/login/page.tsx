'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Prepare form data for OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append('username', email); // FastAPI's form expects 'username' for email
    formData.append('password', password);

    try {
      const response = await fetch(`${backendUrl}/api/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Login successful, update auth context and redirect
      auth.login(data.access_token);
      router.push('/dashboard'); // Redirect to dashboard after login

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-[rgb(var(--foreground))] bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-[rgb(var(--foreground))]">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-[rgb(var(--border))] focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-[rgb(var(--foreground))]">
                Password
              </label>
              {/* Optional: Forgot password link */}
              {/* <div className="text-sm">
                <a href="#" className="font-semibold text-primary hover:text-primary-light">
                  Forgot password?
                </a>
              </div> */}
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-[rgb(var(--border))] focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-[rgb(var(--secondary))]">
          Not a member?{' '}
          <Link href="/register" className="font-semibold leading-6 text-secondary hover:text-primary-light">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

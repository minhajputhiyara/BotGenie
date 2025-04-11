'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Try to parse detail from backend error
        let errorMessage = 'Registration failed.';
        if (data.detail) {
            if (typeof data.detail === 'string') {
                errorMessage = data.detail;
            } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
                // Handle Pydantic validation errors
                errorMessage = data.detail.map((err: any) => `${err.loc[1]} - ${err.msg}`).join(', ');
            } else if (typeof data.detail === 'object') {
                 errorMessage = JSON.stringify(data.detail);
            }
        }
        throw new Error(errorMessage);
      }

      // Registration successful
      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/login'); // Redirect to login page after a short delay
      }, 2000);

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
          Create your account
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
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-[rgb(var(--foreground))]">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-[rgb(var(--border))] focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-[rgb(var(--foreground))]">
              Confirm Password
            </label>
            <div className="mt-2">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`input block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-[rgb(var(--border))] focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 ${password !== confirmPassword && confirmPassword ? 'ring-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {password !== confirmPassword && confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {successMessage && (
            <p className="text-sm text-green-600">{successMessage}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || password !== confirmPassword || !password}
              className="btn-primary flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-[rgb(var(--secondary))]">
          Already a member?{' '}
          <Link href="/login" className="font-semibold leading-6 text-primary hover:text-primary-light">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

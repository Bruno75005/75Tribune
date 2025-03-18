'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthResponse {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  error?: string;
}

export default function TestAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuthResponse | null>(null);

  // Test Register
  const testRegister = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test${Date.now()}@example.com`,
          password: 'Test123!',
          name: 'Test User',
        }),
      });
      const data = await response.json();
      setResult(data);
      if (data.user) {
        console.log('✅ Register test passed');
      } else {
        console.log('❌ Register test failed');
      }
    } catch (error) {
      setResult({ error: 'Register failed' });
      console.log('❌ Register test failed with error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test Login
  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test123!',
        }),
      });
      const data = await response.json();
      setResult(data);
      if (data.user) {
        console.log('✅ Login test passed');
      } else {
        console.log('❌ Login test failed');
      }
    } catch (error) {
      setResult({ error: 'Login failed' });
      console.log('❌ Login test failed with error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test Logout
  const testLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
      if (data.success) {
        console.log('✅ Logout test passed');
        router.push('/login');
      } else {
        console.log('❌ Logout test failed');
      }
    } catch (error) {
      setResult({ error: 'Logout failed' });
      console.log('❌ Logout test failed with error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test Protected Route
  const testProtectedRoute = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/articles', {
        method: 'GET',
      });
      const data = await response.json();
      setResult(data);
      if (response.ok) {
        console.log('✅ Protected route test passed');
      } else {
        console.log('❌ Protected route test failed');
      }
    } catch (error) {
      setResult({ error: 'Protected route test failed' });
      console.log('❌ Protected route test failed with error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <button
          onClick={testRegister}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Register
        </button>

        <button
          onClick={testLogin}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Login
        </button>

        <button
          onClick={testLogout}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Test Logout
        </button>

        <button
          onClick={testProtectedRoute}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Protected Route
        </button>
      </div>

      {loading && (
        <div className="text-gray-600">Chargement...</div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

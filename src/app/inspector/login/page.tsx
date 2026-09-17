"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';

export default function InspectorLogin() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId === 'INS' && password === '123') {
      router.push('/inspector/dashboard');
    } else {
      setError('Invalid User ID or Password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Inspector Portal</h2>
          <p className="text-slate-500 mt-2 text-sm">Sign in to access your Legal Metrology dashboard and field scanner.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Inspector ID</label>
            <input 
              type="text" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. INS"
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 mt-4"
          >
            <Lock size={18} />
            Secure Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-blue-600">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

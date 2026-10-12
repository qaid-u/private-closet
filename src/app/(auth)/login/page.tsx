'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }
    }

    // Redirect to dashboard
    router.push('/dashboard');
  };

  const handleExploreDemo = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#222321] flex flex-col justify-center items-center p-6 selection:bg-[#3B4D42] selection:text-white">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#E6E4DE] shadow-xs space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#3B4D42] text-white flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">Welcome to MyStyle AI</h1>
          <p className="text-xs text-[#747570]">
            Sign in to access your synchronized private wardrobe.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#B84B4B]/10 text-[#B84B4B] text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#E6E4DE] text-sm focus:outline-hidden focus:border-[#3B4D42]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#E6E4DE] text-sm focus:outline-hidden focus:border-[#3B4D42]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#3B4D42] text-white text-sm font-semibold hover:bg-[#2E3D34] shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Track */}
        <div className="pt-4 border-t border-[#E6E4DE] text-center space-y-3">
          <button
            type="button"
            onClick={handleExploreDemo}
            className="w-full py-2.5 rounded-xl bg-[#F0EEE9] text-[#222321] text-xs font-semibold hover:bg-[#E6E4DE] transition-colors"
          >
            Instant Access via Demo Account
          </button>
          <div className="flex justify-between text-xs text-[#747570]">
            <Link href="/register" className="hover:text-[#222321]">Create an account</Link>
            <Link href="/forgot-password" className="hover:text-[#222321]">Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

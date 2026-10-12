'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }
    }

    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#222321] flex flex-col justify-center items-center p-6 selection:bg-[#3B4D42] selection:text-white">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#E6E4DE] shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#3B4D42] text-white flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">Create Your Account</h1>
          <p className="text-xs text-[#747570]">
            Set up your private digital closet on MyStyle AI.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#B84B4B]/10 text-[#B84B4B] text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#E6E4DE] text-sm focus:outline-hidden focus:border-[#3B4D42]"
            />
          </div>

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
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E6E4DE] text-center text-xs text-[#747570]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#3B4D42] hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

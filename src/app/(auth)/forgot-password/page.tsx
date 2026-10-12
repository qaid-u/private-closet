'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrorMsg(null);

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg('Supabase authentication is not configured for this environment.');
      setLoading(false);
      return;
    }

    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage('Check your email for a password reset link.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#222321] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#E6E4DE] shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#3B4D42] text-white flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-xs text-[#747570]">Receive a secure password reset link by email.</p>
        </div>

        {message && <div className="p-3 rounded-xl bg-[#4B8067]/10 text-[#3B4D42] text-xs">{message}</div>}
        {errorMsg && <div className="p-3 rounded-xl bg-[#B84B4B]/10 text-[#B84B4B] text-xs">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#E6E4DE] text-sm focus:outline-hidden focus:border-[#3B4D42]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#3B4D42] text-white text-sm font-semibold hover:bg-[#2E3D34] shadow-sm transition-all"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <Link href="/login" className="block text-center text-xs font-semibold text-[#3B4D42] hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

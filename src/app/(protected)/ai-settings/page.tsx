'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Cpu,
  Eye,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Shield,
  Zap,
  BarChart3,
  Settings2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { internalFetch } from '@/net/guardedFetch';

// ---------------------------------------------------------------------------
// Types mirroring the API response
// ---------------------------------------------------------------------------

interface ProviderStatus {
  name: string;
  displayName: string;
  modelId: string;
  isConfigured: boolean;
  supportsVision: boolean;
  supportsTextReasoning: boolean;
  isActive: boolean;
  isVisionProvider: boolean;
  isTextProvider: boolean;
}

interface AIStatusResponse {
  providers: ProviderStatus[];
  active: {
    vision: { provider: string; model: string; isConfigured: boolean };
    text: { provider: string; model: string; isConfigured: boolean };
  };
  usage: {
    requests_used_today: number;
    requests_limit_per_day: number;
    last_error: string | null;
  };
  config: {
    rule_based_fallback_enabled: boolean;
    allow_paid_models: boolean;
    ollama_base_url: string;
    ollama_vision_model: string;
  };
}

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${
        ok ? 'bg-emerald-500' : 'bg-zinc-400'
      }`}
    />
  );
}

function Chip({ label, color = 'green' }: { label: string; color?: 'green' | 'blue' | 'amber' | 'zinc' }) {
  const cls = {
    green: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    blue:  'bg-sky-500/10 text-sky-700 dark:text-sky-400',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    zinc:  'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300',
  }[color];
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function ProviderCard({ provider }: { provider: ProviderStatus }) {
  const isRuleBased = provider.name === 'rule-based';

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        provider.isActive
          ? 'border-[#3B4D42] bg-[#E5EEE9]/40 dark:bg-[#253D36]/20'
          : 'border-[#E6E4DE] dark:border-[#35322F] bg-[#F8F7F4] dark:bg-[#282623]'
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isRuleBased
                ? 'bg-zinc-200 dark:bg-zinc-700'
                : provider.isConfigured
                ? 'bg-[#3B4D42]'
                : 'bg-zinc-200 dark:bg-zinc-700'
            }`}
          >
            {isRuleBased ? (
              <Shield className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            ) : (
              <Cpu className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#222321] dark:text-[#F4F1EC] leading-tight">
              {provider.displayName}
            </p>
            <p className="text-[10px] text-[#747570] dark:text-[#A8A29A] font-mono truncate mt-0.5">
              {provider.modelId}
            </p>
          </div>
        </div>
        <StatusDot ok={isRuleBased || provider.isConfigured} />
      </div>

      {/* Capability chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {provider.supportsVision && <Chip label="Vision" color="blue" />}
        {provider.supportsTextReasoning && <Chip label="Text Reasoning" color="green" />}
        {!provider.supportsVision && !isRuleBased && (
          <Chip label="Text Only" color="zinc" />
        )}
        {isRuleBased && <Chip label="Always Available" color="zinc" />}
      </div>

      {/* Role badges */}
      <div className="flex flex-wrap gap-1.5">
        {provider.isVisionProvider && <Chip label="Active Vision Provider" color="blue" />}
        {provider.isTextProvider && !provider.isVisionProvider && (
          <Chip label="Active Text Provider" color="green" />
        )}
        {provider.isVisionProvider && provider.isTextProvider && (
          <Chip label="Active Text Provider" color="green" />
        )}
        {!provider.isConfigured && !isRuleBased && (
          <Chip label="Not Configured" color="amber" />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AISettingsPage() {
  const [status, setStatus] = useState<AIStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await internalFetch('/api/ai/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus(data);
      setLastRefreshed(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load AI status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  const usagePct = status
    ? Math.min(100, Math.round((status.usage.requests_used_today / status.usage.requests_limit_per_day) * 100))
    : 0;

  const usageColor =
    usagePct >= 90 ? 'bg-rose-500' : usagePct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#222321] dark:text-[#F4F1EC]">
              AI Settings
            </h1>
            <p className="text-sm text-[#747570] dark:text-[#A8A29A] mt-1">
              Manage AI providers, view usage, and configure the free-tier recommendation engine.
            </p>
          </div>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E6E4DE] dark:border-[#35322F] text-xs font-semibold text-[#747570] hover:border-[#3B4D42] hover:text-[#3B4D42] dark:hover:text-[#6FA898] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Zero-Cost Banner */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#E5EEE9]/60 dark:bg-[#253D36]/30 border border-[#3B4D42]/20">
          <Shield className="w-5 h-5 text-[#3B4D42] dark:text-[#6FA898] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#3B4D42] dark:text-[#6FA898]">
              Zero-Cost Protection Active
            </p>
            <p className="text-xs text-[#747570] dark:text-[#A8A29A] mt-0.5 leading-relaxed">
              MyStyle AI will never automatically switch to paid AI services. Paid model endpoints are{' '}
              {status?.config.allow_paid_models ? (
                <span className="text-amber-600 font-semibold">enabled by administrator</span>
              ) : (
                <span className="font-semibold text-[#3B4D42] dark:text-[#6FA898]">disabled</span>
              )}
              . When free quotas are exhausted, rule-based recommendations continue without interruption.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-700 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Active Providers */}
        <section className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#222321] dark:text-[#F4F1EC] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#3B4D42] dark:text-[#6FA898]" />
            Active Providers
          </h2>

          {loading && !status ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[0, 1].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-[#F2EFEA] dark:bg-[#282623] animate-pulse" />
              ))}
            </div>
          ) : status ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Vision provider summary */}
              <div className="p-5 rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] bg-white dark:bg-[#1E1D1B] space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-sky-500" />
                  <span className="text-xs font-bold text-[#222321] dark:text-[#F4F1EC] uppercase tracking-wide">
                    Image Analysis (Vision)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#222321] dark:text-[#F4F1EC]">
                      {status.active.vision.provider}
                    </p>
                    <p className="text-[11px] text-[#747570] font-mono">{status.active.vision.model}</p>
                  </div>
                  {status.active.vision.isConfigured ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
                {!status.active.vision.isConfigured && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">
                    Set GEMINI_API_KEY in .env.local to enable AI vision analysis.
                    Rule-based analysis is active as fallback.
                  </p>
                )}
              </div>

              {/* Text provider summary */}
              <div className="p-5 rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] bg-white dark:bg-[#1E1D1B] space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-[#222321] dark:text-[#F4F1EC] uppercase tracking-wide">
                    Outfit Reasoning (Text)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#222321] dark:text-[#F4F1EC]">
                      {status.active.text.provider}
                    </p>
                    <p className="text-[11px] text-[#747570] font-mono">{status.active.text.model}</p>
                  </div>
                  {status.active.text.isConfigured ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
                {!status.active.text.isConfigured && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400">
                    Rule-based styling explanations are active. Configure a provider for AI-enhanced tips.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </section>

        {/* Daily Usage */}
        {status && (
          <section className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#222321] dark:text-[#F4F1EC] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#3B4D42] dark:text-[#6FA898]" />
              AI Usage Today
            </h2>

            <div className="p-5 rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] bg-white dark:bg-[#1E1D1B] space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#747570] dark:text-[#A8A29A]">Requests used</span>
                <span className="font-semibold text-[#222321] dark:text-[#F4F1EC]">
                  {status.usage.requests_used_today} / {status.usage.requests_limit_per_day}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-[#F2EFEA] dark:bg-[#282623] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${usageColor}`}
                  style={{ width: `${usagePct}%` }}
                />
              </div>

              {usagePct >= 90 && (
                <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    Daily AI request budget nearly exhausted. Rule-based outfit recommendations will
                    continue working without interruption. Resets at midnight.
                  </span>
                </div>
              )}

              {status.usage.last_error && (
                <div className="flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400">
                  <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Last error: {status.usage.last_error}</span>
                </div>
              )}

              <p className="text-[10px] text-[#A8A29A] leading-relaxed">
                This is an application-level safety limit, separate from provider quotas. Outfit generation
                using the built-in rule engine never counts toward this limit.
              </p>
            </div>
          </section>
        )}

        {/* All Providers */}
        {status && (
          <section className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#222321] dark:text-[#F4F1EC] flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-[#3B4D42] dark:text-[#6FA898]" />
              All Providers
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {status.providers.map((p) => (
                <ProviderCard key={p.name} provider={p} />
              ))}
            </div>
          </section>
        )}

        {/* Fallback Status */}
        {status && (
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#222321] dark:text-[#F4F1EC] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#3B4D42] dark:text-[#6FA898]" />
              Rule-Based Fallback
            </h2>

            <div className={`flex items-center justify-between p-4 rounded-2xl border ${
              status.config.rule_based_fallback_enabled
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-[#E6E4DE] dark:border-[#35322F] bg-[#F8F7F4] dark:bg-[#282623]'
            }`}>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[#222321] dark:text-[#F4F1EC]">
                  Rule-Based Outfit Engine
                </p>
                <p className="text-xs text-[#747570] dark:text-[#A8A29A]">
                  Generates outfit combinations using colour science, formality matching, and occasion scoring.
                  Always runs without AI. Serves as the last-resort fallback.
                </p>
              </div>
              <div className="shrink-0 ml-4">
                {status.config.rule_based_fallback_enabled ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-zinc-400" />
                )}
              </div>
            </div>
          </section>
        )}

        {/* Setup Guide */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-[#222321] dark:text-[#F4F1EC] flex items-center gap-2">
            <Info className="w-5 h-5 text-[#3B4D42] dark:text-[#6FA898]" />
            Setup Guide
          </h2>

          {[
            {
              title: 'Google Gemini (Recommended)',
              desc: 'Free-tier vision + text. Set GEMINI_API_KEY in .env.local. Get a free key at aistudio.google.com.',
              href: 'https://aistudio.google.com',
              badge: 'Free Tier',
            },
            {
              title: 'GroqCloud (Optional Text)',
              desc: 'Fast free-plan text reasoning for outfit explanations. Set GROQ_API_KEY. Get a key at console.groq.com.',
              href: 'https://console.groq.com',
              badge: 'Free Plan',
            },
            {
              title: 'Ollama (Optional Self-Hosted)',
              desc: 'Run qwen2.5vl or LLaVA locally. Set OLLAMA_BASE_URL. Requires ~6 GB VRAM or unified RAM.',
              href: 'https://ollama.com',
              badge: 'Self-Hosted',
            },
          ].map((item) => (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] bg-white dark:bg-[#1E1D1B] hover:border-[#3B4D42]/50 transition-colors group"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#222321] dark:text-[#F4F1EC]">{item.title}</p>
                  <Chip label={item.badge} color={item.badge === 'Free Tier' ? 'green' : item.badge === 'Free Plan' ? 'blue' : 'zinc'} />
                </div>
                <p className="text-xs text-[#747570] dark:text-[#A8A29A] leading-relaxed">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#747570] group-hover:text-[#3B4D42] dark:group-hover:text-[#6FA898] shrink-0 mt-0.5 transition-colors" />
            </a>
          ))}
        </section>

        {/* Last refreshed */}
        {lastRefreshed && (
          <p className="text-center text-[10px] text-[#A8A29A]">
            Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </p>
        )}
      </div>
    </AppShell>
  );
}

import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Shirt, Palette, Calendar } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#222321] flex flex-col justify-between selection:bg-[#3B4D42] selection:text-white">
      {/* Top Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3B4D42] text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-[#222321]">
            MyStyle AI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#747570] hover:text-[#222321] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold px-4 py-2 rounded-xl bg-[#3B4D42] text-white hover:bg-[#2E3D34] shadow-sm transition-all"
          >
            Launch App
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5EEE9] text-[#3B4D42] text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Digital Wardrobe & Personal Stylist</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#222321] max-w-4xl leading-[1.1]">
          Your Wardrobe. <br className="hidden sm:inline" />
          <span className="italic font-normal text-[#3B4D42]">Your Style.</span> Reimagined.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-[#747570] max-w-2xl font-normal leading-relaxed">
          Organise your clothes, discover fresh outfit combinations, and let AI help you look your best every day — strictly assembled from pieces you already own.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/onboarding"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#3B4D42] text-white text-base font-semibold hover:bg-[#2E3D34] shadow-md hover:shadow-lg transition-all"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-[#222321] border border-[#E6E4DE] text-base font-semibold hover:bg-[#F0EEE9] transition-all shadow-xs"
          >
            <span>Explore Demo Closet</span>
          </Link>
        </div>

        {/* Value Proposition Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="bg-white p-7 rounded-2xl border border-[#E6E4DE] shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#F0EEE9] flex items-center justify-center text-[#3B4D42] mb-5">
              <Shirt className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#222321] mb-2">
              Own-Wardrobe First
            </h3>
            <p className="text-sm text-[#747570] leading-relaxed">
              We never invent phantom garments or push unnecessary shopping. Every outfit recommendation begins with what is already hanging in your closet.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-[#E6E4DE] shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#F0EEE9] flex items-center justify-center text-[#3B4D42] mb-5">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#222321] mb-2">
              7-Dimension Styling Logic
            </h3>
            <p className="text-sm text-[#747570] leading-relaxed">
              Combinations are evaluated across colour harmony, silhouette balance, occasion formality, weather readiness, and freshness.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-[#E6E4DE] shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#F0EEE9] flex items-center justify-center text-[#3B4D42] mb-5">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#222321] mb-2">
              Visual Flat-Lays & Planner
            </h3>
            <p className="text-sm text-[#747570] leading-relaxed">
              See complete looks composed with actual photos of your clothing, save capsule wardrobes, and plan ahead on your weekly calendar.
            </p>
          </div>
        </div>

        {/* Trust & Guarantee Banner */}
        <div className="mt-14 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-[#E6E4DE] text-xs text-[#747570] shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-[#4B8067]" />
          <span>Private User Accounts • Cloud & Offline Storage • Zero Phantom Clothes</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E6E4DE] px-6 py-8 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-xs text-[#747570] gap-4">
        <div>
          © {new Date().getFullYear()} MyStyle AI. Your Wardrobe. Your Style. Reimagined.
        </div>
        <div className="flex gap-6">
          <Link href="/dashboard" className="hover:text-[#222321]">Closet</Link>
          <Link href="/stylist" className="hover:text-[#222321]">Stylist</Link>
          <Link href="/planner" className="hover:text-[#222321]">Planner</Link>
          <Link href="/settings" className="hover:text-[#222321]">Privacy & Settings</Link>
        </div>
      </footer>
    </div>
  );
}

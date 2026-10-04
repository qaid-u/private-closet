import React from 'react';
import { Heart, ExternalLink, Code2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const libraries = [
    { name: 'React', license: 'MIT' },
    { name: 'Vite', license: 'MIT' },
    { name: 'Dexie.js (IndexedDB)', license: 'Apache-2.0' },
    { name: 'Tailwind CSS', license: 'MIT' },
    { name: 'Zod', license: 'MIT' },
    { name: 'Lucide Icons', license: 'ISC' },
    { name: 'Zustand', license: 'MIT' },
    { name: 'vite-plugin-pwa (Workbox)', license: 'MIT' },
  ];

  return (
    <div className="bg-surface border border-border rounded-card p-6 space-y-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-card bg-primary-soft text-primary flex items-center justify-center shrink-0">
          <Code2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-text-primary">
            About Private Closet
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Version 0.1.0 &bull; 100% Client-Side Progressive Web App &bull; MIT License
          </p>
        </div>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed pt-2 border-t border-border">
        Private Closet was designed with a fundamental premise: your personal style, photos, and clothing investments belong strictly to you. All recommendations, background removals, and palette evaluations run locally on this device.
      </p>

      {/* Donation Action with EXACT text required by SPEC Section 9 */}
      <div className="p-4 rounded-control bg-accent/10 border border-accent/30 space-y-2">
        <div className="flex items-center gap-2 text-accent font-bold text-xs">
          <Heart className="w-4 h-4 fill-accent" />
          <span>Support Open Source Development</span>
        </div>
        <p className="text-xs text-text-primary font-medium">
          A donation unlocks nothing. Every feature stays free for everyone.
        </p>
        <p className="text-[11px] text-text-secondary">
          Voluntary contributions go toward testing hardware and maintaining offline AI models.
        </p>
      </div>

      {/* Open Source Licenses */}
      <div className="space-y-2 pt-2">
        <span className="text-xs font-bold text-text-primary uppercase tracking-wider block">
          Open-Source Libraries & Attributions
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {libraries.map((lib) => (
            <div
              key={lib.name}
              className="p-2 rounded bg-surface-alt border border-border text-[11px] flex flex-col justify-between"
            >
              <span className="font-semibold text-text-primary truncate">{lib.name}</span>
              <span className="text-text-secondary text-[10px]">{lib.license} License</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-between text-xs border-t border-border gap-2">
        <span className="text-text-secondary">
          Released under MIT License. Zero warranties. 100% on device.
        </span>
        <a
          href="https://github.com/qaid-u/private-closet"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-primary hover:underline font-semibold"
        >
          <span>GitHub Repository</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

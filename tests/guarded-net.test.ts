import { describe, it, expect, beforeEach, vi } from 'vitest';
import { guardedFetch, NetworkPermissionError } from '../src/net/guardedFetch';
import { usePrivacyStore } from '../src/stores/privacyStore';
import fs from 'fs';
import path from 'path';

describe('Guarded Network Layer', () => {
  beforeEach(() => {
    usePrivacyStore.setState({
      permissions: { OPEN_METEO_WEATHER: false },
      auditLog: [],
    });
    vi.restoreAllMocks();
  });

  it('rejects unregistered destinations immediately', async () => {
    await expect(
      guardedFetch('UNREGISTERED_API' as unknown as keyof typeof import('../src/net/registry').NETWORK_REGISTRY, 'https://api.evil.com/data')
    ).rejects.toThrow(NetworkPermissionError);
  });

  it('blocks registered destination when permission is toggled off', async () => {
    usePrivacyStore.getState().togglePermission('OPEN_METEO_WEATHER', false);
    await expect(
      guardedFetch('OPEN_METEO_WEATHER', 'https://api.open-meteo.com/v1/forecast?latitude=1.35&longitude=103.82')
    ).rejects.toThrow(/disabled/i);

    const audit = usePrivacyStore.getState().auditLog;
    expect(audit).toHaveLength(1);
    expect(audit[0].status).toBe('blocked');
  });

  it('rejects origin mismatch even if permission ID is valid', async () => {
    usePrivacyStore.getState().togglePermission('OPEN_METEO_WEATHER', true);
    await expect(
      guardedFetch('OPEN_METEO_WEATHER', 'https://api.attacker.com/v1/forecast')
    ).rejects.toThrow(/origin mismatch/i);
  });

  it('allows fetch when permission is enabled and records audit entry', async () => {
    usePrivacyStore.getState().togglePermission('OPEN_METEO_WEATHER', true);

    const mockResponse = new Response(JSON.stringify({ current_weather: { temperature: 24.5 } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    vi.spyOn(window, 'fetch').mockResolvedValue(mockResponse);

    const res = await guardedFetch(
      'OPEN_METEO_WEATHER',
      'https://api.open-meteo.com/v1/forecast?latitude=1.35&longitude=103.82'
    );
    expect(res.status).toBe(200);

    const audit = usePrivacyStore.getState().auditLog;
    expect(audit).toHaveLength(1);
    expect(audit[0].status).toBe('allowed');
  });

  it('ensures no unauthorized network primitives exist in src/ outside guardedFetch.ts', () => {
    const srcDir = path.resolve(__dirname, '../src');
    const filesToScan: string[] = [];

    function walkDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          filesToScan.push(fullPath);
        }
      }
    }

    walkDir(srcDir);

    const violations: { file: string; line: number; match: string }[] = [];
    const forbiddenPatterns = [
      /\bwindow\.fetch\b/,
      /\bfetch\(/,
      /\bXMLHttpRequest\b/,
      /\bWebSocket\b/,
      /\bEventSource\b/,
      /\bsendBeacon\b/,
    ];

    for (const filePath of filesToScan) {
      // Exclude guardedFetch itself
      if (filePath.endsWith(path.join('net', 'guardedFetch.ts'))) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        // Skip comment lines
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

        for (const pattern of forbiddenPatterns) {
          if (pattern.test(line)) {
            violations.push({
              file: path.relative(srcDir, filePath),
              line: idx + 1,
              match: line.trim(),
            });
          }
        }
      });
    }

    expect(
      violations,
      `Direct network calls found outside guardedFetch.ts:\n${JSON.stringify(violations, null, 2)}`
    ).toHaveLength(0);
  });
});

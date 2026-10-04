import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Copy & Safety Lint Test', () => {
  const BANNED_TERMS: { term: string; pattern: RegExp }[] = [
    { term: 'slimming', pattern: /\bslimming\b/i },
    { term: 'slim', pattern: /\bslim\b/i },
    { term: 'hide', pattern: /\bhide\b/i },
    { term: 'fix your shape', pattern: /\bfix\s+your\s+shape\b/i },
    { term: 'correct your figure', pattern: /\bcorrect\s+your\s+figure\b/i },
    { term: 'flatter your figure', pattern: /\bflatter\s+your\s+figure\b/i },
    { term: 'flatter your body', pattern: /\bflatter\s+your\s+body\b/i },
    { term: 'BMI', pattern: /\bBMI\b/ },
    { term: 'problem area', pattern: /\bproblem\s+area(s)?\b/i },
    { term: 'ideal weight', pattern: /\bideal\s+weight\b/i },
  ];

  it('scans all source files and fails if any banned body-critical copy exists', () => {
    const srcDir = path.resolve(__dirname, '../src');
    const filesToScan: string[] = [];

    function walkDir(dir: string) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (/\.(ts|tsx|html|json)$/.test(entry.name)) {
          filesToScan.push(fullPath);
        }
      }
    }

    walkDir(srcDir);

    const violations: { file: string; line: number; term: string; snippet: string }[] = [];

    for (const filePath of filesToScan) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Skip comment lines in non-UI files
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
          return;
        }

        for (const { term, pattern } of BANNED_TERMS) {
          if (pattern.test(line)) {
            violations.push({
              file: path.relative(srcDir, filePath),
              line: index + 1,
              term,
              snippet: line.trim(),
            });
          }
        }
      });
    }

    expect(
      violations,
      `Banned body-critical copy detected in src/ files! Fix these violations immediately:\n${JSON.stringify(
        violations,
        null,
        2
      )}`
    ).toHaveLength(0);
  });
});

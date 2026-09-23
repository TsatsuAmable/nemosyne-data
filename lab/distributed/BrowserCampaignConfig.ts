import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface BrowserCampaignConfig {
  schemaVersion: 1;
  id: string;
  runner: 'nemosyne-playwright';
  playwrightConfig: string;
  tests: string[];
  claims: string[];
  prohibitedClaims: string[];
}

const safeRelative = (value: string) => !path.isAbsolute(value) && !value.includes('..');
const validTestPath = (value: string) =>
  safeRelative(value) && value.startsWith('tests/smoke/') && value.endsWith('.spec.ts');

export async function loadBrowserCampaignConfig(
  configPath: string
): Promise<{ config: BrowserCampaignConfig; configHash: string }> {
  const raw = await fs.readFile(configPath, 'utf8');
  const value = JSON.parse(raw) as Partial<BrowserCampaignConfig>;
  if (value.schemaVersion !== 1) throw new Error('unsupported browser config schema');
  if (!value.id?.trim()) throw new Error('browser config requires id');
  if (value.runner !== 'nemosyne-playwright') throw new Error('unsupported browser runner');
  if (typeof value.playwrightConfig !== 'string' || !safeRelative(value.playwrightConfig) || value.playwrightConfig !== 'playwright.config.ts') throw new Error('browser config requires governed Playwright config');
  if (!Array.isArray(value.tests) || value.tests.length === 0 || value.tests.some((test) => typeof test !== 'string' || !validTestPath(test))) throw new Error('browser config requires safe smoke-test paths');
  if (new Set(value.tests).size !== value.tests.length) throw new Error('duplicate browser test');
  if (!Array.isArray(value.claims) || value.claims.length === 0 || value.claims.some((claim) => typeof claim !== 'string' || !claim.trim())) throw new Error('browser config requires supported claims');
  if (!Array.isArray(value.prohibitedClaims) || value.prohibitedClaims.some((claim) => typeof claim !== 'string' || !claim.trim())) throw new Error('browser config requires prohibitedClaims');
  const config = value as BrowserCampaignConfig;
  const configHash = 'sha256:' + crypto.createHash('sha256').update(raw).digest('hex');
  return { config, configHash };
}

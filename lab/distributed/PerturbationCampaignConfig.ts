import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export interface PerturbationSuiteConfig {
  id: string;
  vitestConfig: string;
  requiresWasm: boolean;
  tests: string[];
  claims: string[];
}

export interface PerturbationCampaignConfig {
  schemaVersion: 1;
  id: string;
  runner: 'nemosyne-vitest';
  suites: PerturbationSuiteConfig[];
  prohibitedClaims: string[];
}

const safeRelative = (value: string) => !path.isAbsolute(value) && !value.includes('..');
const validTestPath = (value: string) =>
  safeRelative(value) && value.startsWith('tests/') && value.endsWith('.test.ts');
const validVitestConfig = (value: string) =>
  safeRelative(value) && /^vitest(?:\.[a-z0-9-]+)?\.config\.ts$/i.test(value);

function nonEmptyStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.trim().length > 0);
}
export async function loadPerturbationCampaignConfig(
  configPath: string
): Promise<{ config: PerturbationCampaignConfig; configHash: string }> {
  const raw = await fs.readFile(configPath, 'utf8');
  const value = JSON.parse(raw) as Partial<PerturbationCampaignConfig>;
  if (value.schemaVersion !== 1) throw new Error('unsupported perturbation config schema');
  if (!value.id?.trim()) throw new Error('perturbation config requires id');
  if (value.runner !== 'nemosyne-vitest') throw new Error('unsupported perturbation runner');
  if (!Array.isArray(value.suites) || value.suites.length === 0) throw new Error('perturbation config requires suites');
  const suiteIds = new Set<string>();
  for (const suite of value.suites) {
    if (!suite?.id?.trim() || suiteIds.has(suite.id)) throw new Error('perturbation suite requires unique id');
    suiteIds.add(suite.id);
    if (!validVitestConfig(suite.vitestConfig)) throw new Error('perturbation suite requires safe Vitest config');
    if (typeof suite.requiresWasm !== 'boolean') throw new Error('suite requiresWasm must be boolean');
    if (!nonEmptyStrings(suite.tests) || suite.tests.some((test) => !validTestPath(test))) throw new Error('perturbation suite requires safe Nemosyne test paths');
    if (new Set(suite.tests).size !== suite.tests.length) throw new Error('duplicate perturbation test');
    if (!nonEmptyStrings(suite.claims)) throw new Error('perturbation suite requires supported claims');
  }
  if (!Array.isArray(value.prohibitedClaims) || value.prohibitedClaims.some((claim) => typeof claim !== 'string' || !claim.trim())) throw new Error('perturbation config requires prohibitedClaims');
  const config = value as PerturbationCampaignConfig;
  const configHash = 'sha256:' + crypto.createHash('sha256').update(raw).digest('hex');
  return { config, configHash };
}

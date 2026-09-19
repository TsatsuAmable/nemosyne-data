import assert from 'node:assert/strict';
import { MONETA_BENCHMARK_FAMILIES } from './benchmarks/MonetaBenchmarkCorpus.ts';
import { planPortablePerturbations } from './perturbations/PortablePerturbationPlan.ts';
import { parsePortableExperimentConfig } from './protocols/PortableXRExperiment.ts';
import { createHarnessStatusReport } from './engine/XRExperimentStatusReport.ts';

assert.ok(MONETA_BENCHMARK_FAMILIES.length > 0, 'benchmark registry must not be empty');
const plan=planPortablePerturbations({seeds:[1],data:{enabled:true,runs:1,magnitude:0.1},runtime:{enabled:true,scenarios:['lifecycle']},experimental:{counterbalanceArmOrder:true}});
assert.deepEqual(plan.seeds,[1]);
assert.throws(()=>parsePortableExperimentConfig(JSON.stringify({schemaVersion:1,protocolId:'p',protocolVersion:'1',dataset:{id:'d',fingerprint:'REQUIRED_AT_RUN_TIME',oracleId:'o'},architectures:['baseline-js-main-thread','worker-transfer','worker-shared-buffer'],seeds:[1],replayTraceId:'r',resourceBudgetId:'b'})),/resolved dataset fingerprint/);
const report=createHarnessStatusReport({bundleHash:'sha256:test',runs:[{status:'PASSED'},{status:'ABSTAIN'}],monetaFamilies:MONETA_BENCHMARK_FAMILIES.length,simulator:true});
assert.equal(report.summary.passed,1);
assert.equal(report.summary.abstain,1);
assert.equal(report.evidence.deviceQualified,false);
assert.equal(report.evidence.humanQualified,false);
console.log('lab authority parity self-test: PASS');

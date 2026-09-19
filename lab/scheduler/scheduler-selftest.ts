import { strict as assert } from 'node:assert';
import { jobsForMerge } from './WorkEvidenceScheduler.ts';
import { runnable, upsertJob, type LabLedger } from './LabJobLedger.ts';
const jobs=jobsForMerge({specimenSha:'825da88d1529486c8e7891825b9faa1946412c21',sourcePr:772,mergedAt:'2026-09-19T00:00:00Z'});
assert.deepEqual(jobs.map(j=>j.kind),['deterministic','xr-simulation','quest-automation']);
assert(jobs.every(j=>j.specimenSha.startsWith('825da88d')));
let ledger:LabLedger={version:1,jobs:[]}; for(const j of jobs) ledger=upsertJob(ledger,j);
assert.equal(runnable(ledger).length,3);
console.log('scheduler self-test: PASS');

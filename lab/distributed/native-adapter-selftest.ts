import { strict as assert } from 'node:assert';
import fs from 'node:fs/promises';
import { executeNativeJob } from './NativeWorkerAdapters.ts';
import type { LabJob } from './WorkProtocol.ts';
const root='.native-adapter-selftest';process.env.NEMOSYNE_LAB_EVIDENCE_ROOT=root;
const mk=(worker:LabJob['worker']):LabJob=>({jobId:'test-'+worker,specimenSha:'825da88d1529486c8e7891825b9faa1946412c21',stream:worker==='xr-simulator'?'VSL':'RFL',worker,claims:['test'],state:'RUNNING',createdAt:new Date().toISOString(),evidenceRefs:[]});
const unsupported=await executeNativeJob(mk('xr-simulator'));assert.equal(unsupported.disposition,'ABSTAIN');assert.equal(unsupported.evidenceRefs.length,1);assert.equal(JSON.parse(await fs.readFile(unsupported.evidenceRefs[0]!,'utf8')).reason,'native nemosyne simulator runner binding required');
const known=await executeNativeJob(mk('known-structure'));assert.equal(known.disposition,'RECORDED');assert.equal(known.evidenceRefs.length,1);const body=JSON.parse(await fs.readFile(known.evidenceRefs[0]!,'utf8'));assert.equal(body.specimenSha,mk('known-structure').specimenSha);
await fs.rm(root,{recursive:true,force:true});console.log('native worker adapter self-test: PASS');

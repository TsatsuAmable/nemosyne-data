import{strict as assert}from'node:assert';import fs from'node:fs/promises';
import{plannedRefsForMerge,attachNativeRun,recordNativeDisposition,needsFollowup}from'./WorkEvidenceScheduler.ts';
import{upsertRef,openWork,findings,staleForSpecimen,saveLedger,loadLedger,type CoordinationLedger}from'./LabJobLedger.ts';
const sha='825da88d1529486c8e7891825b9faa1946412c21';const refs=plannedRefsForMerge({specimenSha:sha,sourcePr:772,mergedAt:'2026-09-19T00:00:00Z'});
assert.deepEqual(refs.map(x=>x.system),['nemosyne-xr-simulator','nemosyne-qv','nemosyne-data-campaign']);
let l:CoordinationLedger={version:1,work:[]};for(const r of refs)l=upsertRef(l,r);assert.equal(openWork(l).length,3);
const qv=recordNativeDisposition(attachNativeRun(refs[1]!,'QV4-825da88-001'),'FAIL',['evidence/qv.json']);l=upsertRef(l,qv);assert(needsFollowup(qv));assert.equal(findings(l).length,1);assert.equal(staleForSpecimen(l,'newsha').length,2); assert.equal(staleForSpecimen(l,sha).length,0);
const p='.scheduler-selftest.json';await saveLedger(p,l);assert.equal((await loadLedger(p)).work.length,3);await fs.unlink(p);console.log('coordination index self-test: PASS');

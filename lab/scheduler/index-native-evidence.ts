import path from'node:path';import{indexPreservedQuestEvidence,indexXRArchitectureArtifacts}from'./NativeEvidenceIndex.ts';import{loadLedger,saveLedger,upsertRef}from'./LabJobLedger.ts';
const ledgerPath=path.resolve(process.argv[2]??'lab/scheduler/coordination-ledger.json');let l=await loadLedger(ledgerPath);
for(const r of await indexPreservedQuestEvidence(path.resolve('evidence/mac-validation/2026-09/performance-and-quest')))l=upsertRef(l,r);
for(const r of await indexXRArchitectureArtifacts(path.resolve('lab/xr-architecture/artifacts')))l=upsertRef(l,r);
await saveLedger(ledgerPath,l);console.log(JSON.stringify({ledger:ledgerPath,work:l.work.length},null,2));

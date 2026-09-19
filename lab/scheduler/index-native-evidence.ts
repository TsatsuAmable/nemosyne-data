import path from'node:path';import{indexQuestEvidenceRoots,indexXRArchitectureArtifacts}from'./NativeEvidenceIndex.ts';import{loadLedger,saveLedger,upsertRef,openWork,findings,staleForSpecimen}from'./LabJobLedger.ts';
const arg=(n:string)=>{const i=process.argv.indexOf(n);return i>=0?process.argv[i+1]:undefined};
const ledgerPath=path.resolve(arg('--ledger')??'lab/scheduler/coordination-ledger.json');
const roots=(arg('--quest-roots')??'evidence/mac-validation/2026-09/performance-and-quest').split(path.delimiter).map(x=>path.resolve(x));
const currentSha=arg('--current-sha');let l=await loadLedger(ledgerPath);
for(const r of await indexQuestEvidenceRoots(roots))l=upsertRef(l,r);
for(const r of await indexXRArchitectureArtifacts(path.resolve('lab/xr-architecture/artifacts')))l=upsertRef(l,r);
await saveLedger(ledgerPath,l);console.log(JSON.stringify({ledger:ledgerPath,work:l.work.length,open:openWork(l).length,findings:findings(l).length,stale:currentSha?staleForSpecimen(l,currentSha).length:undefined},null,2));

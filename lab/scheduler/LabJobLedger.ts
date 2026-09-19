import type { LabJob } from './WorkEvidenceScheduler.ts';
export interface LabLedger { version: 1; jobs: LabJob[]; }
export function upsertJob(ledger: LabLedger, job: LabJob): LabLedger {
  const jobs=ledger.jobs.filter(x=>x.id!==job.id); jobs.push(job);
  jobs.sort((a,b)=>a.id.localeCompare(b.id)); return {version:1,jobs};
}
export function findings(ledger: LabLedger): LabJob[] { return ledger.jobs.filter(j=>j.status==='FINDING'); }
export function runnable(ledger: LabLedger): LabJob[] {
  const byId=new Map(ledger.jobs.map(j=>[j.id,j]));
  return ledger.jobs.filter(j=>j.status==='READY' && j.dependsOn.every(id=>byId.get(id)?.status==='PASS'));
}

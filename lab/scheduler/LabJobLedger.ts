import fs from 'node:fs/promises';
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
export async function loadLedger(path:string):Promise<LabLedger>{
  try { const x=JSON.parse(await fs.readFile(path,'utf8')) as LabLedger; if(x.version!==1||!Array.isArray(x.jobs))throw new Error('invalid ledger'); return x; }
  catch(e){ if((e as NodeJS.ErrnoException).code==='ENOENT')return {version:1,jobs:[]}; throw e; }
}
export async function saveLedger(path:string,ledger:LabLedger):Promise<void>{
  const tmp=path+'.tmp'; await fs.writeFile(tmp,JSON.stringify(ledger,null,2)+'\n'); await fs.rename(tmp,path);
}

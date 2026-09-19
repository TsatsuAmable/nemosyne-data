import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { LabJob } from './WorkProtocol.ts';

export interface NativeRunResult { disposition:string; evidenceRefs:string[] }
export type NativeWorkerAdapter=(job:LabJob)=>Promise<NativeRunResult>;

const run=(cmd:string,args:string[],env:NodeJS.ProcessEnv={})=>new Promise<void>((resolve,reject)=>{
 const p=spawn(cmd,args,{stdio:'inherit',env:{...process.env,...env}});
 p.on('error',reject); p.on('exit',c=>c===0?resolve():reject(new Error(`${cmd} exited ${c}`)));
});
const evidence=(job:LabJob,name:string)=>path.resolve(process.env.NEMOSYNE_LAB_EVIDENCE_ROOT??'.lab-state/evidence',job.jobId,name);
async function marker(job:LabJob,name:string,body:unknown){const f=evidence(job,name);await fs.mkdir(path.dirname(f),{recursive:true});await fs.writeFile(f,JSON.stringify(body,null,2)+'\n');return f;}

export const nativeWorkerAdapters:Partial<Record<LabJob['worker'],NativeWorkerAdapter>>={
 'known-structure':async job=>{await run(process.execPath,['--experimental-strip-types','lab/parity-selftest.ts'],{NEMOSYNE_BUILD_HASH:job.specimenSha});return{disposition:'RECORDED',evidenceRefs:[await marker(job,'known-structure.json',{jobId:job.jobId,specimenSha:job.specimenSha,runner:'lab/parity-selftest.ts'})]};},
 'perturbation-campaign':async job=>({disposition:'ABSTAIN',evidenceRefs:[await marker(job,'perturbation-abstain.json',{reason:'no governed executable campaign config attached',jobId:job.jobId})]}),
 'adversarial-review':async job=>({disposition:'ABSTAIN',evidenceRefs:[await marker(job,'adversarial-review-abstain.json',{reason:'review packet/provider binding required',jobId:job.jobId})]}),
 'playwright-browser':async job=>({disposition:'ABSTAIN',evidenceRefs:[await marker(job,'playwright-abstain.json',{reason:'native nemosyne product runner binding required',jobId:job.jobId})]}),
 'xr-simulator':async job=>({disposition:'ABSTAIN',evidenceRefs:[await marker(job,'xr-simulator-abstain.json',{reason:'native nemosyne simulator runner binding required',jobId:job.jobId})]}),
 'quest-qv':async job=>({disposition:'ABSTAIN',evidenceRefs:[await marker(job,'quest-qv-abstain.json',{reason:'physical Quest qualification is explicit/on-demand',jobId:job.jobId})]})
};
export async function executeNativeJob(job:LabJob){const a=nativeWorkerAdapters[job.worker];if(!a)throw new Error(`no native adapter for ${job.worker}`);return a(job);}

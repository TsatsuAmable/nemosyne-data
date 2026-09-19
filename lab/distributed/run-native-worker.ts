import { executeNativeJob } from './NativeWorkerAdapters.ts';
const base=process.env.NEMOSYNE_WORKER_API_URL,token=process.env.NEMOSYNE_WORKER_API_TOKEN,workerId=process.env.NEMOSYNE_WORKER_ID??'mac-lab-worker';
if(!base||!token)throw new Error('worker API URL/token required');
const capabilities=(process.env.NEMOSYNE_WORKER_CAPABILITIES??'known-structure,perturbation-campaign,adversarial-review').split(',').map(x=>x.trim()).filter(Boolean);
const post=async(p:string,b:unknown)=>{const r=await fetch(base+p,{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify(b)});if(!r.ok)throw new Error(`${p}: ${r.status} ${await r.text()}`);return r.json() as Promise<any>};
await post('/v1/workers/register',{workerId,profile:'full',capabilities,registeredAt:new Date().toISOString()});
while(true){const j=await post('/v1/jobs/claim',{workerId});if(!j)break;await post('/v1/jobs/start',{jobId:j.jobId,leaseToken:j.lease.token});try{const r=await executeNativeJob(j);await post('/v1/jobs/complete',{jobId:j.jobId,leaseToken:j.lease.token,disposition:r.disposition,evidenceRefs:r.evidenceRefs});console.log(`COMPLETED ${j.jobId} ${r.disposition}`)}catch(e){console.error(`FAILED ${j.jobId}`,e);process.exitCode=1;break}}

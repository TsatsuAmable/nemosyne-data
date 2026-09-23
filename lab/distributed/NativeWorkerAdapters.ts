import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { LabJob } from './WorkProtocol.ts';
import { loadPerturbationCampaignConfig } from './PerturbationCampaignConfig.ts';

export interface NativeRunResult { disposition:string; evidenceRefs:string[] }
export type NativeWorkerAdapter=(job:LabJob)=>Promise<NativeRunResult>;

const run=(cmd:string,args:string[],env:NodeJS.ProcessEnv={})=>new Promise<void>((resolve,reject)=>{
 const p=spawn(cmd,args,{stdio:'inherit',env:{...process.env,...env}});
 p.on('error',reject); p.on('exit',c=>c===0?resolve():reject(new Error(`${cmd} exited ${c}`)));
});
const evidence=(job:LabJob,name:string)=>path.resolve(process.env.NEMOSYNE_LAB_EVIDENCE_ROOT??'.lab-state/evidence',job.jobId,name);
async function marker(job:LabJob,name:string,body:unknown){const f=evidence(job,name);await fs.mkdir(path.dirname(f),{recursive:true});await fs.writeFile(f,JSON.stringify(body,null,2)+'\n');return f;}

const XR_SIMULATOR_TESTS=[
 'tests/ui-system/webxr-simulator.test.ts',
 'tests/webxr-lifecycle.test.ts',
 'tests/webxr-6dof-pose-rig.test.ts',
 'tests/workspace-surface-manager.test.ts',
 'tests/world-ui-manager.test.ts',
] as const;

const capture=(cmd:string,args:string[],cwd:string)=>new Promise<{code:number;output:string}>((resolve,reject)=>{
 const p=spawn(cmd,args,{cwd,env:process.env});let output='';
 p.stdout?.on('data',chunk=>{output+=String(chunk)});p.stderr?.on('data',chunk=>{output+=String(chunk)});
 p.on('error',reject);p.on('exit',code=>resolve({code:code??1,output}));
});

async function runXrSimulator(job:LabJob):Promise<NativeRunResult>{
 const root=path.resolve(process.env.NEMOSYNE_SOURCE_ROOT??'../nemosyne');
 let head:{code:number;output:string};
 try{head=await capture('git',['rev-parse','HEAD'],root)}catch(error){return{disposition:'ABSTAIN',evidenceRefs:[await marker(job,'xr-simulator-abstain.json',{jobId:job.jobId,specimenSha:job.specimenSha,reason:`Nemosyne source checkout unavailable: ${String(error)}`})]}}
 const actual=head.output.trim();
 if(head.code!==0||actual!==job.specimenSha)return{disposition:'ABSTAIN',evidenceRefs:[await marker(job,'xr-simulator-abstain.json',{jobId:job.jobId,specimenSha:job.specimenSha,actualHead:actual||null,reason:'Nemosyne source checkout does not match the exact job specimen SHA'})]};
 const status=await capture('git',['status','--porcelain'],root);
 if(status.code!==0||status.output.trim())return{disposition:'ABSTAIN',evidenceRefs:[await marker(job,'xr-simulator-abstain.json',{jobId:job.jobId,specimenSha:job.specimenSha,reason:'Nemosyne source checkout is not clean'})]};
 const cli=path.join(root,'node_modules','vitest','vitest.mjs');
 try{await fs.access(cli)}catch{return{disposition:'ABSTAIN',evidenceRefs:[await marker(job,'xr-simulator-abstain.json',{jobId:job.jobId,specimenSha:job.specimenSha,reason:'Nemosyne Vitest runner is not installed in the pinned checkout'})]}}
 const result=await capture(process.execPath,[cli,'run',...XR_SIMULATOR_TESTS],root);
 const disposition=result.code===0?'PASS':'FAIL';
 const log=evidence(job,'xr-simulator.log');await fs.mkdir(path.dirname(log),{recursive:true});await fs.writeFile(log,result.output);
 const summary=await marker(job,'xr-simulator.json',{jobId:job.jobId,specimenSha:job.specimenSha,disposition,exitCode:result.code,tests:XR_SIMULATOR_TESTS});
 return{disposition,evidenceRefs:[summary,log]};
}

async function runPerturbationCampaign(job:LabJob):Promise<NativeRunResult>{
 const configPath=path.resolve(process.env.NEMOSYNE_PERTURBATION_CONFIG??'lab/config/perturbation-campaign.default.json');
 let loaded:Awaited<ReturnType<typeof loadPerturbationCampaignConfig>>;
 try{loaded=await loadPerturbationCampaignConfig(configPath)}catch(error){return{disposition:'ABSTAIN',evidenceRefs:[await marker(job,'perturbation-abstain.json',{jobId:job.jobId,specimenSha:job.specimenSha,configPath,reason:`invalid or unavailable perturbation config: ${String(error)}`})]}}
 const {config,configHash}=loaded;
 const authorizedClaims=new Set(config.suites.flatMap(suite=>suite.claims));
 const prohibited=job.claims.filter(claim=>config.prohibitedClaims.includes(claim));
 const unsupported=job.claims.filter(claim=>!authorizedClaims.has(claim));
 if(prohibited.length||unsupported.length)return{disposition:'ABSTAIN',evidenceRefs:[await marker(job,'perturbation-abstain.json',{jobId:job.jobId,specimenSha:job.specimenSha,configId:config.id,configHash,prohibited,unsupported,reason:'campaign config does not authorize every requested claim'})]};
 const root=path.resolve(process.env.NEMOSYNE_SOURCE_ROOT??'../nemosyne');
 let head:{code:number;output:string};
 try{head=await capture('git',['rev-parse','HEAD'],root)}catch(error){return{disposition:'ABSTAIN',evidenceRefs:[await marker(job,'perturbation-abstain.json',{jobId:job.jobId,specimenSha:job.specimenSha,configId:config.id,configHash,reason:`Nemosyne source checkout unavailable: ${String(error)}`})]}}
 const actual=head.output.trim();
 if(head.code!==0||actual!==job.specimenSha)return{disposition:'ABSTAIN',evidenceRefs:[await marker(job,'perturbation-abstain.json',{jobId:job.jobId,specimenSha:job.specimenSha,actualHead:actual||null,configId:config.id,configHash,reason:'Nemosyne source checkout does not match the exact job specimen SHA'})]};
 const status=await capture('git',['status','--porcelain'],root);
 if(status.code!==0||status.output.trim())return{disposition:'ABSTAIN',evidenceRefs:[await marker(job,'perturbation-abstain.json',{jobId:job.jobId,specimenSha:job.specimenSha,configId:config.id,configHash,reason:'Nemosyne source checkout is not clean'})]};
 const cli=path.join(root,'node_modules','vitest','vitest.mjs');
 try{
  await fs.access(cli);
  for(const suite of config.suites){await fs.access(path.join(root,suite.vitestConfig));for(const test of suite.tests)await fs.access(path.join(root,test))}
 }catch{return{disposition:'FAIL',evidenceRefs:[await marker(job,'perturbation.json',{jobId:job.jobId,specimenSha:job.specimenSha,configId:config.id,configHash,disposition:'FAIL',reason:'configured native runner, Vitest config, or test path is unavailable'})]}}
 let output='';
 if(config.suites.some(suite=>suite.requiresWasm)){const build=await capture(process.execPath,['scripts/build-wasm.mjs'],root);output+=build.output;if(build.code!==0){const log=evidence(job,'perturbation.log');await fs.mkdir(path.dirname(log),{recursive:true});await fs.writeFile(log,output);const summary=await marker(job,'perturbation.json',{jobId:job.jobId,specimenSha:job.specimenSha,configId:config.id,configHash,disposition:'FAIL',stage:'build-wasm',exitCode:build.code,claims:job.claims});return{disposition:'FAIL',evidenceRefs:[summary,log]}}}
 const suiteResults=[];
 for(const suite of config.suites){const result=await capture(process.execPath,[cli,'run','--config',suite.vitestConfig,...suite.tests],root);output+=`\n=== ${suite.id} ===\n`+result.output;suiteResults.push({id:suite.id,claims:suite.claims,tests:suite.tests,vitestConfig:suite.vitestConfig,exitCode:result.code});}
 const disposition=suiteResults.every(result=>result.exitCode===0)?'PASS':'FAIL';
 const log=evidence(job,'perturbation.log');await fs.mkdir(path.dirname(log),{recursive:true});await fs.writeFile(log,output);
 const summary=await marker(job,'perturbation.json',{jobId:job.jobId,specimenSha:job.specimenSha,configId:config.id,configHash,disposition,claims:job.claims,suites:suiteResults,prohibitedClaims:config.prohibitedClaims});
 return{disposition,evidenceRefs:[summary,log]};
}

export const nativeWorkerAdapters:Partial<Record<LabJob['worker'],NativeWorkerAdapter>>={
 'known-structure':async job=>{await run(process.execPath,['--experimental-strip-types','lab/parity-selftest.ts'],{NEMOSYNE_BUILD_HASH:job.specimenSha});return{disposition:'RECORDED',evidenceRefs:[await marker(job,'known-structure.json',{jobId:job.jobId,specimenSha:job.specimenSha,runner:'lab/parity-selftest.ts'})]};},
 'perturbation-campaign':runPerturbationCampaign,
 'adversarial-review':async job=>({disposition:'ABSTAIN',evidenceRefs:[await marker(job,'adversarial-review-abstain.json',{reason:'review packet/provider binding required',jobId:job.jobId})]}),
 'playwright-browser':async job=>({disposition:'ABSTAIN',evidenceRefs:[await marker(job,'playwright-abstain.json',{reason:'native nemosyne product runner binding required',jobId:job.jobId})]}),
 'xr-simulator':runXrSimulator,
 'quest-qv':async job=>({disposition:'ABSTAIN',evidenceRefs:[await marker(job,'quest-qv-abstain.json',{reason:'physical Quest qualification is explicit/on-demand',jobId:job.jobId})]})
};
export async function executeNativeJob(job:LabJob){const a=nativeWorkerAdapters[job.worker];if(!a)throw new Error(`no native adapter for ${job.worker}`);return a(job);}

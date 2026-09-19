import fs from 'node:fs/promises'; import type{NativeWorkRef}from'./WorkEvidenceScheduler.ts';
export interface CoordinationLedger{version:1;work:NativeWorkRef[]}
export function upsertRef(l:CoordinationLedger,r:NativeWorkRef):CoordinationLedger{const work=l.work.filter(x=>!(x.system===r.system&&x.specimenSha===r.specimenSha));work.push(r);work.sort((a,b)=>(a.specimenSha+a.system+a.nativeId).localeCompare(b.specimenSha+b.system+b.nativeId));return{version:1,work};}
export function openWork(l:CoordinationLedger):NativeWorkRef[]{return l.work.filter(x=>x.status!=='TERMINAL');}
export function findings(l:CoordinationLedger):NativeWorkRef[]{return l.work.filter(x=>x.status==='TERMINAL'&&!['PASS','PASSED','ELIGIBLE'].includes(x.nativeDisposition??''));}
export function staleForSpecimen(l:CoordinationLedger,currentSha:string):NativeWorkRef[]{return l.work.filter(x=>x.specimenSha!==currentSha&&x.status!=='TERMINAL');}
export async function loadLedger(path:string):Promise<CoordinationLedger>{try{const x=JSON.parse(await fs.readFile(path,'utf8')) as CoordinationLedger;if(x.version!==1||!Array.isArray(x.work))throw new Error('invalid coordination ledger');return x;}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return{version:1,work:[]};throw e;}}
export async function saveLedger(path:string,l:CoordinationLedger):Promise<void>{const tmp=path+'.tmp';await fs.writeFile(tmp,JSON.stringify(l,null,2)+'\n');await fs.rename(tmp,path);}

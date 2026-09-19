import fs from'node:fs/promises';import path from'node:path';import type{NativeWorkRef}from'./WorkEvidenceScheduler.ts';
const read=async(p:string)=>JSON.parse(await fs.readFile(p,'utf8')) as Record<string,any>;
export async function indexPreservedQuestEvidence(root:string):Promise<NativeWorkRef[]>{
 const out:NativeWorkRef[]=[];for(const e of await fs.readdir(root,{withFileTypes:true})){if(!e.isDirectory())continue;const dir=path.join(root,e.name);try{
  const m=await read(path.join(dir,'manifest.json'));let d:Record<string,any>|null=null;try{d=await read(path.join(dir,'disposition.json'));}catch{}
  const disposition=d?.gateDisposition?.status??m?.gateDisposition?.status??'INCOMPLETE';
  out.push({system:'nemosyne-qv',nativeId:String(m.sessionId??e.name),specimenSha:String(m.buildId??''),status:d?'TERMINAL':'RUNNING',nativeDisposition:String(disposition),evidenceRefs:[path.relative(process.cwd(),dir)]});
 }catch{}}
 return out.filter(x=>/^[0-9a-f]{40}$/i.test(x.specimenSha));
}
export async function indexXRArchitectureArtifacts(root:string):Promise<NativeWorkRef[]>{
 const out:NativeWorkRef[]=[];let names:string[]=[];try{names=await fs.readdir(root);}catch{return out;}
 for(const name of names.filter(n=>n.endsWith('.json'))){const file=path.join(root,name);try{const x=await read(file);const sha=String(x?.specimen?.commit??x?.specimenSha??x?.buildHash??'');if(!/^[0-9a-f]{40}$/i.test(sha))continue;out.push({system:'nemosyne-data-campaign',nativeId:String(x.bundleHash??x.campaignId??name),specimenSha:sha,status:'TERMINAL',nativeDisposition:String(x.status??'RECORDED'),evidenceRefs:[path.relative(process.cwd(),file)]});}catch{}}
 return out;
}

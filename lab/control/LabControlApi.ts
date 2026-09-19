import{describeLab,listCapabilities}from'./LabCapabilityRegistry.ts';import{selectWork,type ChangeManifest,type Stream}from'../scheduler/CapabilityClaimGraph.ts';import{loadCatalogue}from'../evidence/FileEvidenceCatalogue.ts';
export const LAB_CONTROL_TOOLS=['lab.describe','capabilities.list','work.plan','claims.status','runs.status','evidence.query','findings.list'] as const;
export type LabControlTool=typeof LAB_CONTROL_TOOLS[number];
export interface ToolRequest{tool:LabControlTool;arguments?:Record<string,unknown>}
export async function invoke(req:ToolRequest,opts:{cataloguePath:string}){
 const a=req.arguments??{};
 switch(req.tool){
  case'lab.describe':return describeLab();
  case'capabilities.list':return listCapabilities(a.stream as Stream|undefined);
  case'work.plan':return selectWork(a.manifest as unknown as ChangeManifest);
  case'claims.status':{const c=await loadCatalogue(opts.cataloguePath);return c.claims.filter(x=>!a.claim||x.claim===a.claim);}
  case'runs.status':{const c=await loadCatalogue(opts.cataloguePath);return c.runs.filter(x=>!a.specimenSha||x.specimenSha===a.specimenSha);}
  case'evidence.query':{const c=await loadCatalogue(opts.cataloguePath);return c.evidence.filter(x=>!a.claim||x.claims.includes(String(a.claim)));}
  case'findings.list':{const c=await loadCatalogue(opts.cataloguePath);return c.findings.filter(x=>!a.claim||x.claim===a.claim);}
 }
}

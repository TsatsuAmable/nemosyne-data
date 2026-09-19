export type LabJobKind = 'deterministic' | 'xr-simulation' | 'perturbation' | 'quest-automation' | 'adversarial-review' | 'human-evidence' | 'remediation';
export type LabJobStatus = 'PLANNED' | 'READY' | 'RUNNING' | 'PASS' | 'FINDING' | 'BLOCKED' | 'INVALID' | 'CANCELLED';
export interface LabJob { id:string; kind:LabJobKind; specimenSha:string; sourcePr?:number; claimIds:string[]; dependsOn:string[]; status:LabJobStatus; blocking:boolean; evidenceRefs:string[]; successorIds:string[]; }
export interface MergeEvent { specimenSha:string; sourcePr:number; mergedAt:string; }
const mk=(sha:string,pr:number,kind:LabJobKind,blocking=false):LabJob=>({id:`${sha.slice(0,12)}:${kind}`,kind,specimenSha:sha,sourcePr:pr,claimIds:[],dependsOn:[],status:'READY',blocking,evidenceRefs:[],successorIds:[]});
export function jobsForMerge(e:MergeEvent):LabJob[]{return[mk(e.specimenSha,e.sourcePr,'deterministic',true),mk(e.specimenSha,e.sourcePr,'xr-simulation'),mk(e.specimenSha,e.sourcePr,'quest-automation')];}
export function spawnRemediation(finding:LabJob):LabJob{
  if(finding.status!=='FINDING')throw new Error('remediation requires FINDING');
  const id=`${finding.id}:remediation`; if(!finding.successorIds.includes(id))finding.successorIds.push(id);
  return {...mk(finding.specimenSha,finding.sourcePr??0,'remediation',finding.blocking),id,claimIds:[...finding.claimIds],dependsOn:[finding.id]};
}
export function spawnJustInTimeReview(job:LabJob,claimIds:string[]):LabJob{
  return {...mk(job.specimenSha,job.sourcePr??0,'adversarial-review',job.blocking),id:`${job.id}:adversarial`,claimIds:[...claimIds],dependsOn:[job.id]};
}

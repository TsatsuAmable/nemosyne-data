export type NativeSystem='nemosyne-qv'|'nemosyne-xr-simulator'|'nemosyne-data-campaign'|'adversarial-committee';
export type CoordinationStatus='PLANNED'|'RUNNING'|'TERMINAL';
export interface NativeWorkRef { system:NativeSystem; nativeId:string; specimenSha:string; sourcePr?:number; status:CoordinationStatus; nativeDisposition?:string; evidenceRefs:string[]; supersedes?:string[]; }
export interface MergeEvent { specimenSha:string; sourcePr:number; mergedAt:string; }
export function plannedRefsForMerge(e:MergeEvent):NativeWorkRef[]{
  const mk=(system:NativeSystem,nativeId:string):NativeWorkRef=>({system,nativeId,specimenSha:e.specimenSha,sourcePr:e.sourcePr,status:'PLANNED',evidenceRefs:[]});
  return [
    mk('nemosyne-xr-simulator',`merge:${e.specimenSha}:xr`),
    mk('nemosyne-qv',`merge:${e.specimenSha}:quest`),
    mk('nemosyne-data-campaign',`merge:${e.specimenSha}:lab`)
  ];
}
export function attachNativeRun(planned:NativeWorkRef,nativeId:string):NativeWorkRef{
  if(planned.status!=='PLANNED')throw new Error('only planned work can bind a native run');
  return {...planned,nativeId,status:'RUNNING'};
}
export function recordNativeDisposition(ref:NativeWorkRef,disposition:string,evidenceRefs:string[]):NativeWorkRef{
  if(!disposition.trim())throw new Error('native disposition required');
  return {...ref,status:'TERMINAL',nativeDisposition:disposition,evidenceRefs:[...evidenceRefs]};
}
export function needsFollowup(ref:NativeWorkRef):boolean{
  if(ref.status!=='TERMINAL')return false;
  return !['PASS','PASSED','ELIGIBLE'].includes(ref.nativeDisposition??'');
}

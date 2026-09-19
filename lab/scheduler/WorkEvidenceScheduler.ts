export type LabJobKind = 'deterministic' | 'xr-simulation' | 'perturbation' | 'quest-automation' | 'adversarial-review' | 'human-evidence';
export type LabJobStatus = 'PLANNED' | 'READY' | 'RUNNING' | 'PASS' | 'FINDING' | 'BLOCKED' | 'INVALID' | 'CANCELLED';
export interface LabJob {
  id: string; kind: LabJobKind; specimenSha: string; sourcePr?: number;
  claimIds: string[]; dependsOn: string[]; status: LabJobStatus;
  blocking: boolean; evidenceRefs: string[]; successorIds: string[];
}
export interface MergeEvent { specimenSha: string; sourcePr: number; mergedAt: string; }
export function jobsForMerge(event: MergeEvent): LabJob[] {
  const mk=(kind: LabJobKind, blocking=false): LabJob => ({
    id: `${event.specimenSha.slice(0,12)}:${kind}`, kind, specimenSha:event.specimenSha,
    sourcePr:event.sourcePr, claimIds:[], dependsOn:[], status:'READY', blocking,
    evidenceRefs:[], successorIds:[]
  });
  return [mk('deterministic',true), mk('xr-simulation'), mk('quest-automation')];
}
export function assertTerminalClosure(jobs: LabJob[]): void {
  const terminal=new Set<LabJobStatus>(['PASS','FINDING','INVALID','CANCELLED']);
  for(const job of jobs) if(!terminal.has(job.status) && job.status!=='BLOCKED' && job.successorIds.length===0)
    throw new Error(`open job has no successor: ${job.id}`);
}

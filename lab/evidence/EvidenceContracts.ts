export type LabStream='VSL'|'RFL';
export type RunStatus='RUNNING'|'COMPLETED'|'FAILED'|'ABORTED';
export type EvidenceDisposition='PASS'|'FAIL'|'FALSIFIED'|'ABSTAIN'|'INCOMPLETE'|'RECORDED';
export interface ArtifactRef { sha256:string; uri:string; mediaType?:string; bytes?:number; }
export interface RunRecord { runId:string; jobId:string; stream:LabStream; specimenSha:string; protocol:string; protocolVersion:string; workerId:string; runtimeLineage:string; startedAt:string; completedAt?:string; status:RunStatus; artifacts:ArtifactRef[]; checkpoint?:ArtifactRef; }
export interface EvidenceRecord { evidenceId:string; runId:string; evidenceClass:string; claims:string[]; disposition:EvidenceDisposition; criteriaVersion:string; artifacts:ArtifactRef[]; recordedAt:string; }
export interface FindingRecord { findingId:string; evidenceIds:string[]; claim:string; disposition:EvidenceDisposition; summary:string; remediationSha?:string; successorEvidenceIds?:string[]; }
export interface ClaimState { claim:string; specimenSha:string; findingIds:string[]; state:'SUPPORTED'|'FALSIFIED'|'ABSTAIN'|'UNKNOWN'; updatedAt:string; }
export interface EvidenceCatalogue { version:1; runs:RunRecord[]; evidence:EvidenceRecord[]; findings:FindingRecord[]; claims:ClaimState[]; }
export function assertSha(v:string,label='sha'):void { if(!/^[0-9a-f]{40}$/i.test(v))throw new Error(`${label} must be an exact 40-character Git SHA`); }
export function assertDigest(v:string):void { if(!/^[0-9a-f]{64}$/i.test(v))throw new Error('artifact sha256 must be 64 hexadecimal characters'); }
export function validateRun(r:RunRecord):void { assertSha(r.specimenSha,'specimenSha'); if(!r.runId||!r.jobId||!r.protocol||!r.workerId||!r.runtimeLineage)throw new Error('run identity fields required'); for(const a of r.artifacts)assertDigest(a.sha256); if(r.status==='COMPLETED'&&!r.completedAt)throw new Error('completed run requires completedAt'); }

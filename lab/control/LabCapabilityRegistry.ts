import {CLAIM_DEPENDENCIES,type WorkerId,type Stream,type CostClass} from '../scheduler/CapabilityClaimGraph.ts';
export interface WorkerCapability {id:WorkerId;stream:Stream;cost:CostClass;description:string;authority:'nemosyne'|'nemosyne-data';evidenceClasses:string[];}
const WORKERS:WorkerCapability[]=[
{id:'playwright-browser',stream:'VSL',cost:'CHEAP',description:'Production browser verification',authority:'nemosyne',evidenceClasses:['E1']},
{id:'xr-simulator',stream:'VSL',cost:'CHEAP',description:'WebXR/IWER and lifecycle simulation',authority:'nemosyne',evidenceClasses:['E2']},
{id:'quest-qv',stream:'VSL',cost:'EXPENSIVE',description:'Governed physical Quest verification',authority:'nemosyne',evidenceClasses:['E5']},
{id:'known-structure',stream:'RFL',cost:'CHEAP',description:'Known-structure and negative-control campaigns',authority:'nemosyne-data',evidenceClasses:['RFL-KNOWN-STRUCTURE']},
{id:'perturbation-campaign',stream:'RFL',cost:'MODERATE',description:'Portable falsification and perturbation campaigns',authority:'nemosyne-data',evidenceClasses:['RFL-PERTURBATION']},
{id:'adversarial-review',stream:'RFL',cost:'MODERATE',description:'Adversarial research review',authority:'nemosyne-data',evidenceClasses:['RFL-REVIEW']},
];
export function describeLab(){return{schemaVersion:1,principle:'LLM proposes and orchestrates; protocols execute; native adjudicators decide.',profiles:{vsl:WORKERS.filter(x=>x.stream==='VSL').map(x=>x.id),rfl:WORKERS.filter(x=>x.stream==='RFL').map(x=>x.id),full:WORKERS.map(x=>x.id)},workers:WORKERS,claims:CLAIM_DEPENDENCIES.map(x=>({claim:x.claim,capabilities:x.capabilities}))};}
export function listCapabilities(stream?:Stream){return stream?WORKERS.filter(x=>x.stream===stream):WORKERS;}

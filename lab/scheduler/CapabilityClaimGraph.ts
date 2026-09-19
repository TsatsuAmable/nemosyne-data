export type Stream = 'VSL' | 'RFL';
export type CostClass = 'CHEAP' | 'MODERATE' | 'EXPENSIVE';
export type WorkerId =
  | 'playwright-browser'
  | 'xr-simulator'
  | 'quest-qv'
  | 'known-structure'
  | 'perturbation-campaign'
  | 'adversarial-review';

export interface ClaimDependency {
  claim: string;
  capabilities: readonly string[];
  workers: readonly { stream: Stream; worker: WorkerId; cost: CostClass }[];
}

/** Initial explicit graph. Unknown capabilities fail closed into research review. */
export const CLAIM_DEPENDENCIES: readonly ClaimDependency[] = [
  { claim:'desktop-product-operability', capabilities:['desktop-ui','browser-runtime','investigation-flow'], workers:[{stream:'VSL',worker:'playwright-browser',cost:'CHEAP'}] },
  { claim:'xr-interaction-correctness', capabilities:['xr-input','xr-runtime','spatial-ui'], workers:[{stream:'VSL',worker:'xr-simulator',cost:'CHEAP'},{stream:'VSL',worker:'quest-qv',cost:'EXPENSIVE'}] },
  { claim:'xr-lifecycle-correctness', capabilities:['xr-lifecycle','resource-lifecycle','async-generation'], workers:[{stream:'VSL',worker:'xr-simulator',cost:'CHEAP'},{stream:'VSL',worker:'quest-qv',cost:'EXPENSIVE'}] },
  { claim:'semantic-preservation', capabilities:['semantic-embodiment','semantic-detail','representation'], workers:[{stream:'RFL',worker:'known-structure',cost:'CHEAP'},{stream:'RFL',worker:'perturbation-campaign',cost:'MODERATE'}] },
  { claim:'analytical-admissibility', capabilities:['moneta-analysis','representation','fitness-model'], workers:[{stream:'RFL',worker:'known-structure',cost:'CHEAP'},{stream:'RFL',worker:'adversarial-review',cost:'MODERATE'}] },
  { claim:'bounded-runtime-resources', capabilities:['resource-lifecycle','semantic-detail','xr-runtime'], workers:[{stream:'VSL',worker:'xr-simulator',cost:'CHEAP'},{stream:'RFL',worker:'perturbation-campaign',cost:'MODERATE'},{stream:'VSL',worker:'quest-qv',cost:'EXPENSIVE'}] },
];

export interface ChangeManifest { specimenSha:string; sourcePr?:number; changedCapabilities:string[]; newCapabilities?:string[]; risk?:'LOW'|'STANDARD'|'HIGH'; }
export interface SelectedWork { stream:Stream; worker:WorkerId; cost:CostClass; claims:string[]; reason:string; }

export function selectWork(m:ChangeManifest):SelectedWork[]{
  if(!/^[0-9a-f]{40}$/i.test(m.specimenSha)) throw new Error('specimenSha must be an exact 40-character Git SHA');
  const changed=new Set([...m.changedCapabilities,...(m.newCapabilities??[])]);
  const selected=new Map<string,SelectedWork>();
  const matched=new Set<string>();
  for(const dep of CLAIM_DEPENDENCIES){
    const hits=dep.capabilities.filter(c=>changed.has(c)); if(!hits.length)continue;
    hits.forEach(c=>matched.add(c));
    for(const w of dep.workers){const k=`${w.stream}:${w.worker}`;const prev=selected.get(k);if(prev){if(!prev.claims.includes(dep.claim))prev.claims.push(dep.claim);}else selected.set(k,{...w,claims:[dep.claim],reason:`capability impact: ${hits.join(', ')}`});}
  }
  const unknown=[...changed].filter(c=>!matched.has(c));
  if(unknown.length){selected.set('RFL:adversarial-review',{stream:'RFL',worker:'adversarial-review',cost:'MODERATE',claims:['unmapped-capability'],reason:`unmapped capability requires classification: ${unknown.join(', ')}`});}
  return [...selected.values()].sort((a,b)=>(a.stream+a.worker).localeCompare(b.stream+b.worker));
}

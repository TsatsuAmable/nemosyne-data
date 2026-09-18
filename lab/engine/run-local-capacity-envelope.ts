import fs from 'node:fs/promises';
import os from 'node:os';
import { performance } from 'node:perf_hooks';
import { generatePlantedThreeClusterDataset, perturbKnownStructure } from '../benchmarks/MonetaKnownStructureCampaign.ts';

interface Tier { id:string; pointsPerCluster:number; repetitions:number; }
const tiers:Tier[]=[
 {id:'smoke',pointsPerCluster:1000,repetitions:8},
 {id:'small',pointsPerCluster:10000,repetitions:12},
 {id:'medium',pointsPerCluster:50000,repetitions:16},
 {id:'large',pointsPerCluster:150000,repetitions:20},
];
const args=process.argv.slice(2);
const only=args.includes('--tier') ? args[args.indexOf('--tier')+1] : undefined;
const selected=only ? tiers.filter(t=>t.id===only) : tiers;
if(!selected.length) throw new Error('unknown capacity tier');
const results=[];
for(const tier of selected){
 const cpu0=process.cpuUsage(); const rss0=process.memoryUsage().rss; const t0=performance.now();
 const base=generatePlantedThreeClusterDataset(0x4d4f4e45,tier.pointsPerCluster,0.55);
 let checksum=0;
 for(let i=0;i<tier.repetitions;i++){
   const p=perturbKnownStructure(base,0x4d4f4e45 ^ Math.imul(i+1,0x9e3779b1),0.12);
   checksum += p[(i*7919)%p.length].x;
 }
 const wallMs=performance.now()-t0; const cpu=process.cpuUsage(cpu0); const rss1=process.memoryUsage().rss;
 results.push({tier:tier.id,points:base.length,repetitions:tier.repetitions,operations:base.length*tier.repetitions,wallMs,cpuUserMs:cpu.user/1000,cpuSystemMs:cpu.system/1000,rssStartBytes:rss0,rssEndBytes:rss1,rssDeltaBytes:rss1-rss0,throughputPointPerturbationsPerSecond:(base.length*tier.repetitions)/(wallMs/1000),checksum});
}
const report={schemaVersion:1,kind:'local-capacity-envelope',claimScope:'laboratory deterministic data-generation and perturbation throughput only; not Nemosyne analytical, XR, GPU, Quest, or architecture qualification',host:{platform:process.platform,arch:process.arch,node:process.version,cpuCount:os.cpus().length,totalMemoryBytes:os.totalmem()},createdAt:new Date().toISOString(),results};
await fs.mkdir('lab/xr-architecture/artifacts',{recursive:true});
await fs.writeFile('lab/xr-architecture/artifacts/local-capacity-envelope.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));

import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { selectWork, type ChangeManifest } from './CapabilityClaimGraph.ts';
import { FileCoordinationStore } from '../distributed/FileCoordinationStore.ts';
import { CoordinatorService } from '../distributed/CoordinatorService.ts';

const args=process.argv.slice(2),i=args.indexOf('--manifest');if(i<0||!args[i+1])throw new Error('usage: --manifest <change-manifest.json>');
const manifest=JSON.parse(await fs.readFile(args[i+1]!, 'utf8')) as ChangeManifest;
const file=process.env.NEMOSYNE_COORDINATION_FILE??'.lab-state/coordination.json';
const coordinator=new CoordinatorService(new FileCoordinationStore(file));
const selected=selectWork(manifest),createdAt=new Date().toISOString();
for(const w of selected){const stable=crypto.createHash('sha256').update([manifest.specimenSha,w.stream,w.worker,...w.claims.sort()].join(':')).digest('hex').slice(0,16);await coordinator.submitJob({jobId:`${w.stream.toLowerCase()}-${w.worker}-${stable}`,specimenSha:manifest.specimenSha,stream:w.stream,worker:w.worker,claims:w.claims,createdAt});}
console.log(JSON.stringify({specimenSha:manifest.specimenSha,submitted:selected.length,work:selected},null,2));

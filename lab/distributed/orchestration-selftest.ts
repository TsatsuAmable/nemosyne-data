import { strict as assert } from 'node:assert';
import fs from 'node:fs/promises';
import { FileCoordinationStore } from './FileCoordinationStore.ts';
import { CoordinatorService } from './CoordinatorService.ts';
const file='.orchestration-selftest.json';await fs.rm(file,{force:true});const c=new CoordinatorService(new FileCoordinationStore(file),1000);
await c.submitJob({jobId:'vsl-xr',specimenSha:'825da88d1529486c8e7891825b9faa1946412c21',stream:'VSL',worker:'xr-simulator',claims:['xr-lifecycle-correctness'],createdAt:new Date().toISOString()});
await c.submitJob({jobId:'rfl-known',specimenSha:'825da88d1529486c8e7891825b9faa1946412c21',stream:'RFL',worker:'known-structure',claims:['semantic-preservation'],createdAt:new Date().toISOString()});
await c.registerWorker({workerId:'vsl',profile:'vsl',capabilities:['xr-simulator'],registeredAt:new Date().toISOString()});await c.registerWorker({workerId:'rfl',profile:'rfl',capabilities:['known-structure'],registeredAt:new Date().toISOString()});
const [v,r]=await Promise.all([c.claim('vsl'),c.claim('rfl')]);assert.equal(v?.stream,'VSL');assert.equal(r?.stream,'RFL');assert.notEqual(v?.jobId,r?.jobId);await fs.rm(file,{force:true});console.log('parallel orchestration self-test: PASS');

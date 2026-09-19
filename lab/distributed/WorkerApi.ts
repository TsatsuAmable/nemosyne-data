import type{CoordinatorService}from'./CoordinatorService.ts';import type{WorkerRegistration}from'./WorkProtocol.ts';
export class WorkerApi{private coordinator:CoordinatorService;constructor(coordinator:CoordinatorService){this.coordinator=coordinator}
 register(body:WorkerRegistration){return this.coordinator.registerWorker(body)}
 claim(workerId:string){return this.coordinator.claim(workerId)}
 start(jobId:string,leaseToken:string){return this.coordinator.start(jobId,leaseToken)}
 heartbeat(jobId:string,leaseToken:string){return this.coordinator.heartbeat(jobId,leaseToken)}
 complete(jobId:string,leaseToken:string,disposition:string,evidenceRefs:string[]){return this.coordinator.complete(jobId,leaseToken,disposition,evidenceRefs)}
}

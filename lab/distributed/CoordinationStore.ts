import type{LabJob,WorkerRegistration}from'./WorkProtocol.ts';
export interface CoordinationState{version:1;jobs:LabJob[];workers:WorkerRegistration[];}
export interface CoordinationStore{load():Promise<CoordinationState>;save(state:CoordinationState):Promise<void>;}
export class MemoryCoordinationStore implements CoordinationStore{private state:CoordinationState;constructor(state:CoordinationState={version:1,jobs:[],workers:[]}){this.state=state}async load(){return structuredClone(this.state)}async save(s:CoordinationState){this.state=structuredClone(s)}}

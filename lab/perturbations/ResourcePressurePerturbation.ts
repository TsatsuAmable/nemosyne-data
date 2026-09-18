import type { NemosyneSpecimenAdapter } from '../protocols/NemosyneSpecimenProtocol.ts';
export interface ResourcePressureInput { iterations:number; maxLive:number; cleanupPerTick:number }
export async function runResourcePressurePerturbation(specimen:NemosyneSpecimenAdapter,input:ResourcePressureInput):Promise<unknown>{ if(!specimen.runResourcePressure) throw new Error('specimen does not support resource-pressure observations'); return specimen.runResourcePressure(input); }

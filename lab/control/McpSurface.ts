import{LAB_CONTROL_TOOLS,invoke,type LabControlTool}from'./LabControlApi.ts';
/** Vendor-neutral MCP-facing contract. Transport adapters must expose only these bounded operations by default. */
export const MCP_TOOL_DESCRIPTORS=LAB_CONTROL_TOOLS.map(name=>({name,readOnly:name!=='work.plan',description:name==='work.plan'?'Deterministically plan VSL/RFL work from an exact-SHA change manifest; does not execute work.':'Read laboratory capabilities or evidence state.'}));
export async function callMcpTool(name:string,args:Record<string,unknown>,cataloguePath:string){if(!LAB_CONTROL_TOOLS.includes(name as LabControlTool))throw new Error('unknown lab MCP tool');return invoke({tool:name as LabControlTool,arguments:args},{cataloguePath});}

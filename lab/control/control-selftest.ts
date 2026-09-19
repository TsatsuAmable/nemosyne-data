import{strict as assert}from'node:assert';import{callMcpTool,MCP_TOOL_DESCRIPTORS}from'./McpSurface.ts';
const cat='.missing-lab-catalogue.json';const d=await callMcpTool('lab.describe',{},cat) as any;assert(d.workers.length>=6);assert(d.principle.includes('native adjudicators'));
const p=await callMcpTool('work.plan',{manifest:{specimenSha:'825da88d1529486c8e7891825b9faa1946412c21',changedCapabilities:['semantic-detail']}},cat) as any[];assert(p.some(x=>x.stream==='RFL'));assert(MCP_TOOL_DESCRIPTORS.every(x=>x.name));
await assert.rejects(()=>callMcpTool('work.submit',{},cat));console.log('LLM control surface self-test: PASS');

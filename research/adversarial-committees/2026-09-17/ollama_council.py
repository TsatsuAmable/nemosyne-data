import json, pathlib, urllib.request, datetime
base=pathlib.Path(__file__).parent; runs=base/'runs'; runs.mkdir(exist_ok=True)
jobs=[('uxr34_glm','glm-5.3:cloud','UXR3_4_PROMPT.txt'),('uxr34_gemma','gemma4:31b-cloud','UXR3_4_PROMPT.txt'),('pt9_glmflash','glm-5.3-flash:cloud','PT9_PROMPT.txt'),('pt9_deepseek','deepseek-v4.1-flash:cloud','PT9_PROMPT.txt'),('uxr5_gemma','gemma4:31b-cloud','UXR5_PROMPT.txt'),('uxr5_deepseek','deepseek-v4.1-flash:cloud','UXR5_PROMPT.txt')]
def stamp(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
for jid,model,pfile in jobs:
 d=runs/jid; d.mkdir(exist_ok=True); status=d/'status.json'
 status.write_text(json.dumps({'state':'STARTED','model':model,'started':stamp()},indent=2))
 try:
  payload=json.dumps({'model':model,'prompt':(base/pfile).read_text(encoding='utf-8-sig'),'stream':False}).encode()
  req=urllib.request.Request('http://127.0.0.1:11434/api/generate',payload,{'Content-Type':'application/json'})
  with urllib.request.urlopen(req,timeout=900) as r: data=json.load(r)
  text=data.get('response',''); (d/'output.md').write_text(text,encoding='utf-8')
  status.write_text(json.dumps({'state':'COMPLETED','model':model,'completed':stamp(),'chars':len(text),'done':data.get('done')},indent=2))
 except Exception as e:
  status.write_text(json.dumps({'state':'FAILED','model':model,'failed':stamp(),'error':repr(e)},indent=2))
import argparse,json,pathlib,urllib.request,datetime
p=argparse.ArgumentParser(); p.add_argument('--model'); p.add_argument('--prompt-file'); p.add_argument('--output'); p.add_argument('--status'); a=p.parse_args()
out=pathlib.Path(a.output); status=pathlib.Path(a.status); prompt=pathlib.Path(a.prompt_file).read_text(encoding='utf-8-sig')
def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def save(state,**x): status.write_text(json.dumps({'state':state,'model':a.model,'heartbeat':now(),**x},indent=2))
payload=json.dumps({'model':a.model,'prompt':prompt,'stream':True}).encode(); req=urllib.request.Request('http://127.0.0.1:11434/api/generate',payload,{'Content-Type':'application/json'})
chunks=chars=0; save('STARTED',chunks=0,chars=0)
try:
 with urllib.request.urlopen(req,timeout=900) as r, out.open('w',encoding='utf-8') as f:
  for raw in r:
   obj=json.loads(raw); text=obj.get('response','')
   if text: f.write(text); f.flush(); chunks+=1; chars+=len(text); save('ACTIVE',chunks=chunks,chars=chars)
   if obj.get('done'): break
 save('COMPLETED',chunks=chunks,chars=chars)
except Exception as e:
 save('FAILED',chunks=chunks,chars=chars,error=repr(e)); raise
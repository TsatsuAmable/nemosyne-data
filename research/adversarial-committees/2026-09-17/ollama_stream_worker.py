import argparse,json,pathlib,subprocess,datetime
p=argparse.ArgumentParser(); p.add_argument('--model'); p.add_argument('--prompt'); p.add_argument('--output'); p.add_argument('--status'); p.add_argument('--command',nargs='+'); a=p.parse_args()
out=pathlib.Path(a.output); status=pathlib.Path(a.status)
def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def save(state,**x): status.write_text(json.dumps({'state':state,'model':a.model,'heartbeat':now(),**x},indent=2))
cmd=a.command or [r'C:\Users\stromae\AppData\Local\Programs\Ollama\ollama.exe','run',a.model,a.prompt,'--format','json']
save('STARTED',chunks=0,chars=0); chunks=chars=0
with out.open('w',encoding='utf-8') as f:
 proc=subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,encoding='utf-8')
 for line in proc.stdout:
  try: obj=json.loads(line)
  except json.JSONDecodeError: continue
  text=obj.get('response','')
  if text: f.write(text); f.flush(); chunks+=1; chars+=len(text); save('ACTIVE',chunks=chunks,chars=chars)
  if obj.get('done'): break
 rc=proc.wait(timeout=30)
 if rc: save('FAILED',chunks=chunks,chars=chars,error=proc.stderr.read()[-2000:]); raise SystemExit(rc)
save('COMPLETED',chunks=chunks,chars=chars)
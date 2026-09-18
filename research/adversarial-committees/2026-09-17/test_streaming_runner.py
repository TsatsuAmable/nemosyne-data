import json, pathlib, subprocess, sys, tempfile, time
root=pathlib.Path(__file__).parent
runner=root/'ollama_stream_worker.py'
with tempfile.TemporaryDirectory() as td:
 d=pathlib.Path(td); out=d/'out.md'; status=d/'status.json'
 fake=d/'fake.py'
 fake.write_text("import json,time\nfor x in ['alpha ','beta']:\n print(json.dumps({'response':x,'done':False}),flush=True);time.sleep(.05)\nprint(json.dumps({'response':'','done':True}),flush=True)\n")
 p=subprocess.run([sys.executable,str(runner),'--model','test','--prompt','x','--output',str(out),'--status',str(status),'--command',sys.executable,str(fake)],capture_output=True,text=True,timeout=5)
 assert p.returncode==0,p.stderr
 assert out.read_text()=='alpha beta'
 s=json.loads(status.read_text()); assert s['state']=='COMPLETED'; assert s['chunks']==2
 print('STREAM_TEST_OK')
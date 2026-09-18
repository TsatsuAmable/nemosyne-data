param([string]$Campaign='all')
$ErrorActionPreference='Stop'
$root=Join-Path $PSScriptRoot 'runs'
New-Item -ItemType Directory -Force $root | Out-Null
$jobs=@(
 @{id='uxr34_glm';model='glm-5.3:cloud';prompt='UXR3_4_PROMPT.txt'},
 @{id='uxr34_gemma';model='gemma4:31b-cloud';prompt='UXR3_4_PROMPT.txt'},
 @{id='pt9_glmflash';model='glm-5.3-flash:cloud';prompt='PT9_PROMPT.txt'},
 @{id='pt9_deepseek';model='deepseek-v4.1-flash:cloud';prompt='PT9_PROMPT.txt'},
 @{id='uxr5_gemma';model='gemma4:31b-cloud';prompt='UXR5_PROMPT.txt'},
 @{id='uxr5_deepseek';model='deepseek-v4.1-flash:cloud';prompt='UXR5_PROMPT.txt'}
)
foreach($j in $jobs){
 if($Campaign -ne 'all' -and $j.id -notlike "$Campaign*"){continue}
 $dir=Join-Path $root $j.id; New-Item -ItemType Directory -Force $dir|Out-Null
 $status=Join-Path $dir 'status.json'; $output=Join-Path $dir 'output.md'
 @{state='STARTED';model=$j.model;started=(Get-Date).ToString('o');heartbeat=(Get-Date).ToString('o')}|ConvertTo-Json|Set-Content $status
 $prompt=Get-Content (Join-Path $PSScriptRoot $j.prompt) -Raw
 try {
  $body=@{model=$j.model;prompt=$prompt;stream=$false;options=@{temperature=0.3}}|ConvertTo-Json -Depth 5 -Compress
  $r=Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/generate' -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 900
  $r.response | Set-Content $output
  @{state='COMPLETED';model=$j.model;completed=(Get-Date).ToString('o');chars=$r.response.Length;done=$r.done}|ConvertTo-Json|Set-Content $status
 } catch {
  @{state='FAILED';model=$j.model;failed=(Get-Date).ToString('o');error=$_.Exception.Message}|ConvertTo-Json|Set-Content $status
 }
}
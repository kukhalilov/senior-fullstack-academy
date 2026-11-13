import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const DEFAULT_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3-flash-preview', 'gemini-3.6-flash', 'gemini-3.8-flash'];
export const required = ['## Simple explanation', '## How it works', '## Examples', '## Tradeoffs and comparisons', '## Interview questions and answers', '## Exercises and solutions', '## Review questions', '## Sources and limitations'];
export function valid(text) { return typeof text === 'string' && text.length >= 1500 && required.every(h => text.includes(h)); }
export function outputPath(task) { return path.join('course', task.track, task.id + '.md'); }
export function draftPath(task) { return path.join('production', 'drafts', task.track, task.id + '.md'); }
export function choose(tasks, exists) { return tasks.find(t => !exists(t) && t.prerequisites.every(id => tasks.some(x => x.id === id && exists(x)))); }
export function retryDelay(header) { if (!header) return 0; const number=Number(header); if (Number.isFinite(number)) return Math.max(0,number*1000); const date=Date.parse(header); return Number.isFinite(date) ? Math.max(0,date-Date.now()) : 0; }
export function validateQueue(tasks) {
 const ids=new Set(); for(const t of tasks) { if(!/^[a-z0-9-]+$/.test(t.id) || !/^[a-z0-9-]+$/.test(t.track) || ids.has(t.id) || !Array.isArray(t.prerequisites)) throw new Error('Invalid or duplicate task: '+t.id); ids.add(t.id); }
 for(const t of tasks) for(const id of t.prerequisites) if(!ids.has(id) || id===t.id) throw new Error('Invalid prerequisite: '+id);
 const done=new Set(); while(true){ const ready=tasks.filter(t=>!done.has(t.id)&&t.prerequisites.every(id=>done.has(id))); if(!ready.length) break; ready.forEach(t=>done.add(t.id)); } if(done.size!==tasks.length) throw new Error('Curriculum dependency cycle');
}
function atomicWrite(filename, content) { fs.mkdirSync(path.dirname(filename),{recursive:true}); const tmp=filename+'.'+process.pid+'.tmp'; fs.writeFileSync(tmp,content,'utf8'); fs.renameSync(tmp,filename); }
function textFromResponse(data) { const c=data.candidates?.[0]; if(c?.finishReason !== 'STOP') throw new Error('Incomplete or blocked response: '+(c?.finishReason??'unknown')); const result=c.content?.parts?.filter(x=>!x.thought).map(x=>x.text??'').join(''); if(!result) throw new Error('Empty response'); return result; }
async function request(model,prompt,key) {
 const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.3,maxOutputTokens:16384}}),signal:AbortSignal.timeout(120000)});
 if(!response.ok){const err=new Error(`Gemini HTTP ${response.status}`);err.status=response.status;err.retryAfter=retryDelay(response.headers.get('retry-after'));throw err;} return textFromResponse(await response.json());
}
export async function produce(tasks, options) {
 const {key,models,deadline,limit,call=request, pause=sleep}=options; let completed=0, calls=0; const disabled=new Set(); let failures=0;
 while(completed<limit && Date.now()<deadline-125000) {
  const task=choose(tasks,t=>fs.existsSync(outputPath(t))); if(!task) break;
  let draft=fs.existsSync(draftPath(task)) ? fs.readFileSync(draftPath(task),'utf8') : null; let finished=false;
  const prompt=`Produce an independently readable lesson for ${task.title}, track ${task.track}, phase ${task.phase}. Use clear English for non-native speakers and explain technical terms. Cover practical implementation and tradeoffs, interview questions with complete answers, exercises with complete solutions. For DSA include problems, progressive hints, working C# solutions, examples, edge cases, and complexity. Use exactly these headings: ${required.join('; ')}. Identify uncertainty; do not invent source links or claim external verification. Return Markdown only.`;
  for(const model of models) {
   if(disabled.has(model) || Date.now()>=deadline-125000) continue;
   try {
    if(!draft){calls++;draft=await call(model,prompt,key);if(!valid(draft)){draft=null;throw new Error('Draft failed structural validation');}atomicWrite(draftPath(task),draft);}
    calls++; const review=await call(model,`Review and correct this draft for errors, omissions, clarity, misleading explanations, and missing solutions. Return the entire revised Markdown with the required headings intact. Do not claim independent source verification.\n\n${draft}`,key);
    if(!valid(review)) throw new Error('Review failed structural validation');
    const content=`<!-- Generated with ${model}; automated review only; source and code verification pending. -->\n\n`+review.trim()+'\n'; atomicWrite(outputPath(task),content); fs.rmSync(draftPath(task),{force:true});
    console.log(`Completed ${task.id} with ${model}; independent verification pending`); completed++;finished=true;failures=0;break;
   } catch(e) {
    console.error(`${task.id} / ${model}: ${e.message}`); failures++;
    if([400,401,403].includes(e.status)) throw e;
    if(e.status===429 || e.status===404) disabled.add(model);
    else if(e.status>=500 && e.status<=599) await pause(Math.min(10000,1000*2**Math.min(failures,3)));
    else disabled.add(model);
    if(e.status===429 && e.retryAfter>0 && e.retryAfter<=30000) {await pause(e.retryAfter);disabled.delete(model);}
   }
  }
  if(!finished) throw new Error('No eligible model could complete the task; checkpoint retained');
 }
 return {completed,calls};
}
function repairLegacyHeaders(tasks) {
 for (const task of tasks) { const f=outputPath(task); if (!fs.existsSync(f)) continue; const s=fs.readFileSync(f,'utf8'); const fixed=s.replace(/^(<!-- Generated with [^\n]*? -->)\\n\\n/, '$1\n\n').replace(/\\n$/, '\n'); if (fixed!==s) atomicWrite(f,fixed); }
}
async function main() {
 const key=process.env.GEMINI_API_KEY, models=(process.env.GEMINI_MODELS || DEFAULT_MODELS.join(',')).split(',').map(x=>x.trim()).filter(Boolean);
 if(!key) throw new Error('Set GEMINI_API_KEY as a GitHub Actions secret');
 const tasks=JSON.parse(fs.readFileSync('curriculum/queue.json','utf8')).tasks;validateQueue(tasks);repairLegacyHeaders(tasks);
 const limit=Number(process.env.MAX_TASKS??40),minutes=Number(process.env.RUN_MINUTES??12);
 if(!Number.isInteger(limit)||limit<1||!Number.isFinite(minutes)||minutes<3) throw new Error('Invalid run limits');
 console.log(JSON.stringify(await produce(tasks,{key,models,deadline:Date.now()+minutes*60000,limit})));
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) main().catch(e=>{console.error(e.message);process.exitCode=1});

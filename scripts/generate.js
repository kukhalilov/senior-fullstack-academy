import fs from 'node:fs';
import path from 'node:path';

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const template = readJson('curriculum/prompt-template.json');
const catalog = readJson('curriculum/catalog.json');
const queue = readJson('curriculum/queue.json');
const requestedUnits = Number(process.env.UNITS_PER_RUN ?? 100);
const unitsPerRun = Number.isInteger(requestedUnits) && requestedUnits > 0 ? Math.min(requestedUnits, 100) : 100;
const requestedCalls = Number(process.env.MAX_API_CALLS_PER_RUN ?? 100);
const maxApiCalls = Number.isInteger(requestedCalls) && requestedCalls > 0 ? Math.min(requestedCalls, 100) : 100;
const dryRun = process.argv.includes('--dry-run');
const model = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite';
const outputRoot = 'course/drafts';
const ready = new Map();
for (const track of catalog.tracks) {
  for (const file of fs.readdirSync(track.manifestDirectory).filter(name => name.endsWith('.json'))) {
    const filePath = path.join(track.manifestDirectory, file);
    const manifest = readJson(filePath);
    if (manifest.inventoryComplete && (manifest.generationAllowed === true || manifest.generationAllowedPhases?.length) && manifest.concepts.length && manifest.sourceSnapshot?.urls?.length && manifest.inventory.length && manifest.inventory.every(group => group.items.length)) ready.set(manifest.id, {manifest,filePath});
  }
}
const isReadyTask=task=>ready.has(task.module) && (ready.get(task.module).manifest.generationAllowed===true || ready.get(task.module).manifest.generationAllowedPhases?.includes(task.phase)) && /^t\d{2}-\d{3}$/.test(task.module) && /^[a-z0-9-]+$/.test(task.inventoryGroup??'overview');
const completed=new Set(fs.existsSync(outputRoot)?fs.readdirSync(outputRoot,{recursive:true}).filter(file=>file.endsWith('.md')):[]);
const totalPending=queue.tasks.filter(task=>isReadyTask(task)&&!completed.has(path.join(task.module,`${task.id}.md`))).length;
const pending=queue.tasks.filter(task=>isReadyTask(task)&&!completed.has(path.join(task.module,`${task.id}.md`))).slice(0,unitsPerRun);
if(process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT,`pending=${pending.length}\n`);
if(dryRun){console.log(`${totalPending} eligible units pending; ${pending.length} scheduled for this run.`);process.exit(0);}
if (!pending.length) { console.log('No eligible lesson units are pending.'); process.exit(0); }
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('GEMINI_API_KEY is required');

function promptFor(task, manifest) {
  const phase=task.phase==='reference'?'reference':task.phase;
  const spec=template.lessonTypes[phase];
  if(!spec) throw new Error(`No lesson template for ${phase}`);
  const group=phase==='reference'?manifest.inventory.find(x=>x.id===task.inventoryGroup):undefined;
  if(phase==='reference'&&!group) throw new Error(`Missing inventory group ${task.inventoryGroup}`);
  const data={id:manifest.id,title:manifest.title,edition:manifest.sourceSnapshot.edition,concepts:manifest.concepts,scopeExclusions:manifest.scopeExclusions,sourceSnapshot:manifest.sourceSnapshot,comparisons:manifest.comparisons,comparisonSources:manifest.comparisonSources??[],versionNotes:manifest.versionNotes,...(group?{inventoryGroup:group}:{inventory:manifest.inventory})};
  return ['Write one self-contained Markdown lesson for a self-study learner. Output only Markdown.',`LESSON TYPE: ${phase}\nGOAL: ${spec.goal}\nREQUIRED SECTIONS: ${spec.requiredSections.join('; ')}\nUse each required section name verbatim as a Markdown heading.`,spec.instruction??'',JSON.stringify(template.pedagogy),JSON.stringify(template.closedWorld),'FROZEN TOPIC DATA:',JSON.stringify(data,null,2),'Mark this as an automatically generated draft.'].filter(Boolean).join('\n\n');
}
function checkLesson(task, manifest, text) {
  const phase=task.phase==='reference'?'reference':task.phase;
  const required=template.lessonTypes[phase].requiredSections;
  const headings=text.split(/\r?\n/).filter(line=>/^#{2,3}\s+/.test(line)).map(line=>line.replace(/^#{2,3}\s+/, '').trim().toLowerCase());
  const missing=required.filter(section=>!headings.includes(section.toLowerCase()));
  if(missing.length) throw new Error(`${task.id}: missing section headings: ${missing.join(', ')}`);
  if(phase==='reference') {
    const group=manifest.inventory.find(item=>item.id===task.inventoryGroup);
    const absent=group.items.filter(item=>!text.includes(item));
    if(absent.length) throw new Error(`${task.id}: omitted supplied names: ${absent.join(', ')}`);
  }
  const allowedSources=new Set([...manifest.sourceSnapshot.urls,...(manifest.comparisonSources??[]),...manifest.versionNotes.flatMap(note=>note.sourceUrls??[])]);
  const cited=[...text.matchAll(/\]\((https?:\/\/[^)\s]+)\)|<(https?:\/\/[^>]+)>/g)].map(match=>(match[1]??match[2]).replace(/[.,;]+$/,''));
  if(!cited.some(source=>allowedSources.has(source))) throw new Error(`${task.id}: no supplied source URL was cited`);
  const unknown=cited.filter(source=>!allowedSources.has(source));
  if(unknown.length) throw new Error(`${task.id}: unsupported source URLs: ${unknown.join(', ')}`);
  const targetRoot=path.resolve(outputRoot);
  const candidate=path.resolve(targetRoot,task.module,`${task.id}.md`);
  if(!candidate.startsWith(`${targetRoot}${path.sep}`)) throw new Error(`${task.id}: output path escapes drafts directory`);
  return ['<!-- GENERATED DRAFT: automated checks passed; factual verification is not implied. -->','',`# ${task.title}`,'',text.trim(),''].join('\n');
}
let lastRequestAt=0;
let apiCalls=0;
class RequestBudgetExhausted extends Error {}
async function request(prompt) {
  const wait=Math.max(0,4100-(Date.now()-lastRequestAt));
  if(wait) await new Promise(resolve=>setTimeout(resolve,wait));
  lastRequestAt=Date.now();
  let delay=1500;
  for(let attempt=0;attempt<6;attempt++) {
    if(apiCalls>=maxApiCalls) throw new RequestBudgetExhausted(`Per-run API request budget reached (${maxApiCalls})`);
    apiCalls++;
    const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.25,maxOutputTokens:8192}})});
    const body=await response.json().catch(()=>({}));
    if(response.ok) {
      const text=body.candidates?.[0]?.content?.parts?.map(p=>p.text??'').join('');
      if(text) return text;
      throw new Error('Gemini returned no text content');
    }
    if(response.status!==429 && response.status<500) throw new Error(`Gemini HTTP ${response.status}: ${JSON.stringify(body).slice(0,1200)}`);
    if(attempt===5) throw new Error(`Gemini retry limit reached: ${JSON.stringify(body).slice(0,1200)}`);
    await new Promise(resolve=>setTimeout(resolve,delay)); delay=Math.min(delay*2,60000);
  }
}
let failures=0;
let completedUnits=0;
for(const task of pending) {
  try {
    const {manifest}=ready.get(task.module);
    let result=await request(promptFor(task,manifest));
    let lesson;
    for(let attempt=0;attempt<3;attempt++){
      try{lesson=checkLesson(task,manifest,result);break;}
      catch(error){if(attempt===2)throw error;result=await request(`${promptFor(task,manifest)}\n\nREVISION REQUIRED: Rewrite the entire lesson to fix these deterministic errors: ${error.message}. Use exact required headings and cite only supplied source URLs.`);}
    }
    const target=path.resolve(outputRoot,task.module,`${task.id}.md`);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.writeFileSync(target,lesson,'utf8');
    completedUnits++;
    console.log(`Draft generated: ${target}`);
  } catch(error) {
    if(error instanceof RequestBudgetExhausted) { console.log(`${error.message}; remaining pending lessons will continue on the next scheduled run.`); break; }
    failures++; console.error(`Failed ${task.id}: ${error.message}`);
  }
}
console.log(`API request budget: ${apiCalls}/${maxApiCalls}; lessons completed: ${completedUnits}/${pending.length} selected.`);
if(failures){console.error(`${failures} lesson units failed; successful drafts remain checkpointed on disk.`);process.exitCode=1;}

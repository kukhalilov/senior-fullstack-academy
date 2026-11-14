import fs from 'node:fs';
import path from 'node:path';
const template=JSON.parse(fs.readFileSync('curriculum/prompt-template.json','utf8'));
const catalog=JSON.parse(fs.readFileSync('curriculum/catalog.json','utf8'));
const queue=JSON.parse(fs.readFileSync('curriculum/queue.json','utf8'));
const unit=process.argv[2];
const task=queue.tasks.find(x=>x.id===unit);
if(!task) throw new Error(`Unknown queue unit: ${unit}`);
const manifest=JSON.parse(fs.readFileSync(task.manifest,'utf8'));
if(manifest.inventoryComplete!==true || !(manifest.generationAllowed===true || manifest.generationAllowedPhases?.includes(task.phase)) || !manifest.sourceSnapshot?.urls?.length || !manifest.concepts?.length) throw new Error(`${manifest.id} has no frozen, source-backed scope for ${task.phase}`);
const phase=task.phase==='reference'?'reference':task.phase;
const instruction=template.lessonTypes[phase];
if(!instruction) throw new Error(`No lesson template for ${phase}`);
const inventoryGroup=phase==='reference'?manifest.inventory.find(x=>x.id===task.inventoryGroup):null;
if(phase==='reference' && !inventoryGroup) throw new Error(`Missing inventory group ${task.inventoryGroup}`);
const compact={id:manifest.id,title:manifest.title,edition:manifest.sourceSnapshot.edition,concepts:manifest.concepts,scopeExclusions:manifest.scopeExclusions,sourceSnapshot:manifest.sourceSnapshot,comparisons:manifest.comparisons,comparisonSources:manifest.comparisonSources??[],versionNotes:manifest.versionNotes,...(inventoryGroup?{inventoryGroup}:{inventory:manifest.inventory})};
const prompt=[
  'Write one self-contained Markdown lesson for a self-study learner. Output only the lesson, without preface or code fences around the entire document.',
  `LESSON TYPE: ${phase}\nGOAL: ${instruction.goal}\nREQUIRED SECTIONS: ${instruction.requiredSections.join('; ')}`,
  instruction.instruction??'',
  JSON.stringify(template.pedagogy,null,2),
  JSON.stringify(template.closedWorld,null,2),
  'FROZEN TOPIC DATA (use only this scope; do not add a topic, API, method, property, version, or comparison):',
  JSON.stringify(compact,null,2),
  'Mark this as an automatically generated draft.'
].filter(Boolean).join('\n\n');
process.stdout.write(prompt);

import {modelRpdLimits} from './model-usage.js';

export function mergeModelUsage(base, ours, theirs) {
  const dayPacific=[base.dayPacific,ours.dayPacific,theirs.dayPacific].filter(Boolean).sort().at(-1);
  const mainIsCurrent=theirs.dayPacific===dayPacific;
  const runIsCurrent=ours.dayPacific===dayPacific;
  const current=[...(runIsCurrent?[ours]:[]),...(mainIsCurrent?[theirs]:[])];
  const modelNames=new Set(current.flatMap(record=>Object.keys(record.requests??{})));
  const requests={};
  for(const model of modelNames){
    const baseline=base.dayPacific===dayPacific?(base.requests?.[model]??0):0;
    const left=runIsCurrent?(ours.requests?.[model]??0):0;
    const right=mainIsCurrent?(theirs.requests?.[model]??0):0;
    const limit=modelRpdLimits[model];
    requests[model]=Math.max(0,limit?Math.min(limit,left+(mainIsCurrent?Math.max(0,right-baseline):0)):left+(mainIsCurrent?Math.max(0,right-baseline):0));
  }
  const unavailableModels=[...new Set(current.flatMap(record=>record.unavailableModels??[]))].sort();
  return {schemaVersion:Math.max(base.schemaVersion??1,ours.schemaVersion??1,theirs.schemaVersion??1),dayPacific,requests,unavailableModels};
}

if(process.argv[1]?.endsWith('merge-model-usage.js')){
  const fs=await import('node:fs');
  const [basePath,oursPath,theirsPath]=process.argv.slice(2);
  if(!basePath||!oursPath||!theirsPath) throw new Error('Usage: node merge-model-usage.js BASE_JSON OURS_JSON THEIRS_JSON');
  const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
  process.stdout.write(JSON.stringify(mergeModelUsage(read(basePath),read(oursPath),read(theirsPath)),null,2)+'\n');
}

import fs from 'node:fs';
import path from 'node:path';

export const modelRpdLimits = Object.freeze({
  'gemini-3.5-flash-lite':500,
  'gemini-3.1-flash-lite':500,
  'gemini-3.8-flash':20,
  'gemini-3.6-flash':20,
  'gemini-3-flash-preview':20,
  'gemini-4-hydrogen':20,
});

export function pacificUsageDay(date=new Date()) {
  const fields=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).filter(part=>part.type!=='literal').map(part=>[part.type,part.value]));
  return `${fields.year}-${fields.month}-${fields.day}`;
}

export function loadModelUsage(filePath,day=pacificUsageDay()) {
  if(!fs.existsSync(filePath))return {schemaVersion:1,dayPacific:day,requests:{},unavailableModels:[]};
  const saved=JSON.parse(fs.readFileSync(filePath,'utf8'));
  if(saved.schemaVersion!==1||saved.dayPacific!==day||!saved.requests||typeof saved.requests!=='object'||Array.isArray(saved.requests))return {schemaVersion:1,dayPacific:day,requests:{},unavailableModels:[]};
  const requests={};
  for(const [model,count] of Object.entries(saved.requests))if(Number.isInteger(count)&&count>=0)requests[model]=Math.min(count,modelRpdLimits[model]??count);
  const unavailableModels=Array.isArray(saved.unavailableModels)?[...new Set(saved.unavailableModels.filter(model=>typeof model==='string'))]:[];
  return {schemaVersion:1,dayPacific:day,requests,unavailableModels};
}

export function recordModelSuccess(usage,model) {
  const limit=modelRpdLimits[model];
  usage.requests[model]=Math.min(limit??Number.MAX_SAFE_INTEGER,(usage.requests[model]??0)+1);
}

export function markDailyQuotaReached(usage,model) {
  const limit=modelRpdLimits[model];
  if(limit)usage.requests[model]=limit;
}

export function markModelUnavailable(usage,model) {
  usage.unavailableModels??=[];
  if(!usage.unavailableModels.includes(model))usage.unavailableModels.push(model);
}

export function saveModelUsage(filePath,usage) {
  fs.mkdirSync(path.dirname(filePath),{recursive:true});
  fs.writeFileSync(filePath,`${JSON.stringify(usage,null,2)}\n`,'utf8');
}

export function remainingDailyCalls(usage,models) {
  return models.reduce((total,model)=>{
    const limit=modelRpdLimits[model];
    if(usage.unavailableModels?.includes(model))return total;
    return total+(limit?Math.max(0,limit-(usage.requests[model]??0)):0);
  },0);
}

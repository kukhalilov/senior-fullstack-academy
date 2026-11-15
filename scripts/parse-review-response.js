export function parseReviewResponse(raw) {
  const normalized=raw.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  const candidates=[normalized];
  const firstObject=normalized.indexOf('{');
  const lastObject=normalized.lastIndexOf('}');
  if(firstObject>=0&&lastObject>firstObject)candidates.push(normalized.slice(firstObject,lastObject+1));
  let lastError;
  for(const candidate of candidates){
    try{
      const value=JSON.parse(candidate);
      if(!value||!['pass','revise'].includes(value.verdict)||!Array.isArray(value.issues)||!value.issues.every(issue=>typeof issue==='string'))throw new Error('Review response must contain verdict (pass/revise) and a string issues array');
      if(value.verdict==='pass'&&value.issues.length)throw new Error('A passing review must have an empty issues array');
      return value;
    }catch(error){lastError=error;}
  }
  throw new Error(`Gemini returned invalid review JSON: ${lastError?.message??'no JSON object found'}`);
}

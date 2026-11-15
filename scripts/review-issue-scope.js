export function applicableReviewIssues(phase, issues) {
  if(phase==='reference') return issues;
  const outOfScopeInventoryOmission=/\b(?:omits?|omitted|missing|fails? to include|does not include|lacks?)\b.{0,120}\binventory\b/i;
  return issues.filter(issue=>!outOfScopeInventoryOmission.test(issue));
}

const headingAliases = new Map([
  ['Problem statement', ['Problem', 'Problem description']],
  ['Input constraints', ['Constraints', 'Input and constraints']],
  ['Examples with expected output', ['Examples', 'Examples and outputs']],
  ['Clarifying assumptions', ['Assumptions', 'Clarifications']],
  ['Complete C# solution', ['Solution', 'Complete solution', 'C# solution', 'Solution in C#', 'C# implementation']],
  ['Correctness argument', ['Correctness proof', 'Proof of correctness']],
  ['Step-by-step dry run', ['Dry run', 'Walkthrough']],
  ['Time complexity', ['Time complexity analysis']],
  ['Space complexity', ['Space complexity analysis']],
  ['Edge-case tests', ['Edge cases', 'Edge-case testing']],
  ['Reflection questions', ['Reflection']],
]);

export function normalizeDsaOutput(markdown, assignedTitle) {
  const lines=markdown.split(/\r?\n/);
  const titles=lines.map(line=>line.match(/^(#{1,6})\s+(.+?)\s*$/));
  const present=new Set(titles.filter(Boolean).map(match=>match[2].toLowerCase()));
  for(const [canonical,aliases] of headingAliases){
    if(present.has(canonical.toLowerCase())) continue;
    const candidates=[];
    for(let i=0;i<titles.length;i++) if(titles[i]&&aliases.some(alias=>titles[i][2].toLowerCase()===alias.toLowerCase())) candidates.push(i);
    if(candidates.length===1){
      const i=candidates[0];
      lines[i]=`${titles[i][1]} ${canonical}`;
      present.add(canonical.toLowerCase());
    }
  }
  markdown=lines.join('\n');
  const tagged=[...markdown.matchAll(/^```csharp\s+dsa-solution\s*$/gim)];
  const plain=[...markdown.matchAll(/^```(?:csharp|cs)\s*$/gim)];
  if(tagged.length===0&&plain.length===1){
    const index=plain[0].index;
    markdown=markdown.slice(0,index)+'```csharp dsa-solution'+markdown.slice(index+plain[0][0].length);
  }
  if(assignedTitle&&!markdown.includes(assignedTitle)){
    const firstHeading=/^#{1,6}\s+[^\r\n]+\r?\n/m.exec(markdown);
    const label=`\n\n**Assigned problem: ${assignedTitle}**`;
    markdown=firstHeading
      ? markdown.slice(0,firstHeading.index+firstHeading[0].length)+label+markdown.slice(firstHeading.index+firstHeading[0].length)
      : `**Assigned problem: ${assignedTitle}**\n\n${markdown}`;
  }
  return markdown;
}

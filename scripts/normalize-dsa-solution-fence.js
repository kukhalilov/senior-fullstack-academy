const dsaFence=/^```csharp\s+dsa-solution\s*$/gim;
const plainCsharpFence=/^```(?:csharp|cs)\s*$/gim;
export function normalizeDsaSolutionFence(markdown) {
  if ([...markdown.matchAll(dsaFence)].length === 1) return markdown;
  const plain=[...markdown.matchAll(plainCsharpFence)];
  if ([...markdown.matchAll(dsaFence)].length === 0 && plain.length === 1) {
    const index=plain[0].index;
    return markdown.slice(0,index)+'```csharp dsa-solution'+markdown.slice(index+plain[0][0].length);
  }
  return markdown;
}

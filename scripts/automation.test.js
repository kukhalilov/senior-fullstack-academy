import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('curriculum updates start automatically without exceeding the reserved Gemini request budget', () => {
  const workflow = fs.readFileSync('.github/workflows/generate.yml', 'utf8');
  assert.match(workflow, /push:\s+branches: \[main\]/);
  assert.match(workflow, /curriculum\/manifests\/\*\*/);
  assert.match(workflow, /UNITS_PER_RUN: '4'/);
  assert.match(workflow, /MAX_API_CALLS_PER_RUN: '8'/);
  assert.match(workflow, /UNITS_PER_RUN: '80'/);
  assert.match(workflow, /MAX_API_CALLS_PER_RUN: '160'/);
  assert.equal((6 * 160 + 8) / 2, 484);
  assert.ok(484 < 500);
});

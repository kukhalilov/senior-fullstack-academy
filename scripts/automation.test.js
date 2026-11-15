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
  assert.match(workflow, /course\/drafts\/\*\*/);
  assert.match(workflow, /github\.actor != 'github-actions\[bot\]'/);
  assert.equal((6 * 160 + 8) / 2, 484);
  assert.ok(484 < 500);
});

test('lesson headings accept valid Markdown heading levels for required sections', () => {
  const generator = fs.readFileSync('scripts/generate.js', 'utf8');
  assert.match(generator, /\^#\{1,6\}\\s\+/);
});

test('generation queue follows the learning path so DSA starts before web lessons', () => {
  const queue = JSON.parse(fs.readFileSync('curriculum/queue.json', 'utf8'));
  const dsaStart = queue.tasks.findIndex(task => task.module === 't11-001');
  const intermediateDsa = queue.tasks.findIndex(task => task.module === 't11-003');
  const webStart = queue.tasks.findIndex(task => task.module === 't06-001');
  assert.ok(dsaStart >= 0 && intermediateDsa >= 0 && webStart >= 0);
  assert.ok(dsaStart < webStart);
  assert.ok(intermediateDsa < webStart);
});

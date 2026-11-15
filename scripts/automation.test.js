import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('curriculum updates start automatically without exceeding the reserved Gemini request budget', () => {
  const workflow = fs.readFileSync('.github/workflows/generate.yml', 'utf8');
  assert.match(workflow, /push:\s+branches: \[main\]/);
  assert.match(workflow, /curriculum\/manifests\/\*\*/);
  assert.match(workflow, /UNITS_PER_RUN: '1'/);
  assert.match(workflow, /MAX_API_CALLS_PER_RUN: '12'/);
  assert.match(workflow, /UNITS_PER_RUN: '80'/);
  assert.match(workflow, /MAX_API_CALLS_PER_RUN: '160'/);
  assert.match(workflow, /course\/drafts\/\*\*/);
  assert.match(workflow, /github\.actor != 'github-actions\[bot\]'/);
  const maximumScheduledAndPushRequests = 6 * 160 + 12;
  assert.equal(maximumScheduledAndPushRequests, 972);
  assert.ok(maximumScheduledAndPushRequests <= 1000, 'scheduled and single push batch stay below the two Flash-Lite models\' combined capacity');
});

test('lesson headings accept valid Markdown heading levels for required sections', () => {
  const generator = fs.readFileSync('scripts/generate.js', 'utf8');
  assert.match(generator, /\^#\{1,6\}\\s\+/);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('../core.js');

test('normaliseFileList removes empty names', () => {
  const result = core.normaliseFileList([
    { name: 'a.pdf', size: 100 },
    { name: '', size: 50 },
    { name: '  ', size: 30 },
    { name: 'b.pdf', size: 200 }
  ]);
  assert.equal(result.length, 2);
  assert.equal(result[0].name, 'a.pdf');
  assert.equal(result[1].name, 'b.pdf');
});

test('normaliseFileList makes duplicate names unique', () => {
  const result = core.normaliseFileList([
    { name: 'doc.pdf', size: 100 },
    { name: 'doc.pdf', size: 200 },
    { name: 'doc.pdf', size: 300 }
  ]);
  assert.equal(result.length, 3);
  assert.equal(result[0].name, 'doc.pdf');
  assert.equal(result[1].name, 'doc (2).pdf');
  assert.equal(result[2].name, 'doc (3).pdf');
});

test('planMerge returns indices for valid input', () => {
  const result = core.planMerge([{ name: 'a.pdf' }, { name: 'b.pdf' }]);
  assert.equal(result.ok, true);
  assert.deepEqual(result.indices, [0, 1]);
});

test('planMerge returns error for empty input', () => {
  const result = core.planMerge([]);
  assert.equal(result.ok, false);
  assert.equal(result.error, 'No files to merge');
});

test('planSplit returns outputs for valid ranges', () => {
  const result = core.planSplit({ name: 'report.pdf', pageCount: 10 }, ['1-3', '5', '8-10']);
  assert.equal(result.ok, true);
  assert.equal(result.outputs.length, 3);
  assert.equal(result.outputs[0].name, 'report-1-3.pdf');
  assert.equal(result.outputs[1].name, 'report-5.pdf');
  assert.equal(result.outputs[2].name, 'report-8-10.pdf');
});

test('planSplit returns error for empty ranges', () => {
  const result = core.planSplit({ name: 'report.pdf', pageCount: 10 }, []);
  assert.equal(result.ok, false);
  assert.equal(result.error, 'No page ranges provided');
});

test('outputNameFor returns safe filename', () => {
  const result = core.outputNameFor('my doc', 0, '1-3');
  assert.equal(result, 'my_doc-1-3.pdf');
});

test('outputNameFor handles empty base', () => {
  const result = core.outputNameFor('', 2);
  assert.equal(result, 'document-3.pdf');
});

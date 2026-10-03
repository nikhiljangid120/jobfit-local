import test from 'node:test';
import assert from 'node:assert/strict';
import { blendedScore, dotProduct, extractSkills, recommendations, skillComparison } from '../src/scoring.js';

test('extractSkills normalizes text and returns known skills', () => {
  assert.deepEqual(extractSkills('Built React apps with TypeScript and PostgreSQL.'), ['typescript', 'react', 'postgresql']);
});

test('skillComparison separates matched and missing requested skills', () => {
  const result = skillComparison('React, Python, Git', 'Need React, TypeScript, Git and Docker');
  assert.deepEqual(result.matched, ['react', 'git']);
  assert.deepEqual(result.missing, ['typescript', 'docker']);
});

test('dotProduct calculates normalized-vector similarity', () => {
  assert.equal(dotProduct([1, 0, 0], [0.5, 0.5, 0]), 0.5);
  assert.throws(() => dotProduct([1], [1, 2]), /equal non-zero lengths/);
});

test('blendedScore combines semantic similarity and skill coverage', () => {
  assert.equal(blendedScore(0.75, 3, 4), 75);
  assert.equal(blendedScore(2, 4, 4), 100);
});

test('recommendations stay honest about missing skills', () => {
  const items = recommendations(62, ['docker', 'aws']);
  assert.match(items[0], /never add skills you cannot defend/);
  assert.equal(items.length, 3);
});

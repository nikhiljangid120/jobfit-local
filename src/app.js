import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2';
import { blendedScore, dotProduct, recommendations, skillComparison } from './scoring.js';

env.allowLocalModels = false;
const MODEL = 'Xenova/all-MiniLM-L6-v2';
let extractorPromise;

const $ = (id) => document.getElementById(id);
const resume = $('resume');
const job = $('job');
const status = $('status');
const analyzeButton = $('analyzeButton');

function wordCount(value) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function updateCounts() {
  $('resumeCount').textContent = `${wordCount(resume.value)} words`;
  $('jobCount').textContent = `${wordCount(job.value)} words`;
}

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline('feature-extraction', MODEL, {
      dtype: 'q8',
      progress_callback: (progress) => {
        if (progress.status === 'progress') {
          status.textContent = `Loading open model… ${Math.round(progress.progress || 0)}%`;
        }
      },
    });
  }
  return extractorPromise;
}

async function embed(text, extractor) {
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

function addChips(container, values, emptyText) {
  container.replaceChildren();
  const items = values.length ? values : [emptyText];
  for (const value of items) {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = value;
    container.append(chip);
  }
}

function renderResults(score, comparison) {
  $('score').textContent = score;
  $('scoreSummary').textContent = score >= 80
    ? 'Strong alignment. Tailor the opening summary and apply with confidence.'
    : score >= 60
      ? 'Promising fit. Close the clearest evidence gaps before applying.'
      : 'A stretch role today. Use the gaps below to decide whether to tailor, learn, or skip.';
  addChips($('matchedSkills'), comparison.matched, 'No explicit skill overlap detected');
  addChips($('missingSkills'), comparison.missing, 'No obvious named skill gaps');
  const list = $('recommendations');
  list.replaceChildren();
  for (const text of recommendations(score, comparison.missing)) {
    const item = document.createElement('li');
    item.textContent = text;
    list.append(item);
  }
  const ring = $('scoreRing');
  ring.style.borderColor = `color-mix(in srgb, var(--blue) ${Math.max(20, score)}%, var(--line))`;
  $('results').hidden = false;
  $('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function analyze() {
  if (wordCount(resume.value) < 20 || wordCount(job.value) < 20) {
    status.textContent = 'Please add at least 20 words to both fields for a meaningful comparison.';
    return;
  }
  analyzeButton.disabled = true;
  status.textContent = 'Preparing local AI…';
  try {
    const extractor = await getExtractor();
    status.textContent = 'Comparing meaning locally…';
    const [resumeVector, jobVector] = await Promise.all([
      embed(resume.value, extractor),
      embed(job.value, extractor),
    ]);
    const comparison = skillComparison(resume.value, job.value);
    const score = blendedScore(dotProduct(resumeVector, jobVector), comparison.matched.length, comparison.requested.length);
    renderResults(score, comparison);
    status.textContent = 'Analysis complete. Your text stayed in this browser.';
  } catch (error) {
    console.error(error);
    status.textContent = 'The model could not load. Check your connection and try again; no text was uploaded.';
  } finally {
    analyzeButton.disabled = false;
  }
}

$('sampleButton').addEventListener('click', () => {
  resume.value = `Full-stack software engineer with experience building React and TypeScript interfaces, Node.js REST APIs, PostgreSQL databases, and Python automation. Shipped Docker-based services, wrote Jest tests, used Git and GitHub Actions for CI/CD, and improved page performance by 35%. Strong communication and data structures fundamentals.`;
  job.value = `We are looking for a software engineer to build reliable web products using React, TypeScript, Node.js, PostgreSQL, and AWS. You will design REST APIs, write automated testing with Jest, work with Docker and Kubernetes, and collaborate in an agile team. Experience with system design, Redis, and CI/CD is preferred.`;
  updateCounts();
  $('matcher').scrollIntoView({ behavior: 'smooth' });
});
resume.addEventListener('input', updateCounts);
job.addEventListener('input', updateCounts);
analyzeButton.addEventListener('click', analyze);
updateCounts();

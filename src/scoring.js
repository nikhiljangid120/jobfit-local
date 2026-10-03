export const SKILLS = [
  'javascript', 'typescript', 'react', 'next.js', 'node.js', 'python', 'java', 'c++',
  'sql', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'azure',
  'git', 'github actions', 'rest api', 'graphql', 'machine learning', 'llm', 'rag',
  'pytorch', 'tensorflow', 'fastapi', 'django', 'flask', 'testing', 'jest', 'pytest',
  'ci/cd', 'system design', 'data structures', 'algorithms', 'communication', 'agile'
];

export function normalizeText(text = '') {
  return text.toLowerCase().replace(/[^a-z0-9+#]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function extractSkills(text, skills = SKILLS) {
  const normalized = ` ${normalizeText(text)} `;
  return skills.filter((skill) => normalized.includes(` ${normalizeText(skill)} `));
}

export function skillComparison(resume, job, skills = SKILLS) {
  const resumeSkills = new Set(extractSkills(resume, skills));
  const jobSkills = extractSkills(job, skills);
  return {
    matched: jobSkills.filter((skill) => resumeSkills.has(skill)),
    missing: jobSkills.filter((skill) => !resumeSkills.has(skill)),
    requested: jobSkills,
  };
}

export function dotProduct(a, b) {
  if (!a?.length || a.length !== b?.length) throw new Error('Embeddings must have equal non-zero lengths.');
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

export function blendedScore(semanticSimilarity, matched, requested) {
  const semantic = Math.max(0, Math.min(1, semanticSimilarity));
  const skillCoverage = requested ? matched / requested : semantic;
  return Math.round((semantic * 0.72 + skillCoverage * 0.28) * 100);
}

export function recommendations(score, missingSkills) {
  const items = [];
  if (missingSkills.length) {
    items.push(`Address ${missingSkills.slice(0, 3).join(', ')} only where you have real evidence; never add skills you cannot defend.`);
  }
  items.push(score >= 72
    ? 'Lead your summary with the experience that most closely matches this role.'
    : 'Rewrite your top three bullets around outcomes that overlap with this role.');
  items.push('Mirror the role’s language naturally, then verify every claim before applying.');
  return items;
}

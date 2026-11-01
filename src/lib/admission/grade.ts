export function normalizeAnswer(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.,\-/=+]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitOfficialAnswers(official: string) {
  return official
    .split('|')
    .map((part) => normalizeAnswer(part))
    .filter(Boolean);
}

export function autoScoreAnswer(params: {
  type: string;
  officialAnswer: string;
  response: string;
  points: number;
}): number {
  const { type, officialAnswer, response, points } = params;
  const given = normalizeAnswer(response);
  if (!given || !officialAnswer.trim()) return 0;

  if (type === 'numeric') {
    const expected = Number(String(officialAnswer).replace(',', '.').split('|')[0]);
    const got = Number(given.replace(',', '.'));
    if (!Number.isFinite(expected) || !Number.isFinite(got)) return 0;
    return Math.abs(expected - got) < 1e-6 * Math.max(1, Math.abs(expected)) ? points : 0;
  }

  const alts = splitOfficialAnswers(officialAnswer);
  if (alts.some((alt) => alt === given)) return points;
  if (type === 'long') {
    const overlap = alts.some((alt) => alt.length > 8 && (given.includes(alt) || alt.includes(given)));
    return overlap ? Math.round(points * 0.6 * 100) / 100 : 0;
  }
  if (alts.some((alt) => alt.length > 2 && (given.includes(alt) || alt.includes(given)))) {
    return Math.round(points * 0.5 * 100) / 100;
  }
  return 0;
}

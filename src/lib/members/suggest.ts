export interface MemberSuggestion {
  id: string;
  name: string;
  email: string;
  githubUsername?: string | null;
}

export function foldText(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/** Match a typed name or email, ignoring case and accents. */
export function matchMembers<T extends { name: string; email: string }>(
  people: T[],
  query: string,
  limit = 8
): T[] {
  const tokens = foldText(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  return people
    .map((person) => {
      const name = foldText(person.name);
      const email = foldText(person.email);
      const haystack = `${name} ${email}`;
      if (!tokens.every((token) => haystack.includes(token))) return null;
      const phrase = tokens.join(' ');
      const rank = name.startsWith(phrase) ? 0 : name.includes(phrase) ? 1 : email.startsWith(tokens[0]) ? 2 : 3;
      return { person, rank };
    })
    .filter((row): row is { person: T; rank: number } => row !== null)
    .sort((a, b) => a.rank - b.rank || a.person.name.localeCompare(b.person.name, 'fr'))
    .slice(0, limit)
    .map((row) => row.person);
}

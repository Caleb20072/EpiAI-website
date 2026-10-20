export interface PartnerLine {
  titleFr: string;
  titleEn: string;
  textFr: string;
  textEn: string;
}

export interface PartnerProfile {
  name: string;
  logoLight: string;
  logoDark: string;
  websiteUrl: string;
  taglineFr: string;
  taglineEn: string;
  introFr: string;
  introEn: string;
  linesTitleFr: string;
  linesTitleEn: string;
  lines: PartnerLine[];
  closingFr: string;
  closingEn: string;
}

export const PARTNER_PROFILES: Record<string, PartnerProfile> = {
  olomoon: {
    name: 'Olomoon',
    logoLight: '/assets/partners/olomoon-clair.png',
    logoDark: '/assets/partners/olomoon-fonce.png',
    websiteUrl: 'https://olomoon.org',
    taglineFr: 'L’IA peut être comprise. Elle peut servir à résoudre de vrais problèmes.',
    taglineEn: 'AI can be understood. It can help solve real problems.',
    introFr: 'L’IA peut être comprise. Elle peut servir à résoudre de vrais problèmes. Et les grandes idées ne devraient pas rester invisibles.',
    introEn: 'AI can be understood. It can help solve real problems. And great ideas should not stay invisible.',
    linesTitleFr: 'Olomoon en 10 lignes',
    linesTitleEn: 'Olomoon in 10 lines',
    lines: [
      {
        titleFr: 'Une vitrine mondiale',
        titleEn: 'A global showcase',
        textFr: 'Olomoon met en lumière celles et ceux qui, partout dans le monde, utilisent l’IA pour résoudre de vrais problèmes.',
        textEn: 'Olomoon highlights people around the world who use AI to solve real problems.',
      },
      {
        titleFr: 'Dès 18 ans, sans prérequis',
        titleEn: 'From 18, with no prerequisites',
        textFr: 'Que l’on code ou non, que l’on vienne d’une grande école ou d’une ville sans réseau tech : le talent n’a pas d’adresse.',
        textEn: 'Whether you code or not, whether you come from a grande école or a town with no tech network: talent has no address.',
      },
      {
        titleFr: 'Chercher, pas attendre',
        titleEn: 'Seek, don’t wait',
        textFr: 'Le talent est partout, la visibilité non. Olomoon va chercher les projets, pays par pays, et les montre au monde.',
        textEn: 'Talent is everywhere; visibility is not. Olomoon looks for projects, country by country, and shows them to the world.',
      },
      {
        titleFr: 'Des problèmes réels',
        titleEn: 'Real problems',
        textFr: 'Santé, éducation, agriculture, climat, inclusion : chaque projet raconte un problème concret et la façon dont quelqu’un l’a attaqué avec l’IA.',
        textEn: 'Health, education, agriculture, climate, inclusion: each project tells a concrete problem and how someone tackled it with AI.',
      },
      {
        titleFr: 'Expliquer, jamais vendre',
        titleEn: 'Explain, never sell',
        textFr: 'Pas de battage, pas de classement : Olomoon démystifie, guide et inspire. L’IA peut être comprise, et elle peut servir à quelque chose.',
        textEn: 'No hype, no ranking: Olomoon demystifies, guides and inspires. AI can be understood, and it can be useful.',
      },
      {
        titleFr: 'Les familles aussi',
        titleEn: 'Families too',
        textFr: 'Olomoon aide les parents à comprendre ce que leurs enfants peuvent construire, et pourquoi cela compte.',
        textEn: 'Olomoon helps parents understand what their children can build, and why it matters.',
      },
      {
        titleFr: 'Des rendez-vous réguliers',
        titleEn: 'Regular appointments',
        textFr: 'Did You Know?, histoires de jeunes constructeurs, entretiens avec des experts et des mentors, coulisses de l’équipe.',
        textEn: 'Did You Know?, stories of young builders, interviews with experts and mentors, and behind the scenes of the team.',
      },
      {
        titleFr: 'Un Challenge annuel',
        titleEn: 'An annual Challenge',
        textFr: 'Des experts évaluent les projets les plus utiles et leur donnent un coup de projecteur, des contacts et une communauté.',
        textEn: 'Experts evaluate the most useful projects and give them a spotlight, contacts and a community.',
      },
      {
        titleFr: 'L’optimisme responsable',
        titleEn: 'Responsible optimism',
        textFr: 'Fondée par Sophie Civet Burrus et Jean-François Nguyen, Olomoon est enthousiaste sur le potentiel de l’IA et lucide sur ses limites.',
        textEn: 'Founded by Sophie Civet Burrus and Jean-François Nguyen, Olomoon is enthusiastic about AI’s potential and clear-eyed about its limits.',
      },
      {
        titleFr: 'Et vous ?',
        titleEn: 'And you?',
        textFr: 'Vous construisez quelque chose avec l’IA, ou vous connaissez quelqu’un qui le fait ? Votre projet pourrait être le prochain : olomoon.org.',
        textEn: 'Are you building something with AI, or do you know someone who is? Your project could be next: olomoon.org.',
      },
    ],
    closingFr: 'Votre projet pourrait être le prochain. olomoon.org · @Olomoon',
    closingEn: 'Your project could be next. olomoon.org · @Olomoon',
  },
};

export function partnerProfileFor(name: string) {
  const key = name.trim().toLowerCase();
  return PARTNER_PROFILES[key] ?? null;
}

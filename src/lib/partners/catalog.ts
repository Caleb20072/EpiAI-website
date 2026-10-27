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
  'black synapses': {
    name: 'Black Synapses',
    logoLight: '/assets/partners/black-synapses-clair.png',
    logoDark: '/assets/partners/black-synapses-fonce.png',
    websiteUrl: 'https://www.blacksynapses.com/',
    taglineFr: 'Un holding IA, trois façons d’entrer dans l’intelligence artificielle africaine.',
    taglineEn: 'One AI holding company. Three ways into African AI.',
    introFr:
      'Fondé en 2019 et présent entre les États-Unis et le Bénin, Black Synapses développe des applications concrètes de l’intelligence artificielle adaptées aux réalités africaines. Le groupe s’organise autour de trois entités.',
    introEn:
      'Founded in 2019 and present between the United States and Benin, Black Synapses builds practical AI applications adapted to African realities. The group is organised around three entities.',
    linesTitleFr: 'Black Synapses, partenaire d’Epi’AI',
    linesTitleEn: 'Black Synapses, partner of Epi’AI',
    lines: [
      {
        titleFr: 'Benin Data — l’IA en entreprise',
        titleEn: 'Benin Data — AI for organisations',
        textFr:
          'Basée à Cotonou, cette entité accompagne les organisations dans leur transformation numérique : ingénierie des données, solutions d’IA, analyse prédictive, vision par ordinateur, traitement du langage naturel, applications web et mobiles. Site : benindata.bj.',
        textEn:
          'Based in Cotonou, this entity supports organisations through digital transformation: data engineering, AI systems, predictive analytics, computer vision, NLP, and AI-powered web and mobile apps. Website: benindata.bj.',
      },
      {
        titleFr: 'Racines & AW — recherche, incubation, talents',
        titleEn: 'Racines & AW — research, incubation, talent',
        textFr:
          'Structure à but non lucratif : incubateur de startups, laboratoire Artificial Wisdom, et initiatives communautaires. Elle travaille une IA qui tient compte des langues, des valeurs et des contextes africains, et accompagne les jeunes vers des projets concrets.',
        textEn:
          'A not-for-profit arm: startup incubator, Artificial Wisdom research lab, and community initiatives. It designs AI that accounts for African languages, values and contexts, and helps young talent ship real projects.',
      },
      {
        titleFr: 'Ventures — des projets qui deviennent des entreprises',
        titleEn: 'Ventures — projects that become companies',
        textFr:
          'Les startups issues de l’incubateur, une fois autonomes : Tailleurie (confection sur mesure), Xixa (caisse et stocks pour petits commerçants), Kléounh (apprentissage par la synthèse de textes), plus des initiatives dans l’immobilier et la mode.',
        textEn:
          'Startups that graduate from the incubator: Tailleurie (made-to-measure), Xixa (till and stock for small merchants), Kléounh (learning through text summarisation), plus real-estate and fashion ventures.',
      },
      {
        titleFr: 'Stages',
        titleEn: 'Internships',
        textFr: 'Explorer des expériences professionnelles au sein du groupe Black Synapses.',
        textEn: 'Explore professional experience inside the Black Synapses group.',
      },
      {
        titleFr: 'Création de contenus',
        titleEn: 'Content',
        textFr:
          'Travailler des formats vidéo courts avec Benin Data pour vulgariser des sujets technologiques et les diffuser sur les réseaux.',
        textEn:
          'Produce short video formats with Benin Data to explain technology topics and share them on social media.',
      },
      {
        titleFr: 'Projets',
        titleEn: 'Projects',
        textFr:
          'Découvrir les projets du groupe et étudier comment nos membres peuvent contribuer, selon leurs compétences et les besoins identifiés.',
        textEn:
          'Discover the group’s projects and see how our members can contribute, matching skills to identified needs.',
      },
    ],
    closingFr:
      'Stages, contenus, projets — et d’autres axes à ouvrir ensemble. blacksynapses.com · benindata.bj',
    closingEn:
      'Internships, content, projects — and more to open together. blacksynapses.com · benindata.bj',
  },
};

export function partnerProfileFor(name: string) {
  const key = name.trim().toLowerCase();
  return PARTNER_PROFILES[key] ?? null;
}

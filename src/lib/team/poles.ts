export type PoleCategory = 'tech' | 'non_tech';

export interface TeamPoleDefinition {
  key: string;
  category: PoleCategory;
  nameFr: string;
  nameEn: string;
  missionFr: string;
  missionEn: string;
  displayOrder: number;
}

export const TEAM_POLES: TeamPoleDefinition[] = [
  {
    key: 'pole_formation',
    category: 'tech',
    nameFr: 'Pôle Formation',
    nameEn: 'Training Pole',
    missionFr: 'Workshops, montée en compétence et veille technologique.',
    missionEn: 'Workshops, skill-building and technology watch.',
    displayOrder: 1,
  },
  {
    key: 'pole_projet',
    category: 'tech',
    nameFr: 'Pôle Projet',
    nameEn: 'Projects Pole',
    missionFr: 'Supervision des projets techniques et des livrables associés.',
    missionEn: 'Supervision of technical projects and deliverables.',
    displayOrder: 2,
  },
  {
    key: 'pole_recherche',
    category: 'tech',
    nameFr: 'Pôle Recherche & Innovation',
    nameEn: 'Research & Innovation Pole',
    missionFr: 'Veille scientifique, articles et expérimentations IA.',
    missionEn: 'Scientific watch, papers and AI experiments.',
    displayOrder: 3,
  },
  {
    key: 'pole_communication',
    category: 'non_tech',
    nameFr: 'Pôle Communication',
    nameEn: 'Communication Pole',
    missionFr: 'Image de marque, design et réseaux sociaux.',
    missionEn: 'Branding, design and social media.',
    displayOrder: 4,
  },
  {
    key: 'pole_evenements',
    category: 'non_tech',
    nameFr: 'Pôle Événements',
    nameEn: 'Events Pole',
    missionFr: 'Hackathons, conférences et rencontres avec les experts.',
    missionEn: 'Hackathons, conferences and expert meetups.',
    displayOrder: 5,
  },
  {
    key: 'pole_partenariats',
    category: 'non_tech',
    nameFr: 'Pôle Partenariats',
    nameEn: 'Partnerships Pole',
    missionFr: 'Relations entreprises, alumni et sponsors.',
    missionEn: 'Corporate relations, alumni and sponsors.',
    displayOrder: 6,
  },
];

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/61588431114153/',
  instagram: 'https://www.instagram.com/epi_ai_epitech?igsh=emtidWVjdWI2cmhz',
  linkedin: 'https://www.linkedin.com/company/epiai-benin/',
  github: 'https://github.com/EpiAI-association',
} as const;

export interface CommissionDefinition {
  key: string;
  nameFr: string;
  nameEn: string;
  missionFr: string;
  missionEn: string;
  displayOrder: number;
}

export const COMMISSIONS: CommissionDefinition[] = [
  {
    key: 'commission_recherche',
    nameFr: 'Recherche, veille scientifique et vulgarisation',
    nameEn: 'Research, scientific watch and outreach',
    missionFr: 'Suivre les avancées de l’IA et les rendre accessibles, notamment par des contenus et des vidéos.',
    missionEn: 'Follow AI developments and make them accessible, especially through educational content and videos.',
    displayOrder: 1,
  },
  {
    key: 'commission_projets',
    nameFr: 'Projets IA',
    nameEn: 'AI projects',
    missionFr: 'Recenser, suivre et accompagner les projets d’IA menés par les étudiants.',
    missionEn: 'List, follow and support the AI projects carried out by students.',
    displayOrder: 2,
  },
  {
    key: 'commission_evenements',
    nameFr: 'Événements et relations avec les intervenants',
    nameEn: 'Events and speaker relations',
    missionFr: 'Préparer les talks, conférences et rencontres, et le lien avec les intervenants.',
    missionEn: 'Prepare talks, conferences and meetups, and the relationship with speakers.',
    displayOrder: 3,
  },
  {
    key: 'commission_vie',
    nameFr: 'Vie associative et intégration des membres',
    nameEn: 'Community life and welcoming members',
    missionFr: 'Accueillir les nouveaux membres et faire vivre l’association au quotidien.',
    missionEn: 'Welcome new members and keep the association’s day-to-day life going.',
    displayOrder: 4,
  },
];

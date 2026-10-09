export interface CommissionDefinition {
  key: string;
  nameFr: string;
  nameEn: string;
  missionFr: string;
  missionEn: string;
  dutiesFr: string[];
  dutiesEn: string[];
  noteFr?: string;
  noteEn?: string;
  displayOrder: number;
}

export const COMMISSIONS: CommissionDefinition[] = [
  {
    key: 'commission_recherche',
    nameFr: 'Recherche, veille scientifique et vulgarisation',
    nameEn: 'Research, scientific watch and outreach',
    missionFr: 'Suivre les avancées de l’intelligence artificielle et rendre les connaissances scientifiques accessibles, notamment par des contenus pédagogiques et des vidéos.',
    missionEn: 'Follow developments in artificial intelligence and make scientific knowledge accessible, especially through educational content and videos.',
    dutiesFr: [
      'Assurer une veille sur les avancées, les outils, les méthodes et les travaux de recherche en IA.',
      'Identifier des sujets pertinents à expliquer au public étudiant et, plus largement, au public intéressé par l’IA.',
      'Rechercher et vérifier les sources afin de garantir la fiabilité des informations.',
      'Préparer des contenus pédagogiques, des plans et des scripts de vidéos, dans un langage accessible sans sacrifier la rigueur.',
      'Coordonner la préparation des tournages avec l’équipe communication d’Epitech, en lien avec le Responsable Communication.',
      'Contribuer à la publication et à la valorisation des contenus sur les réseaux d’Epi’AI.',
      'Partager les ressources utiles aux autres activités de formation.',
    ],
    dutiesEn: [
      'Watch developments, tools, methods and research in AI.',
      'Pick subjects worth explaining to students and to anyone interested in AI.',
      'Check sources so the information stays reliable.',
      'Prepare educational content, outlines and video scripts in plain language without losing rigor.',
      'Coordinate filming with Epitech’s communications team, together with the Head of Communications.',
      'Help publish and share the content on Epi’AI’s social channels.',
      'Pass useful resources on to the association’s other training activities.',
    ],
    displayOrder: 1,
  },
  {
    key: 'commission_projets',
    nameFr: 'Projets IA',
    nameEn: 'AI projects',
    missionFr: 'Recenser, suivre et accompagner les projets liés à l’intelligence artificielle menés par les étudiants, en particulier à Epitech, et les rendre plus accessibles.',
    missionEn: 'List, follow and support students’ artificial-intelligence projects, especially at Epitech, and help make them more accessible.',
    dutiesFr: [
      'Tenir à jour un inventaire des projets, de leur avancement et de leurs besoins.',
      'Construire un calendrier de suivi, en tenant compte du calendrier académique.',
      'Repérer les difficultés et proposer des ressources, des ateliers ou des séances de soutien.',
      'Aider les étudiants à mieux comprendre les projets d’IA, notamment ceux de Tek1.',
      'Organiser des ateliers pratiques autour des outils, des méthodes et des étapes d’un projet.',
      'Faire remonter les besoins récurrents au Bureau exécutif.',
    ],
    dutiesEn: [
      'Keep an inventory of projects, their progress and what they need.',
      'Build a follow-up calendar that fits the academic year.',
      'Spot difficulties and offer resources, workshops or support sessions.',
      'Help students understand AI projects, especially Tek1 projects.',
      'Run practical workshops on the tools, methods and steps of an AI project.',
      'Report recurring needs to the Executive Board.',
    ],
    noteFr: 'La commission accompagne les projets. Elle ne remplace ni les étudiants qui les réalisent, ni les encadrants académiques.',
    noteEn: 'The commission supports projects. It does not replace the students who build them, or their academic supervisors.',
    displayOrder: 2,
  },
  {
    key: 'commission_evenements',
    nameFr: 'Événements et relations avec les intervenants',
    nameEn: 'Events and speaker relations',
    missionFr: 'Contribuer à la préparation et au bon déroulement des talks, conférences et autres rencontres organisées par Epi’AI.',
    missionEn: 'Help prepare and run the talks, conferences and other meetups organised by Epi’AI.',
    dutiesFr: [
      'Identifier des intervenants en lien avec les thématiques de l’association.',
      'Préparer les prises de contact, selon les modalités définies avec le Bureau exécutif.',
      'Recueillir les disponibilités et coordonner les dates avec l’école et l’association.',
      'Préparer le pratique : salle, matériel, déroulé, accueil et besoins logistiques.',
      'Coordonner avec la communication la promotion des événements.',
      'Recueillir les retours et rédiger un bref bilan pour les prochaines rencontres.',
    ],
    dutiesEn: [
      'Find speakers who match the association’s themes.',
      'Prepare outreach, following what was agreed with the Executive Board.',
      'Collect availability and match dates with the school and the association.',
      'Handle the practical side: room, equipment, running order, welcome and logistics.',
      'Work with communications on promoting the events.',
      'Collect feedback and write a short recap for the next events.',
    ],
    noteFr: 'Les dates ne sont pas forcément fixées à l’avance : elles dépendent de la disponibilité des intervenants.',
    noteEn: 'Dates are not always set in advance: they depend on when speakers are available.',
    displayOrder: 3,
  },
  {
    key: 'commission_vie',
    nameFr: 'Vie associative et intégration des membres',
    nameEn: 'Community life and welcoming members',
    missionFr: 'Contribuer à une vie associative active et accueillante, et faciliter l’intégration des nouveaux membres.',
    missionEn: 'Help keep association life active and welcoming, and make it easier for new members to settle in.',
    dutiesFr: [
      'Contribuer à la préparation et au suivi du recrutement.',
      'Aider les nouveaux membres à comprendre la mission, les activités, les règles et l’engagement attendu.',
      'Maintenir à jour les informations pratiques, dans le respect de la confidentialité.',
      'Faciliter la circulation des informations, le suivi des présences et les autorisations nécessaires.',
      'Encourager la participation et proposer des actions qui renforcent la cohésion.',
      'Accompagner les membres qui veulent prendre davantage d’initiatives.',
    ],
    dutiesEn: [
      'Help prepare and follow recruitment.',
      'Help new members understand the mission, the activities, the rules and the commitment expected.',
      'Keep practical information up to date, and respect confidentiality.',
      'Help information circulate, and follow attendance and the permissions activities need.',
      'Encourage participation and suggest ways to strengthen the group.',
      'Support members who want to take on more initiatives.',
    ],
    noteFr: 'Le suivi de la participation sert à mieux intégrer et accompagner les membres, pas à punir.',
    noteEn: 'Following participation is meant to welcome and support members, not to punish them.',
    displayOrder: 4,
  },
];

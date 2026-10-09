import { COMMISSIONS } from './commissions';
import type { ITeamMember } from './types';

const PHOTO = (file: string) => `/assets/team/members/${file}`;
const now = () => new Date().toISOString();

const MENTORS = [
  { name: 'Aime-Rick LOTSU', title: 'AI Engineer', photo: 'aime-rick-lotsu.jpg', order: 1 },
  { name: 'Izzoudine KANTA', title: 'AI Developer', photo: 'izzoudine-kanta.jpg', order: 2 },
  { name: 'Yann NÉRIS', title: 'Chef Projet AI & Data', photo: 'yann-neris.jpg', order: 3 },
  { name: 'Fabrice TOKOUDAGBA', title: 'Data Scientist', photo: 'fabrice-tokoudagba.jpg', order: 4 },
  { name: 'Hospice HOUNFODJI', title: 'AI Engineer', photo: 'hospice-hounfodji.jpg', order: 5 },
  { name: 'Gilchris HOUEKPO', title: 'PhD Candidate in AI', photo: 'gilchris-houekpo.jpg', order: 6 },
  { name: 'Farel GANLAKY', title: 'AI Engineer', photo: 'farel-ganlaky.jpg', order: 7 },
  { name: 'Maqsoud TAWALIOU', title: 'AI Engineer', photo: 'maqsoud-tawaliou.jpg', order: 8 },
] as const;

const EXECUTIVES = [
  { name: 'Fresnel SATIGNON', role: 'Président', order: 1, linkedin: 'https://www.linkedin.com/in/fresnel-satignon-58a84229b/', photo: 'fresnel-satignon.jpg' },
  { name: 'Méric GBEMETONOU', role: 'Vice-président', order: 2, linkedin: 'https://www.linkedin.com/in/méric-gbemetonou-235036233/', photo: '' },
  { name: 'Karyl SOUMAILA', role: 'Responsable Formation', order: 3, linkedin: '', photo: '' },
  { name: 'Ange ADANTCHEDE', role: 'Responsable Communication', order: 4, linkedin: 'https://www.linkedin.com/in/ange-adantchede-832273324/', photo: 'ange-adantchede.jpg' },
] as const;

const COMMISSION_MEMBERS = [
  { name: 'Carlos Victorieux SOSSOU', commission: 'commission_recherche', order: 1, linkedin: '' },
  { name: 'Kael AVANDE', commission: 'commission_recherche', order: 2, linkedin: '' },
  { name: 'Justus LIHOUSSOU', commission: 'commission_recherche', order: 3, linkedin: '' },
  { name: 'Précieux LONMADON', commission: 'commission_projets', order: 1, linkedin: 'https://www.linkedin.com/in/précieux-lonmadon-b213b8394/' },
  { name: 'Marcellin SAMBIENI', commission: 'commission_projets', order: 2, linkedin: 'https://www.linkedin.com/in/ipamma-marcellin-sambieni-23264b384/' },
  { name: 'Inès MOMBO', commission: 'commission_evenements', order: 1, linkedin: '' },
  { name: 'Mystica ALLOSSOHOUN', commission: 'commission_evenements', order: 2, linkedin: '' },
  { name: 'Ivanna MICHODJEHOUN', commission: 'commission_evenements', order: 3, linkedin: '' },
  { name: 'Peniel YAYI', commission: 'commission_vie', order: 1, linkedin: '' },
  { name: 'Yann AZANDE', commission: 'commission_vie', order: 2, linkedin: '' },
] as const;

export function buildDefaultTeamMembers(): ITeamMember[] {
  const timestamp = now();
  const members: ITeamMember[] = [
    {
      id: 'seed-referent',
      name: 'Sergino BRADFORD',
      role: 'Notre Référent',
      title: "Responsable du programme Bachelor d'EPITECH Bénin",
      section: 'referent',
      photoUrl: PHOTO('sergino-bradford.png'),
      socialLinks: {
        linkedin: 'https://www.linkedin.com/in/gounoukperou-sergino-bradford-7513651a3/',
      },
      displayOrder: 0,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  for (const executive of EXECUTIVES) {
    members.push({
      id: `seed-executive-${executive.order}`,
      name: executive.name,
      role: executive.role,
      section: 'executive',
      photoUrl: executive.photo ? PHOTO(executive.photo) : undefined,
      socialLinks: executive.linkedin ? { linkedin: executive.linkedin } : {},
      displayOrder: executive.order,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  for (const person of COMMISSION_MEMBERS) {
    const commission = COMMISSIONS.find((item) => item.key === person.commission);
    members.push({
      id: `seed-${person.commission}-${person.order}`,
      name: person.name,
      role: 'Membre',
      title: commission?.nameFr,
      section: 'pole',
      poleKey: person.commission,
      socialLinks: person.linkedin ? { linkedin: person.linkedin } : {},
      displayOrder: person.order,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  for (const mentor of MENTORS) {
    members.push({
      id: `seed-mentor-${mentor.order}`,
      name: mentor.name,
      role: 'Mentor',
      title: mentor.title,
      section: 'mentor',
      photoUrl: PHOTO(mentor.photo),
      socialLinks: {},
      displayOrder: mentor.order,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  return members;
}

export const DEFAULT_TEAM_MEMBERS = buildDefaultTeamMembers();

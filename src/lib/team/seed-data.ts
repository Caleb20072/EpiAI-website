import { TEAM_POLES } from './poles';
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

export function buildDefaultTeamMembers(): ITeamMember[] {
  const timestamp = now();
  const members: ITeamMember[] = [
    {
      id: 'seed-referent',
      name: 'Sergino BRADFORD',
      role: 'Notre Référent',
      title: "Référent Epi'AI",
      section: 'referent',
      photoUrl: PHOTO('sergino-bradford.jpg'),
      socialLinks: {},
      displayOrder: 0,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

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

  for (const pole of TEAM_POLES) {
    members.push({
      id: `seed-pole-${pole.key}`,
      name: '—',
      role: pole.nameFr,
      title: 'Responsable à nommer',
      section: 'pole',
      poleKey: pole.key,
      description: pole.missionFr,
      socialLinks: {},
      displayOrder: pole.displayOrder,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  return members;
}

export const DEFAULT_TEAM_MEMBERS = buildDefaultTeamMembers();

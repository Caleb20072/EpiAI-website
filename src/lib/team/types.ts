export interface ITeamMember {
  id: string;
  name: string;
  role: string;
  title?: string;
  section: 'executive' | 'pole' | 'mentor';
  poleKey?: string;
  description?: string;
  photoUrl?: string;
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamMemberInput {
  name: string;
  role: string;
  title?: string;
  section: 'executive' | 'pole' | 'mentor';
  poleKey?: string;
  description?: string;
  photoUrl?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  displayOrder?: number;
}

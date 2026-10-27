import { PrismaClient } from '@prisma/client';
import { buildDefaultTeamMembers } from '../src/lib/team/seed-data';
import { seedProjects } from './seed-projects';
import { seedResources } from './seed-resources';

const prisma = new PrismaClient();

async function ensurePartner(data: {
  name: string;
  description: string;
  type: string;
  websiteUrl?: string;
  logoUrl?: string;
  displayOrder: number;
}) {
  const existing = await prisma.partner.findFirst({ where: { name: data.name } });
  if (existing) {
    await prisma.partner.update({
      where: { id: existing.id },
      data: {
        description: data.description,
        type: data.type,
        websiteUrl: data.websiteUrl,
        logoUrl: data.logoUrl,
        displayOrder: data.displayOrder,
        isActive: true,
      },
    });
    return;
  }
  await prisma.partner.create({ data: { ...data, isActive: true } });
}

async function seedPartners() {
  await ensurePartner({
    name: 'Epitech Bénin',
    description: "École d'informatique à Cotonou — premier campus Epitech en Afrique, au sein de Sèmè City.",
    type: 'school',
    websiteUrl: 'https://epitech.bj',
    displayOrder: 1,
  });
  await ensurePartner({
    name: "EPI'AI Alumni",
    description: "Réseau des anciens membres de l'association.",
    type: 'alumni',
    displayOrder: 2,
  });
  await ensurePartner({
    name: 'Olomoon',
    description: 'L’IA peut être comprise. Elle peut servir à résoudre de vrais problèmes.',
    type: 'partner',
    logoUrl: '/assets/partners/olomoon-clair.png',
    websiteUrl: 'https://olomoon.org',
    displayOrder: 3,
  });
  await ensurePartner({
    name: 'Black Synapses',
    description: 'Un holding IA, trois façons d’entrer dans l’intelligence artificielle africaine.',
    type: 'partner',
    logoUrl: '/assets/partners/black-synapses-clair.png',
    websiteUrl: 'https://www.blacksynapses.com/',
    displayOrder: 4,
  });

  console.log('Partners ensured.');
}

async function seedTeam() {
  const count = await prisma.teamMember.count();
  if (count > 0) {
    console.log(`Team already has ${count} members, skipping.`);
    return;
  }

  const members = buildDefaultTeamMembers();
  for (const member of members) {
    await prisma.teamMember.create({
      data: {
        name: member.name,
        role: member.role,
        title: member.title,
        section: member.section,
        poleKey: member.poleKey,
        description: member.description,
        photoUrl: member.photoUrl,
        displayOrder: member.displayOrder,
        isActive: member.isActive,
      },
    });
  }

  console.log(`Team seeded (${members.length} entries).`);
}

async function main() {
  await seedPartners();
  await seedTeam();
  await seedProjects(prisma);
  await seedResources(prisma);
  const { seedTalks } = await import('./seed-talks');
  await seedTalks();
  console.log('Seed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

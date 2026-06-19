import { PrismaClient } from '@prisma/client';
import { buildDefaultTeamMembers } from '../src/lib/team/seed-data';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.teamMember.count();
  if (existing > 0) {
    console.log(`Team already has ${existing} members — run with FORCE=1 to reset.`);
    if (process.env.FORCE !== '1') return;
    await prisma.teamMember.deleteMany();
    console.log('Cleared existing team members.');
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
        linkedin: member.socialLinks.linkedin,
        github: member.socialLinks.github,
        twitter: member.socialLinks.twitter,
        displayOrder: member.displayOrder,
        isActive: member.isActive,
      },
    });
  }

  console.log(`Seeded ${members.length} team entries.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

/**
 * Migre les rôles legacy (nouveau_membre → membre) en base et dans Clerk.
 * Usage: npx dotenv -e .env.local -- tsx scripts/migrate-member-role.ts
 */
import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/nextjs/server';
import { getRoleLevel } from '../src/lib/roles/utils';

const prisma = new PrismaClient();

const TARGET_ROLE = 'membre';

async function main() {
  const dbUpdated = await prisma.user.updateMany({
    where: { role: 'nouveau_membre' },
    data: { role: TARGET_ROLE, roleLevel: getRoleLevel(TARGET_ROLE) },
  });
  console.log(`PostgreSQL: ${dbUpdated.count} user(s) migrated to "${TARGET_ROLE}".`);

  const legacyMembres = await prisma.user.findMany({
    where: { role: 'membre', roleLevel: { not: 1 } },
  });
  for (const u of legacyMembres) {
    await prisma.user.update({
      where: { id: u.id },
      data: { roleLevel: 1 },
    });
  }
  if (legacyMembres.length > 0) {
    console.log(`PostgreSQL: ${legacyMembres.length} membre(s) aligned to roleLevel 1.`);
  }

  try {
    const client = await clerkClient();
    const users = await client.users.getUserList({ limit: 500 });
    let clerkUpdated = 0;

    for (const user of users.data) {
      const role = user.publicMetadata?.role as string | undefined;
      const needsMigration =
        role === 'nouveau_membre' ||
        (role === 'membre' && Number(user.publicMetadata?.roleId) !== 1);

      if (!needsMigration) continue;

      await client.users.updateUser(user.id, {
        publicMetadata: {
          ...user.publicMetadata,
          role: TARGET_ROLE,
          roleId: getRoleLevel(TARGET_ROLE),
        },
      });
      clerkUpdated++;
    }

    console.log(`Clerk: ${clerkUpdated} user(s) migrated to "${TARGET_ROLE}".`);
  } catch (err) {
    console.warn('Clerk migration skipped or partial:', err);
  }

  console.log('Migration complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

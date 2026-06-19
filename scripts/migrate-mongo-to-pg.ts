/**
 * Optional MongoDB → PostgreSQL data migration.
 * Usage: MONGODB_URI=... DATABASE_URL=... npx tsx scripts/migrate-mongo-to-pg.ts
 */
import { MongoClient } from 'mongodb';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI required');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  const dbName = process.env.DATABASE?.replace(/'/g, '') || 'EpiAI';
  const db = client.db(dbName);

  console.log('Migrating threads...');
  const threads = await db.collection('threads').find().toArray();
  for (const t of threads) {
    await prisma.thread.upsert({
      where: { id: String(t._id) },
      create: {
        id: String(t._id),
        title: t.title || '',
        content: t.content || '',
        authorId: t.authorId || '',
        authorName: t.authorName || '',
        categoryId: t.categoryId || 'general',
        tags: t.tags || [],
        views: t.views || 0,
        isPinned: t.isPinned || false,
        isLocked: t.isLocked || false,
        replyCount: t.replyCount || 0,
        createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
        updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
      },
      update: {},
    });
  }

  console.log('Migrating resources...');
  const resources = await db.collection('resources').find().toArray();
  for (const r of resources) {
    await prisma.resource.upsert({
      where: { id: String(r._id) },
      create: {
        id: String(r._id),
        title: r.title || '',
        description: r.description || '',
        type: r.type || 'article',
        url: r.url,
        fileUrl: r.fileUrl,
        categoryId: r.categoryId || 'general',
        isPublished: r.isPublished ?? true,
        isFeatured: r.isFeatured ?? false,
        createdBy: r.createdBy || '',
        viewCount: r.viewCount || 0,
        downloadCount: r.downloadCount || 0,
        createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
      },
      update: {},
    });
  }

  console.log('Migration complete.');
  await client.close();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

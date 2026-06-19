import { prisma } from '@/lib/prisma';

export async function getActivePartners() {
  return prisma.partner.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
}

export async function getAllPartners() {
  return prisma.partner.findMany({ orderBy: { displayOrder: 'asc' } });
}

export async function createPartner(data: {
  name: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  type?: string;
  displayOrder?: number;
}) {
  return prisma.partner.create({ data: { ...data, isActive: true } });
}

export async function updatePartner(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    logoUrl: string;
    websiteUrl: string;
    type: string;
    displayOrder: number;
    isActive: boolean;
  }>
) {
  return prisma.partner.update({ where: { id }, data });
}

export async function deletePartner(id: string) {
  try {
    await prisma.partner.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

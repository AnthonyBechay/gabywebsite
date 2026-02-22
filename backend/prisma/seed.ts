import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@jobline.com' },
    update: {},
    create: {
      email: 'admin@jobline.com',
      password: hashedPassword,
      name: 'Admin',
    },
  });

  const existingSettings = await prisma.settings.findFirst();
  if (!existingSettings) {
    await prisma.settings.create({
      data: { defaultCost: 0 },
    });
  }

  console.log('Seed complete: admin@jobline.com / admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

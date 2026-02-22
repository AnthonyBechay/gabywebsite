import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);

// GET settings
router.get('/', async (_req, res) => {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: { defaultCost: 0 },
      });
    }
    res.json(settings);
  } catch {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT update settings
router.put('/', async (req, res) => {
  try {
    const { defaultCost } = req.body;
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: { defaultCost: parseFloat(defaultCost) || 0 },
      });
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: { defaultCost: parseFloat(defaultCost) || 0 },
      });
    }
    res.json(settings);
  } catch {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export { router as settingsRouter };

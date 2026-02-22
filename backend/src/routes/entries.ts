import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);

function cleanEntryData(body: any) {
  return {
    clientName: body.clientName,
    candidateName: body.candidateName,
    cost: parseFloat(body.cost) || 0,
    sellingPrice: body.isFree ? 0 : parseFloat(body.sellingPrice) || 0,
    status: body.status || 'NOT_DONE',
    isFree: body.isFree === true || body.isFree === 'true',
    expiryDate: new Date(body.expiryDate),
    notes: body.notes || null,
  };
}

// GET all entries
router.get('/', async (_req, res) => {
  try {
    const entries = await prisma.insuranceEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(entries);
  } catch {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// GET expiring entries (within next 30 days)
router.get('/expiring', async (_req, res) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const entries = await prisma.insuranceEntry.findMany({
      where: {
        expiryDate: {
          lte: thirtyDaysFromNow,
        },
      },
      orderBy: { expiryDate: 'asc' },
    });
    res.json(entries);
  } catch {
    res.status(500).json({ error: 'Failed to fetch expiring entries' });
  }
});

// GET single entry
router.get('/:id', async (req, res) => {
  try {
    const entry = await prisma.insuranceEntry.findUnique({
      where: { id: req.params.id },
    });
    if (!entry) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }
    res.json(entry);
  } catch {
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

// POST create entry
router.post('/', async (req, res) => {
  try {
    const data = cleanEntryData(req.body);
    const entry = await prisma.insuranceEntry.create({ data });
    res.status(201).json(entry);
  } catch (error: any) {
    console.error('Entry creation error:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// PUT update entry
router.put('/:id', async (req, res) => {
  try {
    const data = cleanEntryData(req.body);
    const entry = await prisma.insuranceEntry.update({
      where: { id: req.params.id },
      data,
    });
    res.json(entry);
  } catch (error: any) {
    console.error('Entry update error:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// DELETE entry
router.delete('/:id', async (req, res) => {
  try {
    await prisma.insuranceEntry.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

export { router as entryRouter };

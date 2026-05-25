import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/exams
router.get('/', async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(exams);
  } catch (error: any) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/exams
router.post('/', requireAdmin, async (req: any, res) => {
  try {
    const { name, scoringType, formSchema } = req.body;

    if (!name || !formSchema) {
      return res.status(400).json({ error: 'Missing required fields: name, formSchema' });
    }

    const exam = await prisma.exam.create({
      data: {
        name,
        scoringType: scoringType || 'RANK',
        formSchema
      }
    });

    res.status(201).json(exam);
  } catch (error: any) {
    console.error('Error creating exam:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Exam with this name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/predict
router.post('/', async (req, res) => {
  try {
    const { exam, category, rank } = req.body;

    if (!exam || !category || rank === undefined) {
      return res.status(400).json({ error: 'Missing required fields: exam, category, rank' });
    }

    const rankNumber = parseInt(rank as string, 10);
    if (isNaN(rankNumber) || rankNumber <= 0) {
      return res.status(400).json({ error: 'Rank must be a positive integer' });
    }

    // Query cutoffs matching the exam, category, and where the cutoffRank is >= user's rank
    // (Meaning the user's rank is sufficient to meet or beat the cutoff threshold)
    const matches = await prisma.cutoff.findMany({
      where: {
        exam,
        category,
        cutoffRank: {
          gte: rankNumber
        }
      },
      include: {
        college: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            location: true,
            rating: true,
            fees: true,
            avgPackage: true
          }
        }
      },
      orderBy: {
        cutoffRank: 'asc' // Show tighter/more competitive cutoffs first
      }
    });

    res.json(matches);
  } catch (error: any) {
    console.error('Error predicting college options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

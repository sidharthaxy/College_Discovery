import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/predict
router.post('/', async (req, res) => {
  try {
    const { examId, criteria, rank } = req.body;

    if (!examId || !criteria || rank === undefined) {
      return res.status(400).json({ error: 'Missing required fields: examId, criteria, rank' });
    }

    const rankNumber = parseInt(rank as string, 10);
    if (isNaN(rankNumber) || rankNumber <= 0) {
      return res.status(400).json({ error: 'Rank must be a positive integer' });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId }
    });

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const isScore = exam.scoringType === 'SCORE';

    // Query all cutoffs matching the examId and where the cutoffValue matches scoring math
    // For RANK: cutoffValue >= userRank (user's rank is better/lower)
    // For SCORE: cutoffValue <= userScore (user's score is higher/better)
    const allCutoffs = await prisma.cutoff.findMany({
      where: {
        examId,
        cutoffValue: isScore ? { lte: rankNumber } : { gte: rankNumber }
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
        cutoffValue: isScore ? 'desc' : 'asc'
      }
    });

    // Filter the returned cutoffs in JS to ensure the DB's JSON `criteria` contains the user's requested criteria.
    // E.g., if user asks for { category: 'OPEN' }, it will match { category: 'OPEN', branch: 'CSE', round: 6 }
    const matches = allCutoffs.filter(c => {
      const dbCriteria = c.criteria as Record<string, any>;
      return Object.entries(criteria).every(([key, val]) => dbCriteria[key] === val);
    });

    res.json(matches);
  } catch (error: any) {
    console.error('Error predicting college options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

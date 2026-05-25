import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/reviews
// Returns reviews, optionally filtering by collegeId or status
router.get('/', async (req, res) => {
  try {
    const { collegeId, status } = req.query;
    const where: any = {};

    if (collegeId) {
      where.collegeId = collegeId as string;
    }
    if (status) {
      where.status = status as string;
    } else {
      // By default, public endpoint returns only APPROVED reviews
      where.status = 'APPROVED';
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        college: {
          select: { name: true }
        }
      }
    });

    res.json(reviews);
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/reviews
// Allows authenticated users/students to submit reviews
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { rating, comment, collegeId, isVerified } = req.body;
    const userId = req.user!.id;

    if (!rating || !comment || !collegeId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating as string, 10),
        comment,
        collegeId: collegeId,
        userId: userId,
        isVerified: isVerified === true || isVerified === 'true', // allow verified flag for seeding/demo submissions
        status: 'PENDING' // must be approved by admin
      }
    });

    res.status(201).json(review);
  } catch (error: any) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

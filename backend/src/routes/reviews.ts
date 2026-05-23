import { Router } from 'express';
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
      where.collegeId = parseInt(collegeId as string, 10);
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
// Allows public users/students to submit reviews (defaulting to PENDING moderation status)
router.post('/', async (req, res) => {
  try {
    const { reviewerName, rating, comment, collegeId, isVerified } = req.body;

    if (!reviewerName || !rating || !comment || !collegeId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const review = await prisma.review.create({
      data: {
        reviewerName,
        rating: parseInt(rating, 10),
        comment,
        collegeId: parseInt(collegeId, 10),
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

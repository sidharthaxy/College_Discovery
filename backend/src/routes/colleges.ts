import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/colleges
router.get('/', async (req, res) => {
  try {
    const { search, maxFees, location, rating, page = 1, limit = 6 } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where: Prisma.CollegeWhereInput = {};

    // 1. Search filter: match name, location, or course names
    if (search && (search as string).trim() !== '') {
      const searchStr = (search as string).trim();
      where.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { location: { contains: searchStr, mode: 'insensitive' } },
        {
          courses: {
            some: {
              name: { contains: searchStr, mode: 'insensitive' }
            }
          }
        }
      ];
    }

    // 2. Max Fees filter (fees <= maxFees)
    if (maxFees) {
      const feesLimit = parseInt(maxFees as string, 10);
      if (!isNaN(feesLimit)) {
        where.fees = { lte: feesLimit };
      }
    }

    // 3. Location filter
    if (location && location !== 'All Locations') {
      where.location = { contains: location as string, mode: 'insensitive' };
    }

    // 4. Rating filter (rating >= minRating)
    if (rating) {
      const minRating = parseFloat(rating as string);
      if (!isNaN(minRating)) {
        where.rating = { gte: minRating };
      }
    }

    // Execute query with skip and limit
    const [colleges, totalCount] = await Promise.all([
      prisma.college.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { rating: 'desc' },
        include: {
          courses: true,
          placements: {
            orderBy: { year: 'desc' },
            take: 1
          }
        }
      }),
      prisma.college.count({ where })
    ]);

    res.json({
      colleges,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalCount / limitNumber)
      }
    });
  } catch (error: any) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/colleges/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const college = await prisma.college.findUnique({
      where: { slug },
      include: {
        courses: {
          orderBy: { name: 'asc' }
        },
        placements: {
          orderBy: { year: 'desc' }
        },
        cutoffs: {
          orderBy: { cutoffRank: 'asc' }
        },
        reviews: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    res.json(college);
  } catch (error: any) {
    console.error('Error fetching college details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

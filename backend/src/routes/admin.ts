import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

import { requireAdmin } from '../middleware/auth';

// Apply authorization check globally on these sub-routes
router.use(requireAdmin);

// GET /api/admin/reviews
// List pending reviews for moderation
router.get('/reviews', async (req, res) => {
  try {
    const { status = 'PENDING' } = req.query;
    const reviews = await prisma.review.findMany({
      where: {
        status: status as string
      },
      include: {
        college: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(reviews);
  } catch (error: any) {
    console.error('Error fetching admin reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/reviews/:id
// Approve or reject reviews
router.put('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED' });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { status }
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating review status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/colleges
// Nested Prisma transaction for college ingestion
router.post('/colleges', async (req, res) => {
  try {
    const {
      name,
      slug,
      logoUrl,
      coverUrl,
      rating,
      location,
      description,
      fees,
      intake,
      avgPackage,
      highestPackage,
      topRecruiters,
      courses,
      placements,
      cutoffs
    } = req.body;

    if (!name || !slug || !location || !description || fees === undefined || intake === undefined) {
      return res.status(400).json({ error: 'Missing required basic fields (name, slug, location, description, fees, intake)' });
    }

    // Execute nested database operations within a single database transaction
    const college = await prisma.$transaction(async (tx) => {
      const createdCollege = await tx.college.create({
        data: {
          name,
          slug,
          logoUrl: logoUrl || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
          coverUrl: coverUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop&q=80',
          rating: parseFloat(rating || '0'),
          location,
          description,
          fees: parseInt(fees, 10),
          intake: parseInt(intake, 10),
          avgPackage: parseFloat(avgPackage || '0'),
          highestPackage: parseFloat(highestPackage || '0'),
          topRecruiters: topRecruiters || [],
          // Ingest related course records
          courses: {
            create: (courses || []).map((c: any) => ({
              name: c.name,
              fees: parseInt(c.fees, 10),
              duration: parseInt(c.duration, 10)
            }))
          },
          // Ingest placement history
          placements: {
            create: (placements || []).map((p: any) => ({
              year: parseInt(p.year, 10),
              avgPackage: parseFloat(p.avgPackage),
              highestPackage: parseFloat(p.highestPackage)
            }))
          },
          // Ingest exam cutoffs
          cutoffs: {
            create: (cutoffs || []).map((ct: any) => ({
              exam: ct.exam,
              category: ct.category,
              branch: ct.branch,
              round: parseInt(ct.round, 10),
              cutoffRank: parseInt(ct.cutoffRank, 10)
            }))
          }
        }
      });

      return createdCollege;
    });

    res.status(201).json(college);
  } catch (error: any) {
    console.error('Prisma transaction failed:', error);
    res.status(500).json({ error: error.message || 'Transaction aborted due to integration error' });
  }
});

export default router;

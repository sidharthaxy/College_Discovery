import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

// GET /api/colleges
router.get('/', async (req, res) => {
  try {
    const { search, maxFees, location, rating, institutionType, page = 1, limit = 6 } = req.query;

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
        { searchTags: { contains: searchStr, mode: 'insensitive' } },
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

    // 5. Institution Type filter
    if (institutionType && institutionType !== 'All') {
      where.institutionType = institutionType as string;
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

// GET /api/colleges/batch
router.get('/batch', async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ error: 'No IDs provided' });
    }
    
    // ids can be a single string or array of strings (e.g. ?ids=1&ids=2)
    const idsArray = (Array.isArray(ids) ? ids : [ids]) as string[];

    if (idsArray.length === 0) {
      return res.status(400).json({ error: 'Invalid IDs provided' });
    }

    const colleges = await prisma.college.findMany({
      where: {
        id: { in: idsArray }
      }
    });

    res.json(colleges);
  } catch (error: any) {
    console.error('Error fetching batch colleges:', error);
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
        exams: true,
        courses: {
          orderBy: { name: 'asc' }
        },
        placements: {
          orderBy: { year: 'desc' }
        },
        cutoffs: {
          orderBy: { cutoffValue: 'asc' }
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

// ADMIN: Update College Description
router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }
    const { id } = req.params;
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const updated = await prisma.college.update({
      where: { id },
      data: { description }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating college:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ADMIN: Add Course to College
router.post('/:id/courses', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    const { name, duration, fees } = req.body;

    if (!name || !duration || !fees) {
      return res.status(400).json({ error: 'Name, duration, and fees are required' });
    }

    const course = await prisma.course.create({
      data: {
        name,
        duration: parseInt(duration),
        fees: parseInt(fees),
        collegeId: id
      }
    });

    res.json(course);
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ADMIN: Add Placement to College
router.post('/:id/placements', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    const { year, highestPackage, avgPackage } = req.body;

    if (!year || !highestPackage || !avgPackage) {
      return res.status(400).json({ error: 'Year, highest package, and average package are required' });
    }

    const placement = await prisma.placement.create({
      data: {
        year: parseInt(year),
        highestPackage: parseFloat(highestPackage),
        avgPackage: parseFloat(avgPackage),
        collegeId: id
      }
    });

    res.json(placement);
  } catch (error) {
    console.error('Error adding placement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ADMIN: Delete College
router.post('/:id/delete', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required for deletion' });
    }

    const adminUser = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!adminUser || !adminUser.passwordHash) {
      return res.status(403).json({ error: 'Invalid admin state' });
    }

    const isMatch = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    await prisma.college.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting college:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ADMIN: Update Course
router.put('/:id/courses/:courseId', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { id, courseId } = req.params;
    const { name, duration, fees } = req.body;

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(name && { name }),
        ...(duration && { duration: parseInt(duration) }),
        ...(fees && { fees: parseInt(fees) })
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ADMIN: Delete Course
router.delete('/:id/courses/:courseId', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { courseId } = req.params;

    await prisma.course.delete({
      where: { id: courseId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ADMIN: Update Placement
router.put('/:id/placements/:placementId', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { id, placementId } = req.params;
    const { year, highestPackage, avgPackage } = req.body;

    const updated = await prisma.placement.update({
      where: { id: placementId },
      data: {
        ...(year && { year: parseInt(year) }),
        ...(highestPackage && { highestPackage: parseFloat(highestPackage) }),
        ...(avgPackage && { avgPackage: parseFloat(avgPackage) })
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating placement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ADMIN: Delete Placement
router.delete('/:id/placements/:placementId', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { placementId } = req.params;

    await prisma.placement.delete({
      where: { id: placementId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting placement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ADMIN: Update Placement Stats
router.put('/:id/placement-stats', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    const { avgPackage, highestPackage } = req.body;

    const updated = await prisma.college.update({
      where: { id },
      data: {
        ...(avgPackage && { avgPackage: parseFloat(avgPackage) }),
        ...(highestPackage && { highestPackage: parseFloat(highestPackage) })
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating placement stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

// GET /api/profile
// Get user profile including saved colleges and comparisons
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        savedColleges: {
          include: {
            college: true
          },
          orderBy: { createdAt: 'desc' }
        },
        savedComparisons: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/profile/save-college
// Toggle saving/unsaving a college
router.post('/save-college', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { collegeId } = req.body;
    const userId = req.user!.id;

    if (!collegeId) {
      return res.status(400).json({ error: 'collegeId is required' });
    }

    // Check if already saved
    const existing = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId,
          collegeId
        }
      }
    });

    if (existing) {
      // Unsave
      await prisma.savedCollege.delete({
        where: { id: existing.id }
      });
      return res.json({ saved: false });
    } else {
      // Save
      await prisma.savedCollege.create({
        data: {
          userId,
          collegeId
        }
      });
      return res.json({ saved: true });
    }
  } catch (error) {
    console.error('Error toggling saved college:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/profile/save-comparison
// Save a matrix of colleges for comparison
router.post('/save-comparison', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, collegeIds } = req.body;
    const userId = req.user!.id;

    if (!collegeIds || !Array.isArray(collegeIds) || collegeIds.length === 0) {
      return res.status(400).json({ error: 'Valid collegeIds array is required' });
    }

    const comparison = await prisma.savedComparison.create({
      data: {
        userId,
        name: name || 'Custom Comparison',
        collegeIds
      }
    });

    res.json(comparison);
  } catch (error) {
    console.error('Error saving comparison:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/profile/comparison/:id
router.delete('/comparison/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await prisma.savedComparison.deleteMany({
      where: {
        id,
        userId // Ensure they own it
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comparison:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/profile/reviews
router.get('/reviews', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        college: {
          select: { name: true, slug: true, logoUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/profile/reviews/:id
router.delete('/reviews/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    // Ensure review belongs to user
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review || review.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await prisma.review.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/profile/name
router.put('/name', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;
    const userId = req.user!.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() }
    });

    res.json({ name: updatedUser.name });
  } catch (error) {
    console.error('Error updating name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/profile/password
router.put('/password', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Both old and new passwords are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ error: 'Password change not available for this account type' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

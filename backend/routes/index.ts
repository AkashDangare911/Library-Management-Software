import express from 'express';
import bookRoutes from './bookRoutes.js';
import authRoutes from './authRoutes.js';
import borrowRoutes from './borrowRoutes.js';
import adminRoutes from './adminRoutes.js';
import userRoutes from './userRoutes.js';
import reviewRoutes from './reviewRoutes.js';

const router = express.Router();

router.use('/books', bookRoutes);
router.use('/auth', authRoutes);
router.use('/borrowings', borrowRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);

export default router;

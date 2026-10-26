import { Router } from 'express';
import { UploadController } from './upload.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';

const router = Router();

/**
 * @route   POST /api/uploads/presigned-url
 * @desc    Generate secure AWS S3 presigned upload URL for direct media uploads
 * @access  Private (Vendor / Admin)
 */
router.post('/presigned-url', authenticate, requireRole('vendor', 'admin'), UploadController.getPresignedUrl);

export default router;

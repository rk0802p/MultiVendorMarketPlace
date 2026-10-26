import { Router } from 'express';
import { ApiResponse } from '../../utils/apiResponse.js';

const router = Router();

/**
 * @route   POST /api/uploads/presigned-url
 * @desc    Generate secure AWS S3 presigned upload URL for direct client-to-S3 media uploads
 * @access  Private (Vendor / Admin)
 */
router.post('/presigned-url', (req, res) => {
  const fileName = req.body.fileName || 'product-image.jpg';
  const fileType = req.body.fileType || 'image/jpeg';

  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Presigned upload URL generated (Contract Defined)',
    data: {
      uploadUrl: `https://multivendor-marketplace-images.s3.ap-south-1.amazonaws.com/uploads/${Date.now()}-${fileName}?signature=mock_signature`,
      fileUrl: `https://multivendor-marketplace-images.s3.ap-south-1.amazonaws.com/uploads/${Date.now()}-${fileName}`,
      expiresIn: 300,
    },
  });
});

export default router;

import { UploadService } from './upload.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class UploadController {
  /**
   * Request direct presigned S3 upload URL
   */
  static async getPresignedUrl(req, res, next) {
    try {
      const { fileName, fileType } = req.body;

      if (!fileName || !fileType) {
        return ApiResponse.error(res, {
          statusCode: 400,
          message: 'Both fileName and fileType are required.',
        });
      }

      const result = await UploadService.generatePresignedUrl({
        fileName,
        fileType,
        vendorId: req.user.id,
      });

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Presigned upload URL generated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

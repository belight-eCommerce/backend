import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'products' },
        (error, result) => {
          if (error || !result) {
            return reject(
              new InternalServerErrorException('Cloudinary upload failed'),
            );
          }
          resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImageByUrl(url: string): Promise<void> {
    try {
      const publicId = this.extractPublicId(url);
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to delete image: ${err.message}`,
      );
    }
  }

  private extractPublicId(url: string): string {
    const uploadSegment = '/upload/';
    const idx = url.indexOf(uploadSegment);
    if (idx === -1) {
      throw new Error('Invalid Cloudinary URL');
    }

    let publicPath = url.substring(idx + uploadSegment.length);
    const lastDot = publicPath.lastIndexOf('.');
    if (lastDot !== -1) {
      publicPath = publicPath.substring(0, lastDot);
    }
    return publicPath;
  }
}

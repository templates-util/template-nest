import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';

@Injectable()
export class FileUploadService {
  private readonly s3: S3;

  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  uploadFile() {
    return multer({
      storage: multerS3({
        s3: this.s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        acl: 'public-read',
        key: (req, file, cb) => {
          const fileName = `${Date.now()}-${file.originalname}`;
          cb(null, fileName);
        },
      }),
    });
  }
}

import { IStorageService } from './IStorageService';

// Staged implementation for future S3 integration (e.g. AWS S3, Cloudflare R2, DigitalOcean Spaces)
// To swap, install @aws-sdk/client-s3 and import them:
// import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export class S3StorageService implements IStorageService {
  private bucketName: string;
  private region: string;
  private endpointUrl?: string; // For Custom S3 providers like Cloudflare R2 / DO Spaces

  constructor(bucketName: string, region: string, endpointUrl?: string) {
    this.bucketName = bucketName;
    this.region = region;
    this.endpointUrl = endpointUrl;
    
    // this.s3Client = new S3Client({
    //   region: this.region,
    //   endpoint: this.endpointUrl,
    //   credentials: {
    //     accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    //     secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    //   }
    // });
  }

  async uploadFile(file: Buffer, filename: string, mimeType: string): Promise<string> {
    // const command = new PutObjectCommand({
    //   Bucket: this.bucketName,
    //   Key: filename,
    //   Body: file,
    //   ContentType: mimeType,
    // });
    // await this.s3Client.send(command);
    
    const host = this.endpointUrl 
      ? this.endpointUrl.replace('https://', '') 
      : `s3.${this.region}.amazonaws.com`;
    return `https://${this.bucketName}.${host}/${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const filename = pathBasename(fileUrl);
    // const command = new DeleteObjectCommand({
    //   Bucket: this.bucketName,
    //   Key: filename,
    // });
    // await this.s3Client.send(command);
  }

  getFileUrl(filename: string): string {
    const host = this.endpointUrl 
      ? this.endpointUrl.replace('https://', '') 
      : `s3.${this.region}.amazonaws.com`;
    return `https://${this.bucketName}.${host}/${filename}`;
  }
}

function pathBasename(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(urlObj.pathname.lastIndexOf('/') + 1);
  } catch {
    return url.substring(url.lastIndexOf('/') + 1);
  }
}

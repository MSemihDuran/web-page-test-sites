"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageService = void 0;
// Staged implementation for future S3 integration (e.g. AWS S3, Cloudflare R2, DigitalOcean Spaces)
// To swap, install @aws-sdk/client-s3 and import them:
// import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
class S3StorageService {
    bucketName;
    region;
    endpointUrl; // For Custom S3 providers like Cloudflare R2 / DO Spaces
    constructor(bucketName, region, endpointUrl) {
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
    async uploadFile(file, filename, mimeType) {
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
    async deleteFile(fileUrl) {
        const filename = pathBasename(fileUrl);
        // const command = new DeleteObjectCommand({
        //   Bucket: this.bucketName,
        //   Key: filename,
        // });
        // await this.s3Client.send(command);
    }
    getFileUrl(filename) {
        const host = this.endpointUrl
            ? this.endpointUrl.replace('https://', '')
            : `s3.${this.region}.amazonaws.com`;
        return `https://${this.bucketName}.${host}/${filename}`;
    }
}
exports.S3StorageService = S3StorageService;
function pathBasename(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.pathname.substring(urlObj.pathname.lastIndexOf('/') + 1);
    }
    catch {
        return url.substring(url.lastIndexOf('/') + 1);
    }
}

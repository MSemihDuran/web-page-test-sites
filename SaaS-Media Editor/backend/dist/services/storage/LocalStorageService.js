"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class LocalStorageService {
    uploadDir;
    baseUrl;
    constructor(uploadDir, baseUrl) {
        this.uploadDir = uploadDir;
        this.baseUrl = baseUrl;
        if (!fs_1.default.existsSync(this.uploadDir)) {
            fs_1.default.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async uploadFile(file, filename, mimeType) {
        const filePath = path_1.default.join(this.uploadDir, filename);
        await fs_1.default.promises.writeFile(filePath, file);
        return `${this.baseUrl}/uploads/${filename}`;
    }
    async deleteFile(fileUrl) {
        try {
            const filename = path_1.default.basename(fileUrl);
            const filePath = path_1.default.join(this.uploadDir, filename);
            if (fs_1.default.existsSync(filePath)) {
                await fs_1.default.promises.unlink(filePath);
            }
        }
        catch (error) {
            console.error('Error deleting local file:', error);
        }
    }
    getFileUrl(filename) {
        return `${this.baseUrl}/uploads/${filename}`;
    }
}
exports.LocalStorageService = LocalStorageService;

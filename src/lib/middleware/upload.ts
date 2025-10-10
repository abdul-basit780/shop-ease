// lib/middleware/upload.ts
import { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import { IMAGE_CONFIG } from "../utils/product";
import path from "path";
import fs from "fs/promises";

export interface FileUploadRequest extends NextApiRequest {
  fields?: Fields;
  files?: Files;
}

// Ensure upload directory exists
export const ensureUploadDirectory = async (dirPath: string) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Parse multipart form data
export const parseFormData = async (
  req: NextApiRequest
): Promise<{ fields: any; files: any }> => {
  const uploadDir = path.join(process.cwd(), IMAGE_CONFIG.UPLOAD_DIR);
  await ensureUploadDirectory(uploadDir);

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: IMAGE_CONFIG.MAX_SIZE,
    filter: (part) => {
      // Only accept image files
      return part.mimetype?.startsWith("image/") || false;
    },
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

// Clean up uploaded files on error
export const cleanupUploadedFiles = async (files: any) => {
  if (!files) return;

  const filesToDelete: string[] = [];

  // Collect all file paths
  Object.values(files).forEach((file: any) => {
    if (Array.isArray(file)) {
      file.forEach((f: any) => {
        if (f.filepath) filesToDelete.push(f.filepath);
      });
    } else if (file?.filepath) {
      filesToDelete.push(file.filepath);
    }
  });

  // Delete all files
  await Promise.all(
    filesToDelete.map(async (filepath) => {
      try {
        await fs.unlink(filepath);
      } catch (error) {
        console.error(`Failed to delete file ${filepath}:`, error);
      }
    })
  );
};

// next.config.js additions for serving static files
export const nextConfigAdditions = `
// Add this to your next.config.js
module.exports = {
  // ... other config
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
};
`;

// pages/api/uploads/[...path].ts - Static file server
export const staticFileServerCode = `
// pages/api/uploads/[...path].ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path: pathArray } = req.query;
  
  if (!Array.isArray(pathArray)) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  const filePath = path.join(process.cwd(), 'public', 'uploads', ...pathArray);

  // Security: Prevent directory traversal
  const resolvedPath = path.resolve(filePath);
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  
  if (!resolvedPath.startsWith(uploadsDir)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Get file stats
  const stat = fs.statSync(filePath);
  
  if (!stat.isFile()) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Set appropriate headers
  const ext = path.extname(filePath).toLowerCase();
  const contentType = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  }[ext] || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

  // Stream the file
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
}
`;

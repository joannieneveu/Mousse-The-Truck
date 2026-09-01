import type React from 'react';

/**
 * Helper to process photos dragged from iPhoto (Apple Photos) or computer folders
 */

export interface ProcessedPhoto {
  id: string;
  file?: File;
  name: string;
  cleanTitle: string;
  dataUrl: string;
  type: 'image' | 'video';
  sizeBytes: number;
  formattedSize: string;
  lastModifiedDate: string;
}

/**
 * Clean up a raw filename into a human-readable title
 * e.g., "IMG_4920.JPEG" -> "Expedition Capture 4920"
 * "2026-08-Dempster-Henri.jpg" -> "Dempster Henri"
 */
export function cleanFileNameToTitle(filename: string): string {
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Replace underscores and dashes with spaces
  let cleaned = withoutExt
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If it's standard camera naming like IMG 1234 or DSC 5678
  if (/^(img|dsc|dji|gopr|mov|pasted image)\s*\d+$/i.test(cleaned)) {
    cleaned = cleaned.replace(/^(img|dsc|dji|gopr|mov|pasted image)\s*/i, 'Expedition Photo ');
  }

  // Capitalize words
  cleaned = cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return cleaned || 'Expedition Photo';
}

/**
 * Formats bytes to readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Optimizes an image (resizes if greater than max dimension to prevent UI lag/memory issues)
 */
export async function readFileAsOptimizedDataUrl(file: File, maxDimension: number = 1920): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's a video, just read as data URL
    if (file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        resolve('');
        return;
      }

      // If file is small (< 1MB), no need to scale down
      if (file.size < 1024 * 1024) {
        resolve(rawDataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL(file.type || 'image/jpeg', 0.88));
            return;
          }
        }
        resolve(rawDataUrl);
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Process a collection of Files or DragEvent items from iPhoto or Desktop Folders
 */
export async function extractPhotosFromDropEvent(
  e: React.DragEvent | DragEvent
): Promise<ProcessedPhoto[]> {
  const files: File[] = [];

  // Check files list from DataTransfer
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const file = e.dataTransfer.files[i];
      // Accept images and videos
      if (file.type.startsWith('image/') || file.type.startsWith('video/') || /\.(jpg|jpeg|png|heic|webp|gif|mov|mp4)$/i.test(file.name)) {
        files.push(file);
      }
    }
  } 
  // Fallback to items if files list is empty
  else if (e.dataTransfer?.items) {
    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      const item = e.dataTransfer.items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }
  }

  const processedList: ProcessedPhoto[] = [];

  for (const file of files) {
    try {
      const dataUrl = await readFileAsOptimizedDataUrl(file);
      const isVideo = file.type.startsWith('video/') || /\.(mov|mp4|webm)$/i.test(file.name);
      
      processedList.push({
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        cleanTitle: cleanFileNameToTitle(file.name),
        dataUrl,
        type: isVideo ? 'video' : 'image',
        sizeBytes: file.size,
        formattedSize: formatBytes(file.size),
        lastModifiedDate: file.lastModified 
          ? new Date(file.lastModified).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      });
    } catch (err) {
      console.error(`Failed to process dropped photo ${file.name}:`, err);
    }
  }

  return processedList;
}

/**
 * Process files from an `<input type="file" multiple>` change event
 */
export async function extractPhotosFromFileInput(
  e: React.ChangeEvent<HTMLInputElement>
): Promise<ProcessedPhoto[]> {
  const files = e.target.files;
  if (!files || files.length === 0) return [];

  const processedList: ProcessedPhoto[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const dataUrl = await readFileAsOptimizedDataUrl(file);
      const isVideo = file.type.startsWith('video/') || /\.(mov|mp4|webm)$/i.test(file.name);
      
      processedList.push({
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        cleanTitle: cleanFileNameToTitle(file.name),
        dataUrl,
        type: isVideo ? 'video' : 'image',
        sizeBytes: file.size,
        formattedSize: formatBytes(file.size),
        lastModifiedDate: file.lastModified 
          ? new Date(file.lastModified).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      });
    } catch (err) {
      console.error(`Failed to process photo from input ${file.name}:`, err);
    }
  }

  return processedList;
}

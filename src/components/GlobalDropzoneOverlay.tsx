import React, { useState, useEffect } from 'react';
import { 
  extractPhotosFromDropEvent, 
  ProcessedPhoto 
} from '../utils/photoDropHelper';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Image as ImageIcon,
  FolderOpen
} from 'lucide-react';

interface GlobalDropzoneOverlayProps {
  onPhotosDropped: (photos: ProcessedPhoto[]) => void;
  isAdmin?: boolean;
}

export const GlobalDropzoneOverlay: React.FC<GlobalDropzoneOverlayProps> = ({
  onPhotosDropped,
  isAdmin = true
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [dragCounter, setDragCounter] = useState<number>(0);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      // Check if drag event has files
      if (e.dataTransfer?.types && Array.from(e.dataTransfer.types).includes('Files')) {
        setDragCounter(prev => prev + 1);
        setIsDraggingOver(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setDragCounter(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setIsDraggingOver(false);
          return 0;
        }
        return next;
      });
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      setDragCounter(0);

      const photos = await extractPhotosFromDropEvent(e);
      if (photos && photos.length > 0) {
        onPhotosDropped(photos);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [onPhotosDropped]);

  if (!isDraggingOver) return null;

  return (
    <div 
      id="global-drag-drop-overlay"
      className="fixed inset-0 z-50 pointer-events-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-150"
    >
      <div className="max-w-xl w-full border-3 border-dashed border-blue-400 bg-white/95 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl transform scale-102 transition">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-900 text-white flex items-center justify-center shadow-lg animate-bounce">
          <Upload className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-950 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Photo & Video Upload</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Drop Photos Here to Upload
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 font-sans max-w-md mx-auto leading-relaxed">
            Release your photos from <strong>iPhoto</strong>, <strong>Apple Photos</strong>, or your <strong>computer folders</strong> to add them to the expedition archive.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-stone-500 font-sans pt-2">
          <span className="flex items-center gap-1 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
            <ImageIcon className="w-4 h-4 text-blue-900" /> JPEG, PNG, HEIC, WebP
          </span>
          <span className="flex items-center gap-1 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
            <FolderOpen className="w-4 h-4 text-amber-800" /> Multi-photo drag supported
          </span>
        </div>
      </div>
    </div>
  );
};

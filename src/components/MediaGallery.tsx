import React, { useState, useEffect } from 'react';
import { 
  MediaItem, 
  JourneyLeg,
  UserProfile,
  CommentItem
} from '../types';
import { 
  Camera, 
  Video, 
  Upload, 
  Plus, 
  Play, 
  Image as ImageIcon, 
  MapPin, 
  Tag, 
  X, 
  Check, 
  Maximize2, 
  Film,
  Calendar,
  User,
  Heart,
  RefreshCw,
  Compass,
  ArrowUpDown,
  Sparkles,
  MessageSquare,
  Send,
  Trash2,
  FolderOpen,
  Layers,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BatchPhotoUploadModal } from './BatchPhotoUploadModal';
import { 
  extractPhotosFromDropEvent, 
  extractPhotosFromFileInput, 
  readFileAsOptimizedDataUrl, 
  cleanFileNameToTitle,
  ProcessedPhoto 
} from '../utils/photoDropHelper';

interface MediaGalleryProps {
  media: MediaItem[];
  currentUser?: UserProfile | null;
  onUploadMedia: (newMedia: Partial<MediaItem>) => Promise<void>;
  onUploadBatchMedia?: (items: Partial<MediaItem>[]) => Promise<void>;
  onUpdateMedia?: (mediaId: string, updatedData: Partial<MediaItem>) => Promise<void>;
  onDeleteMedia?: (mediaId: string) => Promise<void>;
  onViewLocationOnMap?: (lat?: number, lng?: number) => void;
  onOpenAuthModal?: () => void;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  media,
  currentUser,
  onUploadMedia,
  onUploadBatchMedia,
  onUpdateMedia,
  onDeleteMedia,
  onViewLocationOnMap,
  onOpenAuthModal,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [likedMediaIds, setLikedMediaIds] = useState<Record<string, boolean>>({});

  // Edit media & caption modal state
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCaption, setEditCaption] = useState<string>('');
  const [editLocation, setEditLocation] = useState<string>('');
  const [editTags, setEditTags] = useState<string>('');
  const [editJourneyLeg, setEditJourneyLeg] = useState<JourneyLeg>('arctic_yukon');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  const openEditModal = (item: MediaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingMedia(item);
    setEditTitle(item.title);
    setEditCaption(item.caption || '');
    setEditLocation(item.locationName || '');
    setEditTags(item.tags ? item.tags.join(', ') : '');
    setEditJourneyLeg(item.journeyLeg || 'arctic_yukon');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;

    setIsSavingEdit(true);
    try {
      const parsedTags = editTags
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const updatedData: Partial<MediaItem> = {
        title: editTitle.trim() || 'Expedition Media',
        caption: editCaption.trim(),
        locationName: editLocation.trim() || editingMedia.locationName,
        tags: parsedTags.length > 0 ? parsedTags : editingMedia.tags,
        journeyLeg: editJourneyLeg
      };

      if (onUpdateMedia) {
        await onUpdateMedia(editingMedia.id, updatedData);
      }

      if (activeMedia && activeMedia.id === editingMedia.id) {
        setActiveMedia({
          ...activeMedia,
          ...updatedData
        });
      }

      setEditingMedia(null);
    } catch (err) {
      console.error('Failed to save media edit:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteMediaItem = async (mediaId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onDeleteMedia) return;
    if (window.confirm('Are you sure you want to delete this media item?')) {
      await onDeleteMedia(mediaId);
      if (activeMedia?.id === mediaId) setActiveMedia(null);
      if (editingMedia?.id === mediaId) setEditingMedia(null);
    }
  };
  const [mediaList, setMediaList] = useState<MediaItem[]>(media);

  // Batch Drag & Drop Upload State
  const [batchPhotosToUpload, setBatchPhotosToUpload] = useState<ProcessedPhoto[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [isHeroDragging, setIsHeroDragging] = useState<boolean>(false);

  // Comments for Active Media
  const [mediaComments, setMediaComments] = useState<CommentItem[]>([]);
  const [commentInput, setCommentInput] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [isPostingComment, setIsPostingComment] = useState<boolean>(false);

  // Sync state if prop changes
  useEffect(() => {
    setMediaList(media);
  }, [media]);

  // Load comments whenever activeMedia opens
  useEffect(() => {
    if (activeMedia) {
      fetch(`/api/comments?targetId=${activeMedia.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setMediaComments(data);
        })
        .catch(() => {
          setMediaComments([]);
        });
    } else {
      setMediaComments([]);
    }
  }, [activeMedia]);

  const handlePostMediaComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMedia || !commentInput.trim()) return;

    setIsPostingComment(true);
    const author = guestName.trim() || (currentUser ? currentUser.name : 'Guest Friend');
    const content = commentInput.trim();

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: activeMedia.id,
          targetType: 'media',
          content,
          authorName: author
        })
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setMediaComments(prev => [data.comment, ...prev]);
        setCommentInput('');
        setIsPostingComment(false);
        return;
      }
    } catch (err) {
      // static fallback
    }

    const localComment: CommentItem = {
      id: `comment-media-${Date.now()}`,
      targetId: activeMedia.id,
      targetType: 'media',
      authorName: author,
      content,
      createdAt: 'Just now',
      likes: 0
    };
    setMediaComments(prev => [localComment, ...prev]);
    setCommentInput('');
    setIsPostingComment(false);
  };

  const handleDeleteMediaComment = async (commentId: string) => {
    if (window.confirm('Remove this comment as administrator?')) {
      try {
        await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      } catch (err) {
        // static fallback
      }
      setMediaComments(prev => prev.filter(c => c.id !== commentId));
    }
  };

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image');
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [uploadCaption, setUploadCaption] = useState<string>('');
  const [uploadLocation, setUploadLocation] = useState<string>('Pelly Crossing & Heading to Dawson City, Yukon');
  const [uploadAuthor, setUploadAuthor] = useState<string>('Joannie & Barton');
  const [uploadTagInput, setUploadTagInput] = useState<string>('Henri, Mousse, Yukon, Expedition');
  const [uploadJourneyLeg, setUploadJourneyLeg] = useState<JourneyLeg>('arctic_yukon');
  const [isSingleDragging, setIsSingleDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSingleFileSelect = async (file: File) => {
    try {
      const dataUrl = await readFileAsOptimizedDataUrl(file);
      setUploadUrl(dataUrl);
      if (!uploadTitle) {
        setUploadTitle(cleanFileNameToTitle(file.name));
      }
      if (file.type.startsWith('video/')) {
        setUploadType('video');
      } else {
        setUploadType('image');
      }
    } catch (err) {
      console.error('Error processing file:', err);
    }
  };

  const handleSingleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSingleFileSelect(e.target.files[0]);
    }
  };

  const handleSingleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSingleDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSingleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Preset demo images
  const PRESET_DEMO_IMAGES = [
    { title: 'Henri on the Dempster Tundra', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80', loc: 'Dempster Highway, Yukon' },
    { title: 'Salmon Glacier Panoramic Sunset', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', loc: 'Stewart-Cassiar, BC' },
    { title: 'Tuktoyaktuk Arctic Waves', url: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1200&q=80', loc: 'Beaufort Sea, NWT' },
    { title: 'Emerald Lake Canoe Reflection', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', loc: 'Yoho National Park' },
  ];

  // Extract all unique tags
  const allTags = Array.from(new Set(mediaList.flatMap(m => m.tags)));

  // Filter and sort media items
  const filteredMedia = mediaList.filter(item => {
    const matchType = filterType === 'all' || item.type === filterType;
    const matchTag = selectedTag === 'all' || item.tags.includes(selectedTag);
    return matchType && matchTag;
  }).sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.likesCount || 0) - (a.likesCount || 0);
    }
    return 0;
  });

  const handleLikeMedia = async (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    const isLiked = likedMediaIds[item.id];
    setLikedMediaIds(prev => ({ ...prev, [item.id]: !isLiked }));
    setMediaList(prev => prev.map(m => {
      if (m.id === item.id) {
        return { ...m, likesCount: (m.likesCount || 0) + (isLiked ? -1 : 1) };
      }
      return m;
    }));

    if (!isLiked) {
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.7 }
      });
    }

    try {
      await fetch(`/api/media/${item.id}/like`, { method: 'POST' });
    } catch (err) {
      // ignore
    }
  };

  const handleDropOnGalleryHero = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHeroDragging(false);
    const photos = await extractPhotosFromDropEvent(e);
    if (photos.length > 0) {
      setBatchPhotosToUpload(photos);
      setIsBatchModalOpen(true);
    }
  };

  const handleFileInputBatch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const photos = await extractPhotosFromFileInput(e);
    if (photos.length > 0) {
      setBatchPhotosToUpload(photos);
      setIsBatchModalOpen(true);
    }
  };

  const handleExecuteBatchUpload = async (items: Partial<MediaItem>[]) => {
    if (onUploadBatchMedia) {
      await onUploadBatchMedia(items);
    } else {
      for (const item of items) {
        await onUploadMedia(item);
      }
    }
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const tagsArray = uploadTagInput
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      let finalUrl = uploadUrl;
      // Try to save image to server disk if base64 dataUrl
      if (uploadUrl && uploadUrl.startsWith('data:')) {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              dataUrl: uploadUrl, 
              title: uploadTitle 
            })
          });
          const data = await res.json();
          if (data.success && data.url) {
            finalUrl = data.url;
          }
        } catch (e) {
          // fallback to dataUrl
        }
      }

      await onUploadMedia({
        title: uploadTitle.trim(),
        type: uploadType,
        url: finalUrl,
        thumbnailUrl: finalUrl,
        caption: uploadCaption.trim(),
        locationName: uploadLocation.trim() || 'Expedition Route',
        country: 'Canada',
        tags: tagsArray.length > 0 ? tagsArray : ['Expedition 2026'],
        author: currentUser ? currentUser.name : (uploadAuthor || 'Joannie & Barton'),
        journeyLeg: uploadJourneyLeg,
        likesCount: 0
      });

      setIsUploadModalOpen(false);
      setUploadTitle('');
      setUploadUrl('');
      setUploadCaption('');
      
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="media-gallery-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-widest mb-1.5 font-sans">
            <Camera className="w-4 h-4" />
            <span>Visual Expedition Archives</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Photo & Video Gallery
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-2xl font-serif leading-relaxed">
            Every vista, tundra crossing, campsite morning, and milestone captured throughout our journey across the Americas.
          </p>
        </div>

        {/* Admin-only Upload Actions in Header */}
        {currentUser?.isAdmin && (
          <div className="flex items-center gap-2.5">
            <label className="cursor-pointer bg-blue-900 hover:bg-blue-950 text-white font-medium px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition self-start md:self-auto font-sans">
              <FolderOpen className="w-4 h-4" />
              <span>Upload From Files / iPhoto</span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileInputBatch}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-medium px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-2xs transition self-start md:self-auto font-sans"
            >
              <Upload className="w-4 h-4 text-stone-600" />
              <span>Single Upload</span>
            </button>
          </div>
        )}
      </div>

      {/* DRAG & DROP PHOTO DROPZONE HERO BANNER (Admin Only) */}
      {currentUser?.isAdmin && (
        <div
          id="gallery-drag-dropzone"
          onDragOver={(e) => {
            e.preventDefault();
            setIsHeroDragging(true);
          }}
          onDragLeave={() => setIsHeroDragging(false)}
          onDrop={handleDropOnGalleryHero}
          className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition p-6 sm:p-8 text-center font-sans ${
            isHeroDragging 
              ? 'border-blue-900 bg-blue-50/90 scale-101 shadow-lg' 
              : 'border-stone-300 bg-white/80 hover:bg-white hover:border-stone-400 shadow-2xs'
          }`}
        >
          <div className="max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center shadow-xs">
              <Layers className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                {isHeroDragging ? '✨ Release Photos to Upload Batch!' : 'Drag & Drop Photos Directly From iPhoto or Computer Folders'}
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
                Drag one or multiple photos directly onto this screen from your Mac's <strong>iPhoto / Apple Photos library</strong>, desktop folders, or phone backup.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <label className="cursor-pointer px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition">
                <FolderOpen className="w-4 h-4" />
                <span>Select Photos from Computer</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileInputBatch}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium border border-stone-200 transition"
              >
                Paste Web Image URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-stone-200/90 p-4 rounded-3xl space-y-3 shadow-sm font-sans">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Media Type Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              All Media ({mediaList.length})
            </button>
            <button
              onClick={() => setFilterType('image')}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition ${
                filterType === 'image'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photos ({mediaList.filter(m => m.type === 'image').length})</span>
            </button>
            <button
              onClick={() => setFilterType('video')}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition ${
                filterType === 'video'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos ({mediaList.filter(m => m.type === 'video').length})</span>
            </button>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FAF8F5] border border-stone-200 text-stone-800 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-900"
            >
              <option value="newest">Chronological (Newest)</option>
              <option value="popular">Most Cheered</option>
            </select>
          </div>
        </div>

        {/* Tags filter pills */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 text-xs scrollbar-none">
            <span className="text-stone-400 text-xs font-medium mr-1 shrink-0">Tags:</span>
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1 rounded-full text-xs transition shrink-0 ${
                selectedTag === 'all'
                  ? 'bg-blue-900 text-white font-medium'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Tags
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs transition shrink-0 ${
                  selectedTag === tag
                    ? 'bg-blue-900 text-white font-medium'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Media */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedia.map((item) => {
          const isLiked = likedMediaIds[item.id];
          return (
            <div
              key={item.id}
              onClick={() => setActiveMedia(item)}
              className="group bg-white border border-stone-200/90 hover:border-stone-300 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video overflow-hidden bg-stone-100">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                  
                  {item.type === 'video' && (
                    <div className="absolute inset-0 bg-stone-900/30 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 text-stone-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                        <Play className="w-5 h-5 fill-stone-900 ml-0.5" />
                      </div>
                    </div>
                  )}

                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider">
                    {item.type}
                  </span>

                  <button
                    onClick={(e) => handleLikeMedia(e, item)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-sm transition flex items-center gap-1 text-xs"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                    <span className="text-[11px] font-medium">{item.likesCount || 0}</span>
                  </button>
                </div>

                <div className="p-5 space-y-2 font-sans">
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="truncate max-w-[170px] text-stone-700 font-medium">📍 {item.locationName}</span>
                    <span>{item.date}</span>
                  </div>

                  <h3 className="font-serif font-bold text-stone-900 text-base leading-snug group-hover:text-blue-900 transition">
                    {item.title}
                  </h3>

                  {item.caption && (
                    <p className="text-xs text-stone-600 font-serif line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  )}

                  {currentUser?.isAdmin && (
                    <div className="pt-1.5 flex justify-end">
                      <button
                        onClick={(e) => openEditModal(item, e)}
                        className="text-blue-900 hover:text-blue-950 font-sans font-semibold text-[11px] flex items-center gap-1 hover:underline"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Caption</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 space-y-3 font-sans">
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setActiveMedia(item)}
                    className="inline-flex items-center gap-1.5 text-blue-900 hover:text-blue-950 font-semibold text-xs transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Leave a comment</span>
                  </button>
                  <span className="text-[11px] text-stone-400">Click photo to view & comment</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-20 bg-white border border-stone-200 rounded-3xl p-8 text-stone-500 space-y-3 font-sans">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-bold text-stone-900">Photo & Video Gallery is Empty</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            Photos and videos will appear here as Joannie & Barton capture and upload milestones along the 35,000 km expedition in Mousse!
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow-xs transition mt-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload First Photo</span>
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-stone-300 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-stone-800 space-y-5 my-8 font-sans">
            
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-900 text-white">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">Upload Photo or Video</h3>
                  <p className="text-xs text-stone-500">Add to the family expedition visual archive.</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Baby Henri seeing the Pacific Ocean"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Media Type
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-blue-900"
                  >
                    <option value="image">Photo (Image)</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Location Name
                  </label>
                  <input
                    type="text"
                    value={uploadLocation}
                    onChange={(e) => setUploadLocation(e.target.value)}
                    placeholder="e.g. Olympic Peninsula, WA"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Image or Video URL *
                </label>
                <input
                  type="url"
                  required
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or https://..."
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              {/* Sample Presets */}
              <div className="space-y-1.5 bg-stone-100/70 p-3 rounded-2xl border border-stone-200">
                <div className="text-[11px] font-semibold text-stone-600">Quick Test Presets:</div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_DEMO_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setUploadTitle(preset.title);
                        setUploadUrl(preset.url);
                        setUploadLocation(preset.loc);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-[11px] text-stone-700 transition"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={uploadTagInput}
                  onChange={(e) => setUploadTagInput(e.target.value)}
                  placeholder="Henri, Sabbatical, Overland, Nature"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Caption / Notes
                </label>
                <textarea
                  rows={2}
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="What was happening during this moment..."
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !uploadUrl.trim()}
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Uploading...' : 'Publish to Gallery'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeMedia && (
        <div 
          onClick={() => setActiveMedia(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm cursor-pointer animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] border border-stone-200 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-4 p-6 font-sans"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-900">
              <img
                src={activeMedia.url}
                alt={activeMedia.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-xl text-stone-900">{activeMedia.title}</h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700 uppercase">
                    {activeMedia.type}
                  </span>
                  {currentUser?.isAdmin && (
                    <button
                      onClick={(e) => openEditModal(activeMedia, e)}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 transition shadow-xs ml-2"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Caption</span>
                    </button>
                  )}
                </div>
                <div className="text-xs text-stone-500 flex items-center gap-2">
                  <span>📍 {activeMedia.locationName}</span>
                  <span>•</span>
                  <span>📅 {activeMedia.date}</span>
                  <span>•</span>
                  <span>By {activeMedia.author}</span>
                </div>
                {activeMedia.caption && (
                  <p className="text-xs text-stone-700 font-serif pt-1 leading-relaxed bg-white p-3 rounded-xl border border-stone-200">
                    {activeMedia.caption}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onViewLocationOnMap && activeMedia.coordinates && (
                  <button
                    onClick={() => {
                      onViewLocationOnMap(activeMedia.coordinates?.lat, activeMedia.coordinates?.lng);
                      setActiveMedia(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-950 text-xs font-medium border border-blue-200"
                  >
                    View On Map
                  </button>
                )}
                <button
                  onClick={() => setActiveMedia(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-4 py-1.5 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Comments Thread on Photo/Media */}
            <div className="pt-4 border-t border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-serif font-bold text-stone-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-900" />
                  <span>Comments & Notes ({mediaComments.length})</span>
                </h4>
                <span className="text-[11px] text-stone-500">
                  Guests can leave comments • Admins can moderate
                </span>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handlePostMediaComment} className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="grid grid-cols-1 gap-2.5">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1 text-[11px]">
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Grandma Sarah, Riley, Cousin David"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1 text-[11px]">
                      Your Comment <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Leave a comment or question about this photo..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-blue-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-stone-400 text-[11px]">
                    {guestName.trim() ? `Posting as: ${guestName.trim()}` : 'No login required'}
                  </span>
                  <button
                    type="submit"
                    disabled={isPostingComment || !commentInput.trim() || !guestName.trim()}
                    className="bg-blue-900 hover:bg-blue-950 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post Comment</span>
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {mediaComments.length === 0 ? (
                  <div className="text-center py-4 text-xs text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                    No comments yet. Leave the first thought on this photo!
                  </div>
                ) : (
                  mediaComments.map((comment) => (
                    <div key={comment.id} className="bg-white border border-stone-200/90 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-[9px]">
                            {comment.authorName ? comment.authorName.charAt(0) : 'G'}
                          </div>
                          <span className="font-semibold text-stone-900">{comment.authorName}</span>
                          {comment.authorRoleLabel && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">
                              {comment.authorRoleLabel}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-stone-400 text-[10px]">
                          <span>{comment.createdAt}</span>
                          {currentUser?.isAdmin && (
                            <button
                              onClick={() => handleDeleteMediaComment(comment.id)}
                              className="text-stone-400 hover:text-rose-600 ml-1 p-0.5"
                              title="Remove inappropriate comment (Admin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-stone-700 pl-7 leading-relaxed font-sans">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Admin Edit Media & Caption Modal */}
      {editingMedia && (
        <div 
          onClick={() => setEditingMedia(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] border border-stone-300 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-stone-800 space-y-5 my-8 font-sans"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-white">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">Edit Caption & Media</h3>
                  <p className="text-xs text-stone-500">Administrator controls for expedition photos and videos.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingMedia(null)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Image Preview */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-200 border border-stone-300">
                <img
                  src={editingMedia.url}
                  alt={editTitle}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Caption under Picture *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="Enter the descriptive caption for this photograph..."
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-blue-900 text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Location Name
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. St. John's, NL"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Expedition Leg
                  </label>
                  <select
                    value={editJourneyLeg}
                    onChange={(e) => setEditJourneyLeg(e.target.value as any)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
                  >
                    <option value="atlantic_canada">Atlantic Canada</option>
                    <option value="trans_canada_prairies">Trans-Canada & Prairies</option>
                    <option value="arctic_yukon">Arctic & Yukon</option>
                    <option value="alaska_highway">Alaska Highway</option>
                    <option value="rockies_pacific">Rockies & Pacific</option>
                    <option value="baja_mexico">Baja & Mexico</option>
                    <option value="central_america">Central America</option>
                    <option value="andes_south_america">Andes & South America</option>
                    <option value="patagonia_tierradelfuego">Patagonia & Fin del Mundo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="e.g. Mousse, Solar, Henri, Arctic"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                {onDeleteMedia ? (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteMediaItem(editingMedia.id, e)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Media</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMedia(null)}
                    className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSavingEdit ? 'Saving...' : 'Save Caption'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Photo Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">Upload Photo to Expedition Gallery</h3>
                  <p className="text-[11px] text-stone-500">Add directly from your computer, phone, or iPhoto</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadUrl('');
                  setUploadTitle('');
                  setUploadCaption('');
                }}
                className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs">
              
              {/* File Dropzone & Selector */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Photo File (Drag & Drop or Choose File)
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsSingleDragging(true);
                  }}
                  onDragLeave={() => setIsSingleDragging(false)}
                  onDrop={handleSingleDrop}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition ${
                    isSingleDragging 
                      ? 'border-blue-800 bg-blue-50/80' 
                      : 'border-stone-300 bg-white hover:border-stone-400'
                  }`}
                >
                  {uploadUrl ? (
                    <div className="space-y-2">
                      <div className="relative inline-block max-h-48 rounded-xl overflow-hidden border border-stone-200 shadow-xs">
                        <img 
                          src={uploadUrl} 
                          alt="Preview" 
                          className="max-h-44 w-auto object-contain mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadUrl('')}
                          className="absolute top-2 right-2 p-1 bg-stone-900/80 hover:bg-rose-600 text-white rounded-full transition"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Photo loaded & ready to publish
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-3">
                      <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5" />
                      </div>
                      <div className="text-stone-700">
                        <span className="font-semibold">Drag & drop photo here</span> or{' '}
                        <label className="text-blue-900 hover:text-blue-950 font-bold underline cursor-pointer">
                          browse from computer
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleSingleFileInputChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-stone-500">Supports JPEG, PNG, HEIC, WebP, and MP4 videos</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Or Web URL Input */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Or Paste Photo Web URL / Path
                </label>
                <input
                  type="text"
                  value={uploadUrl.startsWith('data:') ? '[Selected from computer]' : uploadUrl}
                  onChange={(e) => {
                    if (!uploadUrl.startsWith('data:')) {
                      setUploadUrl(e.target.value);
                    }
                  }}
                  placeholder="https://... or /filename.jpeg"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Henri Exploring the Yukon River at Sunset"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-blue-900 font-medium"
                />
              </div>

              {/* Caption Under Picture */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Caption (Story under the picture)
                </label>
                <textarea
                  rows={3}
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="Describe the moment, family story, or campsite details..."
                  className="w-full bg-white border border-stone-300 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-blue-900 resize-none leading-relaxed"
                />
              </div>

              {/* Location & Journey Leg */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Location Name
                  </label>
                  <input
                    type="text"
                    value={uploadLocation}
                    onChange={(e) => setUploadLocation(e.target.value)}
                    placeholder="e.g. Dawson City, Yukon"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-blue-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Journey Leg
                  </label>
                  <select
                    value={uploadJourneyLeg}
                    onChange={(e) => setUploadJourneyLeg(e.target.value as JourneyLeg)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-blue-900"
                  >
                    <option value="arctic_yukon">Arctic & Yukon</option>
                    <option value="alaska_highway">Alaska Highway</option>
                    <option value="rockies_pacific">Rockies & Pacific</option>
                    <option value="baja_mexico">Baja & Mexico</option>
                    <option value="central_america">Central America</option>
                    <option value="andes_south_america">Andes & South America</option>
                    <option value="patagonia_tierradelfuego">Patagonia & Fin del Mundo</option>
                  </select>
                </div>
              </div>

              {/* Tags with quick presets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-stone-700">
                    Tags (comma separated)
                  </label>
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                    <span>Quick tags:</span>
                    {['Henri', 'Mousse', 'Campsite', 'Yukon', 'Family'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const currentTags = uploadTagInput.split(',').map(t => t.trim()).filter(Boolean);
                          if (!currentTags.includes(tag)) {
                            setUploadTagInput([...currentTags, tag].join(', '));
                          }
                        }}
                        className="px-1.5 py-0.5 rounded bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium transition"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={uploadTagInput}
                  onChange={(e) => setUploadTagInput(e.target.value)}
                  placeholder="Henri, Mousse, Yukon, Expedition"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadUrl('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !uploadTitle.trim() || !uploadUrl.trim()}
                  className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload to Gallery</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Upload Modal for Multi-Photo Drag and Drop */}
      <BatchPhotoUploadModal
        isOpen={isBatchModalOpen}
        onClose={() => {
          setIsBatchModalOpen(false);
          setBatchPhotosToUpload([]);
        }}
        initialPhotos={batchPhotosToUpload}
        onUploadBatch={handleExecuteBatchUpload}
        authorName={currentUser ? currentUser.name : 'Joannie & Barton'}
      />

    </div>
  );
};

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
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MediaGalleryProps {
  media: MediaItem[];
  currentUser?: UserProfile | null;
  onUploadMedia: (newMedia: Partial<MediaItem>) => Promise<void>;
  onViewLocationOnMap?: (lat?: number, lng?: number) => void;
  onOpenAuthModal?: () => void;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  media,
  currentUser,
  onUploadMedia,
  onViewLocationOnMap,
  onOpenAuthModal,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [likedMediaIds, setLikedMediaIds] = useState<Record<string, boolean>>({});
  const [mediaList, setMediaList] = useState<MediaItem[]>(media);

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
    const author = currentUser ? currentUser.name : (guestName.trim() || 'Guest Follower');
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
      createdAt: new Date().toISOString(),
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
  const [uploadLocation, setUploadLocation] = useState<string>('Olympic Peninsula, WA');
  const [uploadAuthor, setUploadAuthor] = useState<string>('Joannie & Barton');
  const [uploadTagInput, setUploadTagInput] = useState<string>('Overland, Henri, Nature');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const tagsArray = uploadTagInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await onUploadMedia({
        title: uploadTitle,
        type: uploadType,
        url: uploadUrl,
        caption: uploadCaption,
        locationName: uploadLocation,
        country: 'Canada',
        tags: tagsArray.length > 0 ? tagsArray : ['Expedition 2026'],
        author: uploadAuthor || 'Dr. Joannie & Dr. Barton',
        journeyLeg: 'rockies_pacific',
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

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-blue-900 hover:bg-blue-950 text-white font-medium px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition self-start md:self-auto font-sans"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Photo or Video</span>
        </button>
      </div>

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
                </div>
              </div>

              <div className="p-5 pt-0 flex flex-wrap gap-1 font-sans">
                {item.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                    #{tag}
                  </span>
                ))}
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
            className="bg-[#FAF8F5] border border-stone-200 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl space-y-4 p-6 font-sans"
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
                </div>
                <div className="text-xs text-stone-500 flex items-center gap-2">
                  <span>📍 {activeMedia.locationName}</span>
                  <span>•</span>
                  <span>📅 {activeMedia.date}</span>
                  <span>•</span>
                  <span>By {activeMedia.author}</span>
                </div>
                {activeMedia.caption && (
                  <p className="text-xs text-stone-700 font-serif pt-1">{activeMedia.caption}</p>
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
              <form onSubmit={handlePostMediaComment} className="bg-white border border-stone-200 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
                {!currentUser && (
                  <div>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Your Name (e.g. Grandma, Friend from MUN)"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-blue-900"
                    />
                  </div>
                )}
                <div>
                  <textarea
                    rows={2}
                    required
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Leave a comment or question about this photo..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-blue-900"
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500 text-[11px]">
                    Posting as: <strong className="text-stone-800">{currentUser ? currentUser.name : (guestName || 'Guest')}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={isPostingComment || !commentInput.trim()}
                    className="bg-blue-900 hover:bg-blue-950 text-white font-medium px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
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

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  TravelLog, 
  UserProfile, 
  CommentItem,
  JournalCategory,
  MediaItem
} from '../types';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Baby, 
  GraduationCap, 
  Users, 
  Share2, 
  Heart, 
  MessageSquare, 
  Send, 
  Mountain, 
  Thermometer, 
  Calendar, 
  Check, 
  User, 
  ThumbsUp, 
  LogIn, 
  Globe2, 
  Lightbulb, 
  Sparkles, 
  ShieldCheck, 
  Trash2, 
  Eye, 
  EyeOff, 
  Edit3, 
  Upload, 
  FolderOpen, 
  Camera, 
  Image as ImageIcon, 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Layers,
  Mail 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RichTextRenderer } from '../utils/richTextRenderer';
import { JournalEditorModal } from './JournalEditorModal';
import { EmailPreviewModal } from './EmailPreviewModal';

interface TravelLogDetailProps {
  log: TravelLog;
  currentUser: UserProfile | null;
  onBack: () => void;
  onOpenAuthModal: () => void;
  onViewLocationOnMap?: (lat: number, lng: number) => void;
  onTogglePublish?: (logId: string) => Promise<void>;
  onDeleteLog?: (logId: string) => Promise<void>;
  onUpdateLog?: (logId: string, updatedLog: Partial<TravelLog>) => Promise<void>;
  onUploadMedia?: (newMedia: Partial<MediaItem>) => Promise<void>;
  onUploadBatchMedia?: (items: Partial<MediaItem>[]) => Promise<void>;
  onOpenMediaGallery?: () => void;
}

export const TravelLogDetail: React.FC<TravelLogDetailProps> = ({
  log,
  currentUser,
  onBack,
  onOpenAuthModal,
  onViewLocationOnMap,
  onTogglePublish,
  onDeleteLog,
  onUpdateLog,
  onUploadMedia,
  onUploadBatchMedia,
  onOpenMediaGallery
}) => {
  const [likes, setLikes] = useState<number>(log.likesCount || 14);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>(currentUser?.name || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState<boolean>(false);

  // Bottom Journal Photos State
  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState<boolean>(false);
  const [uploadPhotoUrl, setUploadPhotoUrl] = useState<string>('');
  const [uploadPhotoTitle, setUploadPhotoTitle] = useState<string>('');
  const [uploadPhotoCaption, setUploadPhotoCaption] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Lightbox & Edit Caption State for Journal Photos
  const [activeLightboxIdx, setActiveLightboxIdx] = useState<number | null>(null);
  const [editingPhotoIdx, setEditingPhotoIdx] = useState<number | null>(null);
  const [editingCaptionText, setEditingCaptionText] = useState<string>('');
  const [isSavingCaption, setIsSavingCaption] = useState<boolean>(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);

  // Photo comments in lightbox
  const [photoComments, setPhotoComments] = useState<CommentItem[]>([]);
  const [photoCommentText, setPhotoCommentText] = useState<string>('');
  const [photoGuestName, setPhotoGuestName] = useState<string>(currentUser?.name || '');
  const [isPostingPhotoComment, setIsPostingPhotoComment] = useState<boolean>(false);

  const galleryList = log.gallery || [];

  const currentPhotoTargetId = activeLightboxIdx !== null && galleryList[activeLightboxIdx]
    ? (galleryList[activeLightboxIdx].url || `${log.id}_photo_${activeLightboxIdx}`)
    : null;

  useEffect(() => {
    if (currentPhotoTargetId) {
      fetch(`/api/comments?targetId=${encodeURIComponent(currentPhotoTargetId)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setPhotoComments(data);
        })
        .catch(() => setPhotoComments([]));
    } else {
      setPhotoComments([]);
    }
  }, [currentPhotoTargetId]);

  const handlePostPhotoComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPhotoTargetId || !photoCommentText.trim()) return;

    setIsPostingPhotoComment(true);
    const author = photoGuestName.trim() || (currentUser ? currentUser.name : 'Guest Friend');
    const content = photoCommentText.trim();

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: currentPhotoTargetId,
          targetType: 'media',
          content,
          authorName: author
        })
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setPhotoComments(prev => [data.comment, ...prev]);
        setPhotoCommentText('');
        setIsPostingPhotoComment(false);
        return;
      }
    } catch (err) {
      // fallback
    }

    const localComment: CommentItem = {
      id: `comment-photo-${Date.now()}`,
      targetId: currentPhotoTargetId,
      targetType: 'media',
      authorName: author,
      content,
      createdAt: 'Just now',
      likes: 0
    };
    setPhotoComments(prev => [localComment, ...prev]);
    setPhotoCommentText('');
    setIsPostingPhotoComment(false);
  };

  const handleDeletePhotoComment = async (commentId: string) => {
    if (window.confirm('Remove this comment as administrator?')) {
      try {
        await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      } catch (err) {
        // fallback
      }
      setPhotoComments(prev => prev.filter(c => c.id !== commentId));
    }
  };

  // Fetch comments for this log
  useEffect(() => {
    fetch(`/api/comments?targetId=${log.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setComments(data);
      })
      .catch(() => {
        setComments([]);
      });
  }, [log.id]);

  const handleLikeLog = async () => {
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 }
      });

      try {
        await fetch(`/api/logs/${log.id}/like`, { method: 'POST' });
      } catch (e) {
        // ignore
      }
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: data.likes } : c));
        return;
      }
    } catch (err) {
      // static fallback
    }
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Remove this comment as administrator?')) {
      try {
        await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      } catch (err) {
        // static fallback
      }
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    const author = authorName.trim() || (currentUser ? currentUser.name : 'Guest Friend');
    const content = commentText.trim();

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: log.id,
          targetType: 'log',
          content,
          authorName: author
        })
      });

      const data = await res.json();
      if (data.success && data.comment) {
        setComments(prev => [data.comment, ...prev]);
        setCommentText('');
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      // static fallback
    }

    const localComment: CommentItem = {
      id: `comment-${Date.now()}`,
      targetId: log.id,
      targetType: 'log',
      authorName: author,
      content,
      createdAt: 'Just now',
      likes: 0
    };
    setComments(prev => [localComment, ...prev]);
    setCommentText('');
    setIsSubmitting(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleStatusToggle = async () => {
    if (onTogglePublish) {
      setIsTogglingStatus(true);
      await onTogglePublish(log.id);
      setIsTogglingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      if (onDeleteLog) {
        await onDeleteLog(log.id);
        onBack();
      }
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4500);
  };

  // Upload Photo File(s) from computer / iPhoto (via file input or drag-and-drop)
  const handleUploadFilesToEntry = async (files: FileList | File[]) => {
    if (!currentUser?.isAdmin || !files || files.length === 0) return;

    setIsUploadingPhoto(true);
    const newItems: { url: string; caption: string; type: 'image' | 'video' }[] = [];
    const mediaItemsToAdd: Partial<MediaItem>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) continue;

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const caption = `Expedition photo at ${log.locationName}: ${cleanFileName}`;
      const title = `${log.title} - ${cleanFileName}`;

      newItems.push({
        url: dataUrl,
        caption,
        type: file.type.startsWith('video/') ? 'video' : 'image'
      });

      mediaItemsToAdd.push({
        title,
        caption,
        url: dataUrl,
        locationName: log.locationName,
        coordinates: log.coordinates,
        journeyLeg: log.journeyLeg || 'arctic_yukon',
        tags: Array.from(new Set([...(log.tags || []), 'Journal', log.category])),
        author: currentUser.name || log.author,
        date: log.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        type: file.type.startsWith('video/') ? 'video' : 'image'
      });
    }

    if (newItems.length > 0) {
      const updatedGallery = [...(log.gallery || []), ...newItems];
      if (onUpdateLog) {
        await onUpdateLog(log.id, { gallery: updatedGallery });
      }

      if (onUploadBatchMedia && mediaItemsToAdd.length > 1) {
        await onUploadBatchMedia(mediaItemsToAdd);
      } else if (onUploadMedia) {
        for (const item of mediaItemsToAdd) {
          await onUploadMedia(item);
        }
      }

      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      showToast(`✨ ${newItems.length} ${newItems.length === 1 ? 'photo' : 'photos'} added to journal entry & synced to Gallery!`);
    }

    setIsUploadingPhoto(false);
    setIsAddPhotoModalOpen(false);
  };

  // Upload single photo via URL / Modal
  const handleAddSinglePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadPhotoUrl.trim() || !currentUser?.isAdmin) return;

    setIsUploadingPhoto(true);
    const caption = uploadPhotoCaption.trim() || `Expedition moment at ${log.locationName}`;
    const title = uploadPhotoTitle.trim() || `${log.title} Photo`;

    const newPhotoItem = {
      url: uploadPhotoUrl.trim(),
      caption,
      type: 'image' as const
    };

    const updatedGallery = [...(log.gallery || []), newPhotoItem];
    if (onUpdateLog) {
      await onUpdateLog(log.id, { gallery: updatedGallery });
    }

    if (onUploadMedia) {
      await onUploadMedia({
        title,
        caption,
        url: uploadPhotoUrl.trim(),
        locationName: log.locationName,
        coordinates: log.coordinates,
        journeyLeg: log.journeyLeg || 'arctic_yukon',
        tags: Array.from(new Set([...(log.tags || []), 'Journal', log.category])),
        author: currentUser.name || log.author,
        date: log.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        type: 'image'
      });
    }

    confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
    showToast('✨ Photo added to journal entry & synced to Photo Gallery!');

    setUploadPhotoUrl('');
    setUploadPhotoTitle('');
    setUploadPhotoCaption('');
    setIsUploadingPhoto(false);
    setIsAddPhotoModalOpen(false);
  };

  // Edit Caption for existing photo in entry
  const handleSavePhotoCaption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPhotoIdx === null || !currentUser?.isAdmin) return;

    setIsSavingCaption(true);
    const updatedGallery = [...(log.gallery || [])];
    if (updatedGallery[editingPhotoIdx]) {
      updatedGallery[editingPhotoIdx] = {
        ...updatedGallery[editingPhotoIdx],
        caption: editingCaptionText.trim()
      };

      if (onUpdateLog) {
        await onUpdateLog(log.id, { gallery: updatedGallery });
      }
      showToast('Caption updated successfully.');
    }

    setIsSavingCaption(false);
    setEditingPhotoIdx(null);
    setEditingCaptionText('');
  };

  // Delete photo from entry
  const handleDeletePhotoFromEntry = async (idx: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentUser?.isAdmin) return;
    if (window.confirm('Remove this photo from this journal entry?')) {
      const updatedGallery = (log.gallery || []).filter((_, i) => i !== idx);
      if (onUpdateLog) {
        await onUpdateLog(log.id, { gallery: updatedGallery });
      }
      showToast('Photo removed from this entry.');
      if (activeLightboxIdx !== null) setActiveLightboxIdx(null);
    }
  };

  const getCategoryBadge = (cat: JournalCategory) => {
    switch (cat) {
      case 'adventures_mba':
        return { label: 'Barton & Joannie: Adventures & MBA', bg: 'bg-blue-100 text-blue-950 border-blue-200' };
      case 'henri_milestones':
        return { label: 'Henri’s Milestones', bg: 'bg-rose-100 text-rose-900 border-rose-200' };
      case 'visits_along_the_way':
        return { label: 'Visits Along the Way', bg: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
      default:
        return { label: 'Journal Entry', bg: 'bg-stone-100 text-stone-800 border-stone-200' };
    }
  };

  const badge = getCategoryBadge(log.category);

  return (
    <article id="travel-log-detail" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Nav Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4 font-sans">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition bg-white border border-stone-200 px-3.5 py-2 rounded-xl shadow-xs hover:bg-stone-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Journals</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Admin Edit, Publish Toggle, Email Newsletter & Delete */}
          {currentUser?.isAdmin && (
            <div className="flex items-center gap-1.5 mr-2">
              <button
                onClick={() => setIsEditorOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white shadow-xs transition"
                title="Edit Journal Entry"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Entry</span>
              </button>

              <button
                onClick={() => setIsEmailModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 shadow-xs transition"
                title="Preview and dispatch email notification to approved subscribers"
              >
                <Mail className="w-3.5 h-3.5 text-amber-900" />
                <span className="hidden sm:inline">Email Subscribers</span>
              </button>

              <button
                onClick={handleStatusToggle}
                disabled={isTogglingStatus}
                className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                  log.status === 'published'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
              >
                {log.status === 'published' ? <Eye className="w-3.5 h-3.5 text-emerald-700" /> : <EyeOff className="w-3.5 h-3.5 text-amber-700" />}
                <span>{log.status === 'published' ? 'Published Live' : 'Draft (Private)'}</span>
              </button>

              {onDeleteLog && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {onViewLocationOnMap && (
            <button
              onClick={() => onViewLocationOnMap(log.coordinates.lat, log.coordinates.lng)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-3 py-1.5 rounded-xl transition"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-900" />
              <span>View On Map</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl shadow-xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Header Metadata */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
            {badge.label}
          </span>
          {log.status === 'draft' && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
              DRAFT (Private until Arctic)
            </span>
          )}
          <span className="text-stone-400">•</span>
          <span className="text-stone-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {log.date}
          </span>
          <span className="text-stone-400">•</span>
          <span className="text-stone-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {log.readingTime}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
          {log.title}
        </h1>

        <div className="flex items-center justify-between pt-2 text-xs font-sans text-stone-600 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-serif font-bold text-xs">
              J&B
            </div>
            <div>
              <div className="font-semibold text-stone-900">{log.author}</div>
              <div className="text-[11px] text-stone-500">Expedition Co-Leaders</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-blue-900 font-medium bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-stone-200">
            <MapPin className="w-3.5 h-3.5" />
            <span>{log.locationName}, {log.country}</span>
          </div>
        </div>
      </header>

      {/* Cover Image - Rendered in fixed portrait format for Departure so Henri is not cut off */}
      <div className="flex justify-center">
        <div className={`rounded-3xl overflow-hidden shadow-sm border border-stone-200/90 relative bg-stone-900 w-full ${
          log.coverImage.includes('departure.jpeg') || log.id === 'log-departure-mousse'
            ? 'max-w-md aspect-[3/4] sm:aspect-[4/5]'
            : 'aspect-video'
        }`}>
          <img
            src={log.coverImage}
            alt={log.title}
            className={`w-full h-full ${
              log.coverImage.includes('departure.jpeg') || log.id === 'log-departure-mousse'
                ? 'object-cover object-[50%_15%]'
                : 'object-cover'
            }`}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Expedition Vitals Box */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white border border-stone-200 rounded-2xl shadow-xs text-xs font-sans">
        <div>
          <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Coordinates</div>
          <div className="font-bold text-stone-800 font-mono text-[11px] mt-0.5">
            {log.coordinates.lat.toFixed(4)}°, {log.coordinates.lng.toFixed(4)}°
          </div>
        </div>
        <div>
          <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Distance From Start</div>
          <div className="font-bold text-stone-800 text-[11px] mt-0.5">
            {log.metrics.kmTraveled ? `${log.metrics.kmTraveled.toLocaleString()} km` : '0 km'}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Henri’s Age</div>
          <div className="font-bold text-rose-800 text-[11px] mt-0.5 flex items-center gap-1">
            <Baby className="w-3 h-3 text-rose-600" />
            {log.metrics.henriAge || '2.5 months'}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Elevation & Weather</div>
          <div className="font-bold text-stone-800 text-[11px] mt-0.5">
            {log.metrics.elevationM}m • {log.metrics.tempC}°C
          </div>
        </div>
      </div>

      {/* GOOGLE LOCATION & ACTIVITY INSIGHTS CARD */}
      {log.locationInsights && (
        <div className="bg-[#F8FAFC] border border-blue-200 rounded-3xl p-5 sm:p-6 space-y-4 font-sans shadow-xs">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center">
                <Globe2 className="w-4 h-4 text-blue-900" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base">
                  Google Location & Activity Insights: {log.locationName}
                </h3>
                <p className="text-[11px] text-stone-500">
                  Population, geographic context & local notes
                </p>
              </div>
            </div>

            {log.locationInsights.population && (
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-950 text-xs font-semibold">
                Pop: {log.locationInsights.population}
              </span>
            )}
          </div>

          {log.locationInsights.culturalContext && (
            <div className="text-xs text-stone-700 leading-relaxed bg-white/80 border border-stone-200/80 p-3 rounded-2xl">
              <strong className="text-stone-900 font-semibold">Cultural & Geographic Context: </strong>
              {log.locationInsights.culturalContext}
            </div>
          )}

          {log.locationInsights.interestingFacts && log.locationInsights.interestingFacts.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>Interesting Facts About This Location</span>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-700 pl-2">
                {log.locationInsights.interestingFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-900 font-bold leading-none mt-1">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {log.locationInsights.activityTips && (
            <div className="text-xs text-blue-950 bg-blue-50/90 border border-blue-200 p-3 rounded-2xl">
              <strong className="font-semibold">Activity Notes: </strong>
              {log.locationInsights.activityTips}
            </div>
          )}
        </div>
      )}

      {/* Specific Highlights depending on Category */}
      {log.henriHighlight && (
        <div className="bg-rose-50/80 border border-rose-200/90 rounded-2xl p-5 space-y-1.5 font-sans">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-900 uppercase tracking-wider">
            <Baby className="w-4 h-4 text-rose-700" />
            <span>Henri’s Sabbatical Milestone</span>
          </div>
          <p className="text-xs sm:text-sm text-rose-950 font-serif leading-relaxed">
            {log.henriHighlight}
          </p>
        </div>
      )}

      {log.mbaHighlight && (
        <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-5 space-y-1.5 font-sans">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-950 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-blue-900" />
            <span>MBA on the Road Reflection</span>
          </div>
          <p className="text-xs sm:text-sm text-blue-950 font-serif leading-relaxed">
            {log.mbaHighlight}
          </p>
        </div>
      )}

      {log.visitorHighlight && (
        <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-5 space-y-1.5 font-sans">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>Visits Along the Way</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-950 font-serif leading-relaxed">
            {log.visitorHighlight}
          </p>
        </div>
      )}

      {/* Main Journal Content with Rich Text & Typography Rendering */}
      <div className="pt-2">
        <RichTextRenderer 
          content={log.content} 
          fontFamily={log.fontFamily} 
          className="max-w-none"
        />
      </div>

      {/* EXPEDITION PHOTOS SECTION AT THE BOTTOM OF THE ENTRY */}
      <div id="journal-entry-photos" className="space-y-5 pt-8 border-t border-stone-200 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                Photos from this Journal Entry
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mt-1">
              <span>
                {galleryList.length > 0
                  ? `${galleryList.length} photograph${galleryList.length > 1 ? 's' : ''} related directly to this entry`
                  : 'Photographs related to this entry'}
              </span>
              {onOpenMediaGallery && (
                <>
                  <span className="text-stone-300">•</span>
                  <button
                    type="button"
                    onClick={onOpenMediaGallery}
                    className="text-blue-900 hover:text-blue-950 font-medium underline underline-offset-2 flex items-center gap-1 transition"
                  >
                    <span>Also catalogued in Photo & Video Gallery →</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Admin Upload Triggers */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenMediaGallery && (
              <button
                type="button"
                onClick={onOpenMediaGallery}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-stone-200 shadow-2xs transition"
              >
                <Layers className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Open Global Media Gallery</span>
                <span className="sm:hidden">Gallery</span>
              </button>
            )}

            {currentUser?.isAdmin && (
              <>
                <label className="cursor-pointer bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Upload To This Entry</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => {
                      if (e.target.files) handleUploadFilesToEntry(e.target.files);
                    }}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setIsAddPhotoModalOpen(true)}
                  className="bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photo</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-medium flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
            <span>{successToast}</span>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-950 text-xs">✕</button>
          </div>
        )}

        {/* Photos Grid */}
        {galleryList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryList.map((item, idx) => (
              <div 
                key={idx} 
                className="group relative rounded-2xl overflow-hidden border border-stone-200/90 bg-white shadow-xs flex flex-col transition hover:shadow-md hover:border-stone-300"
              >
                {/* Photo Image with Lightbox click */}
                <div 
                  onClick={() => setActiveLightboxIdx(idx)}
                  className={`bg-stone-900 w-full overflow-hidden relative cursor-pointer ${
                    item.url.includes('departure.jpeg') ? 'aspect-[3/4]' : 'aspect-[4/3]'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.caption || 'Expedition photo'}
                    className={`w-full h-full object-cover transition duration-300 group-hover:scale-103 ${
                      item.url.includes('departure.jpeg') ? 'object-[50%_15%]' : ''
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Zoom Overlay Indicator */}
                  <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <div className="p-2 rounded-xl bg-black/60 text-white text-xs backdrop-blur-xs flex items-center gap-1.5 shadow">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Enlarge</span>
                    </div>
                  </div>
                </div>

                {/* Caption & Controls */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5 bg-white">
                  <p className="text-xs text-stone-700 font-serif italic leading-relaxed">
                    {item.caption || 'Expedition memory'}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-sans">
                    <button
                      onClick={() => setActiveLightboxIdx(idx)}
                      className="text-blue-900 hover:text-blue-950 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Leave a comment</span>
                    </button>

                    {currentUser?.isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingPhotoIdx(idx);
                            setEditingCaptionText(item.caption || '');
                          }}
                          className="text-stone-600 hover:text-blue-900 font-medium flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={(e) => handleDeletePhotoFromEntry(idx, e)}
                          className="text-stone-400 hover:text-rose-600 font-medium flex items-center gap-1 transition"
                          title="Remove photo from this entry"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State for Admin */
          currentUser?.isAdmin ? (
            <div 
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingPhoto(true);
              }}
              onDragLeave={() => setIsDraggingPhoto(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingPhoto(false);
                if (e.dataTransfer.files) handleUploadFilesToEntry(e.dataTransfer.files);
              }}
              className={`p-8 text-center rounded-3xl border-2 border-dashed transition space-y-3 ${
                isDraggingPhoto 
                  ? 'border-blue-900 bg-blue-50/90' 
                  : 'border-stone-300 bg-white/70 hover:bg-white hover:border-stone-400'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 mx-auto flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-stone-900 text-base">
                  No photos added to this journal entry yet
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Drag and drop photos directly from your <strong>iPhoto / Photos library</strong> or computer files here. They will appear right at the bottom of this journal entry and automatically be published in the <strong>Photo & Video Gallery tab</strong>!
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <label className="cursor-pointer px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Choose Photos from Computer</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => {
                      if (e.target.files) handleUploadFilesToEntry(e.target.files);
                    }}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddPhotoModalOpen(true)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium border border-stone-200 transition"
                >
                  Enter Photo URL / Preset
                </button>
              </div>
            </div>
          ) : null
        )}

        {/* Drag & Drop Quick Dropzone Bar for Admin when photos already exist */}
        {currentUser?.isAdmin && galleryList.length > 0 && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingPhoto(true);
            }}
            onDragLeave={() => setIsDraggingPhoto(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingPhoto(false);
              if (e.dataTransfer.files) handleUploadFilesToEntry(e.dataTransfer.files);
            }}
            className={`p-4 rounded-2xl border-2 border-dashed transition flex flex-wrap items-center justify-between gap-3 text-xs ${
              isDraggingPhoto
                ? 'border-blue-900 bg-blue-50 text-blue-950'
                : 'border-stone-200 bg-[#FAF8F5] text-stone-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-900" />
              <span>
                <strong>Add more photos to this entry:</strong> Drag photos here directly from iPhoto or computer files.
              </span>
            </div>
            <label className="cursor-pointer text-blue-900 hover:text-blue-950 font-semibold underline">
              <span>Browse files</span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => {
                  if (e.target.files) handleUploadFilesToEntry(e.target.files);
                }}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Tags */}
      {log.tags && log.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-stone-200 font-sans">
          <span className="text-xs text-stone-500 font-medium">Tags:</span>
          {log.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-stone-200 text-stone-700 text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Likes & Interactions */}
      <div className="flex items-center justify-between p-6 bg-white border border-stone-200 rounded-3xl shadow-xs font-sans">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLikeLog}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold transition ${
              hasLiked
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-600 text-rose-600' : 'text-stone-500'}`} />
            <span>{likes} {likes === 1 ? 'Cheer' : 'Cheers'}</span>
          </button>
        </div>

        <div className="text-xs text-stone-500">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </div>
      </div>

      {/* Comments Section */}
      <section className="space-y-6 pt-6 border-t border-stone-200 font-sans">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-900" />
            Family & Follower Comments ({comments.length})
          </h3>
        </div>

        {/* Post Comment Form */}
        <form onSubmit={handlePostComment} className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h4 className="font-semibold text-stone-900 text-sm">Leave a Note for the Family</h4>
              <p className="text-[11px] text-stone-500">No sign-in required — write your name and comment below.</p>
            </div>
            {authorName.trim() && (
              <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium">
                Posting as: <strong>{authorName.trim()}</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            <div>
              <label className="block font-semibold text-stone-700 mb-1 text-xs">
                Your Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Riley, Grandma Sarah, Cousin David, Dr. Chen"
                className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 text-xs">
                Your Comment <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Leave your cheer, well wishes, or road advice for Joannie, Barton, and baby Henri..."
                className="w-full bg-[#FAF8F5] border border-stone-300 rounded-2xl p-3.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 font-sans"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-stone-400">
              Comments appear immediately on this journal entry.
            </span>
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim() || !authorName.trim()}
              className="bg-blue-900 hover:bg-blue-950 text-white font-medium px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-3">
          {comments.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-stone-200 text-stone-500 text-xs">
              No comments on this journal entry yet. Be the first to cheer on the family!
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
                      {comment.authorName ? comment.authorName.charAt(0) : 'G'}
                    </div>
                    <div>
                      <span className="font-semibold text-stone-900">{comment.authorName}</span>
                      {comment.authorRoleLabel && (
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                          {comment.authorRoleLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-stone-400">{comment.createdAt}</span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed font-sans pl-9">
                  {comment.content}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-stone-100/80">
                  <div className="text-[11px] text-stone-400 font-sans">
                    {currentUser?.isAdmin && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-stone-400 hover:text-rose-600 inline-flex items-center gap-1 transition text-[11px] font-medium"
                        title="Remove inappropriate comment"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove (Admin)</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className="text-[11px] text-stone-500 hover:text-rose-600 flex items-center gap-1"
                  >
                    <Heart className="w-3 h-3" />
                    <span>{comment.likes || 0}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Admin Edit Modal */}
      {isEditorOpen && (
        <JournalEditorModal
          initialLog={log}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={async (data) => {
            if (onUpdateLog) {
              await onUpdateLog(log.id, data);
            }
            setIsEditorOpen(false);
          }}
          authorName={currentUser?.name || log.author}
        />
      )}

      {/* 1. PHOTO LIGHTBOX MODAL WITH BOTTOM COMMENTS */}
      {activeLightboxIdx !== null && galleryList[activeLightboxIdx] && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-start p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setActiveLightboxIdx(null)}
        >
          {/* Top Bar Controls */}
          <div 
            className="w-full max-w-5xl flex items-center justify-between text-white pb-3 px-2 z-10 sticky top-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-300 font-mono">
                Photo {activeLightboxIdx + 1} of {galleryList.length}
              </span>
              <span className="text-xs text-stone-400 font-sans">
                • {log.locationName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentUser?.isAdmin && (
                <button
                  onClick={() => {
                    setEditingPhotoIdx(activeLightboxIdx);
                    setEditingCaptionText(galleryList[activeLightboxIdx].caption || '');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Caption</span>
                </button>
              )}

              <button
                onClick={() => setActiveLightboxIdx(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Photo Display */}
          <div 
            className="relative max-w-5xl max-h-[70vh] w-full flex items-center justify-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryList[activeLightboxIdx].url}
              alt={galleryList[activeLightboxIdx].caption || 'Expedition photo'}
              className="max-h-[68vh] max-w-full object-contain rounded-xl shadow-2xl"
              referrerPolicy="no-referrer"
            />

            {/* Navigation Chevrons */}
            {galleryList.length > 1 && (
              <>
                <button
                  onClick={() => setActiveLightboxIdx((prev) => (prev! > 0 ? prev! - 1 : galleryList.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveLightboxIdx((prev) => (prev! < galleryList.length - 1 ? prev! + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Caption & Comments at Bottom of Picture */}
          <div 
            className="w-full max-w-3xl space-y-4 pt-4 px-2 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            {galleryList[activeLightboxIdx].caption && (
              <div className="text-center text-stone-200 text-sm font-serif italic bg-white/5 py-2.5 px-4 rounded-xl border border-white/10">
                {galleryList[activeLightboxIdx].caption}
              </div>
            )}

            {/* Guest Comment Box on Picture */}
            <div className="bg-stone-900/90 border border-stone-700/80 rounded-2xl p-4 text-white space-y-3 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-stone-200 flex items-center gap-1.5 font-sans">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>Comments on this picture ({photoComments.length})</span>
                </h4>
                <span className="text-[10px] text-stone-400 font-sans">
                  No login required to comment
                </span>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handlePostPhotoComment} className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      required
                      value={photoGuestName}
                      onChange={(e) => setPhotoGuestName(e.target.value)}
                      placeholder="Your Name (e.g. Grandma, Riley)*"
                      className="w-full bg-stone-800/90 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-blue-400 font-sans"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={photoCommentText}
                      onChange={(e) => setPhotoCommentText(e.target.value)}
                      placeholder="Your comment on this picture...*"
                      className="w-full bg-stone-800/90 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-blue-400 font-sans"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isPostingPhotoComment || !photoCommentText.trim() || !photoGuestName.trim()}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer font-sans"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isPostingPhotoComment ? 'Posting...' : 'Post Comment'}</span>
                  </button>
                </div>
              </form>

              {/* Photo Comments List */}
              {photoComments.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pt-2 border-t border-stone-800">
                  {photoComments.map((c) => (
                    <div key={c.id} className="bg-stone-800/70 border border-stone-700/50 rounded-xl p-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-stone-400">
                        <span className="font-semibold text-stone-200">{c.authorName}</span>
                        <div className="flex items-center gap-2">
                          <span>{c.createdAt}</span>
                          {currentUser?.isAdmin && (
                            <button
                              onClick={() => handleDeletePhotoComment(c.id)}
                              className="text-stone-400 hover:text-rose-400"
                              title="Delete comment (Admin)"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-stone-300 text-xs font-sans">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT CAPTION MODAL (ADMIN) */}
      {editingPhotoIdx !== null && galleryList[editingPhotoIdx] && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-900" />
                <h3 className="font-serif font-bold text-stone-900 text-base">Edit Photo Caption</h3>
              </div>
              <button
                onClick={() => setEditingPhotoIdx(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail */}
            <div className="h-36 rounded-xl overflow-hidden bg-stone-900 border border-stone-200">
              <img
                src={galleryList[editingPhotoIdx].url}
                alt="Thumbnail"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <form onSubmit={handleSavePhotoCaption} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Caption / Description:
                </label>
                <textarea
                  value={editingCaptionText}
                  onChange={(e) => setEditingCaptionText(e.target.value)}
                  placeholder="Describe this expedition photo moment..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPhotoIdx(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCaption}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-900 hover:bg-blue-950 text-white shadow-xs transition"
                >
                  {isSavingCaption ? 'Saving...' : 'Save Caption'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ADD / UPLOAD PHOTO MODAL (ADMIN) */}
      {isAddPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-900" />
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">Add Photo to Journal Entry</h3>
                  <p className="text-[11px] text-stone-500">Photo will also be saved to the Photo & Video Gallery tab</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddPhotoModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Upload from Files Button */}
            <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-blue-900" />
                  <span>Choose file from Computer / iPhoto</span>
                </div>
                <p className="text-[11px] text-blue-800">Directly selects from your photo library or disk</p>
              </div>

              <label className="cursor-pointer px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold shadow-xs transition">
                <span>Browse...</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => {
                    if (e.target.files) handleUploadFilesToEntry(e.target.files);
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-stone-200"></div>
              <span className="shrink mx-3 text-stone-400 text-xs">or paste image URL / pick preset</span>
              <div className="grow border-t border-stone-200"></div>
            </div>

            {/* Preset quick pills */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-stone-600">Quick Expedition Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '🏔️ Coast Departure', url: '/departure.jpeg' },
                  { label: '⚡ 400W Solar Rig', url: '/solar panel.jpeg' },
                  { label: '🛋️ Birch Interior', url: '/interior1.jpeg' },
                  { label: '⛺ Tundra Camp', url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80' }
                ].map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => {
                      setUploadPhotoUrl(preset.url);
                      setUploadPhotoCaption(`Expedition view during ${log.title}`);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddSinglePhotoSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Photo URL:
                </label>
                <input
                  type="text"
                  value={uploadPhotoUrl}
                  onChange={(e) => setUploadPhotoUrl(e.target.value)}
                  placeholder="https://... or /departure.jpeg"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>

              {uploadPhotoUrl && (
                <div className="h-32 rounded-xl overflow-hidden bg-stone-900 border border-stone-200">
                  <img
                    src={uploadPhotoUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Photo Title (optional):
                </label>
                <input
                  type="text"
                  value={uploadPhotoTitle}
                  onChange={(e) => setUploadPhotoTitle(e.target.value)}
                  placeholder={`${log.title} Photo`}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Caption / Description:
                </label>
                <textarea
                  value={uploadPhotoCaption}
                  onChange={(e) => setUploadPhotoCaption(e.target.value)}
                  placeholder={`Expedition moment in ${log.locationName}...`}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingPhoto || !uploadPhotoUrl.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-900 hover:bg-blue-950 text-white shadow-xs transition disabled:opacity-50"
                >
                  {isUploadingPhoto ? 'Uploading & Syncing...' : 'Add to Journal & Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LIVE EMAIL PREVIEW & DISPATCH MODAL --- */}
      {isEmailModalOpen && (
        <EmailPreviewModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          logData={log}
          authorName={currentUser?.name || log.author}
        />
      )}

    </article>
  );
};

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
  Mail,
  Gauge 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RichTextRenderer } from '../utils/richTextRenderer';
import { readFileAsOptimizedDataUrl } from '../utils/photoDropHelper';

interface TravelLogDetailProps {
  log: TravelLog;
  currentUser?: UserProfile | null;
  onBack: () => void;
  onOpenAuthModal?: () => void;
  onViewLocationOnMap?: (lat: number, lng: number) => void;
  onOpenMediaGallery?: () => void;
  liveLocation?: any;
  subscribers?: any;
}

export const TravelLogDetail: React.FC<TravelLogDetailProps> = ({
  log: initialLogProp,
  currentUser,
  onBack,
  onViewLocationOnMap,
  onOpenMediaGallery,
}) => {
  const [log, setLog] = useState<TravelLog>(initialLogProp);

  useEffect(() => {
    setLog(initialLogProp);
  }, [initialLogProp]);

  const [likes, setLikes] = useState<number>(typeof log.likesCount === 'number' ? log.likesCount : 0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>(currentUser?.name || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Lightbox State for Journal Photos
  const [activeLightboxIdx, setActiveLightboxIdx] = useState<number | null>(null);

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

    setLikes(typeof log.likesCount === 'number' ? log.likesCount : 0);
    try {
      const stored = localStorage.getItem(`mousse_liked_log_${log.id}`);
      setHasLiked(stored === 'true');
    } catch {
      // ignore
    }
  }, [log.id, log.likesCount]);

  const handleLikeLog = async () => {
    const nextLiked = !hasLiked;
    setHasLiked(nextLiked);
    setLikes(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));
    try {
      localStorage.setItem(`mousse_liked_log_${log.id}`, nextLiked ? 'true' : 'false');
    } catch {
      // ignore
    }

    if (nextLiked) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 }
      });
    }

    try {
      const res = await fetch(`/api/logs/${log.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction: nextLiked ? 'like' : 'unlike' })
      });
      const data = await res.json();
      if (typeof data.likesCount === 'number') {
        setLikes(data.likesCount);
      }
    } catch (e) {
      // ignore
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

  const getCategoryBadge = (_cat?: JournalCategory) => {
    return { label: 'Expedition Journal', bg: 'bg-blue-100 text-blue-950 border-blue-200' };
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
          <span>Back to Expedition Journal</span>
        </button>

        <div className="flex items-center gap-2">
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
        <div className="relative group">
          <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Distance From Start</div>
          <div className="font-bold text-stone-800 text-[11px] mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>{log.metrics.kmTraveled ? `${log.metrics.kmTraveled.toLocaleString()} km` : '0 km'}</span>
            {log.id === 'log-2-alberta-to-yukon' && (
              <span className="text-[9px] bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded-md font-medium">
                Lethbridge → Tuktoyaktuk
              </span>
            )}
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-8 text-center rounded-3xl border border-stone-200 bg-stone-50/70 space-y-2">
            <Camera className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="font-serif font-bold text-stone-800 text-sm">
              No dedicated photo collection for this entry yet
            </p>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Explore our full collection of pictures and drone videos in the Photo & Video Gallery tab!
            </p>
          </div>
        )}

        {/* Visitor Discovery Banner: All Expedition Photos in Gallery */}
        <div className="bg-[#FAF8F5] border border-stone-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs mt-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-900/10 text-blue-900 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5 text-blue-900" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-stone-900 text-sm">
                Looking for all expedition pictures?
              </h4>
              <p className="text-xs text-stone-600">
                Visitors can find the full collection of all authentic expedition photos, truck build details, and family milestones in the <strong>Photo &amp; Video Gallery</strong> tab.
              </p>
            </div>
          </div>
          {onOpenMediaGallery && (
            <button
              type="button"
              onClick={onOpenMediaGallery}
              className="shrink-0 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Explore Photo &amp; Video Gallery →</span>
            </button>
          )}
        </div>
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

      {/* 2. End of Modals */}

    </article>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  TravelLog, 
  UserProfile, 
  CommentItem,
  JournalCategory
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
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TravelLogDetailProps {
  log: TravelLog;
  currentUser: UserProfile | null;
  onBack: () => void;
  onOpenAuthModal: () => void;
  onViewLocationOnMap?: (lat: number, lng: number) => void;
  onTogglePublish?: (logId: string) => Promise<void>;
  onDeleteLog?: (logId: string) => Promise<void>;
}

export const TravelLogDetail: React.FC<TravelLogDetailProps> = ({
  log,
  currentUser,
  onBack,
  onOpenAuthModal,
  onViewLocationOnMap,
  onTogglePublish,
  onDeleteLog
}) => {
  const [likes, setLikes] = useState<number>(log.likesCount || 14);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState<boolean>(false);

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
    const author = currentUser ? currentUser.name : (authorName.trim() || 'Guest Follower');
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
      createdAt: new Date().toISOString(),
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
          {/* Admin Publish Toggle & Delete */}
          {currentUser?.isAdmin && (
            <div className="flex items-center gap-1.5 mr-2">
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

      {/* Main Journal Content */}
      <div className="prose prose-stone max-w-none font-serif text-stone-800 text-base sm:text-lg leading-relaxed sm:leading-loose space-y-6 pt-2">
        {log.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="text-stone-800">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Photo Gallery if present */}
      {log.gallery && log.gallery.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-stone-200">
          <h3 className="text-xl font-serif font-bold text-stone-900">
            Expedition Photos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {log.gallery.map((item, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden border border-stone-200/90 bg-white shadow-xs space-y-2">
                <div className={`bg-stone-900 w-full flex items-center justify-center overflow-hidden ${
                  item.url.includes('departure.jpeg') ? 'aspect-[3/4] sm:aspect-[4/5]' : 'h-64 sm:h-72'
                }`}>
                  <img
                    src={item.url}
                    alt={item.caption || 'Expedition photo'}
                    className={`w-full h-full ${item.url.includes('departure.jpeg') ? 'object-cover object-[50%_15%]' : 'object-cover'}`}
                    referrerPolicy="no-referrer"
                  />
                </div>
                {item.caption && (
                  <div className="p-3 text-xs text-stone-700 font-sans italic leading-relaxed">
                    {item.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
        <form onSubmit={handlePostComment} className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span>
              Posting as: <strong className="text-stone-900">{currentUser ? currentUser.name : (authorName || 'Guest Follower')}</strong>
            </span>
            {!currentUser && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="text-blue-900 hover:text-blue-950 font-semibold underline text-xs"
              >
                Sign In
              </button>
            )}
          </div>

          {!currentUser && (
            <div>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your Name (e.g. Riley, Grandma Sarah, Alex)"
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-900"
              />
            </div>
          )}

          <div>
            <textarea
              rows={3}
              required
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Leave a warm comment for Joannie, Barton, and baby Henri on the road..."
              className="w-full bg-[#FAF8F5] border border-stone-200 rounded-2xl p-3.5 text-xs text-stone-900 focus:outline-none focus:border-blue-900 font-sans"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="bg-blue-900 hover:bg-blue-950 text-white font-medium px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Comment</span>
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

    </article>
  );
};

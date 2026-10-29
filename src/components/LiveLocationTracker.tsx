import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  MapPin, 
  Navigation, 
  Battery, 
  Mountain, 
  Compass, 
  Share2, 
  Check, 
  Clock, 
  Sun, 
  Send, 
  ShieldCheck, 
  Satellite, 
  AlertCircle,
  Heart,
  Baby,
  RefreshCw,
  Eye,
  EyeOff,
  Signal,
  Wifi,
  Layers,
  Thermometer,
  Flame,
  Coffee,
  Wine,
  Sparkles,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { LiveLocation, CommentItem, UserProfile } from '../types';
import confetti from 'canvas-confetti';

interface LiveLocationTrackerProps {
  liveLocation: LiveLocation;
  currentUser?: UserProfile | null;
  onUpdateLocation?: (newLocation: Partial<LiveLocation>) => Promise<void>;
  onClose?: () => void;
}

export const LiveLocationTracker: React.FC<LiveLocationTrackerProps> = ({
  liveLocation,
  currentUser,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  
  // Campfire Cheers State
  const [cheerSent, setCheerSent] = useState<string | null>(null);
  const [cheerCount, setCheerCount] = useState<number>(0);
  const [smoresCount, setSmoresCount] = useState<number>(0);
  const [drinksCount, setDrinksCount] = useState<number>(0);
  const [firesCount, setFiresCount] = useState<number>(0);

  // Live guest comments/messages for the rig
  const [radarComments, setRadarComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [isPostingComment, setIsPostingComment] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/comments?targetId=live_radar')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRadarComments(data);
      })
      .catch(() => {});
  }, []);

  // Copy live share link
  const handleCopyLink = () => {
    const url = `${window.location.origin}?tab=live`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Send fun campfire, s'mores or drinks cheer
  const handleSendCampfireCheer = (type: 'smore' | 'drink' | 'fire' | 'coffee') => {
    setCheerCount(prev => prev + 1);
    
    if (type === 'smore') {
      setSmoresCount(prev => prev + 1);
      setCheerSent("You toasted a delicious golden s'more for Joannie, Barton & baby Henri! 🍫🔥");
      confetti({
        particleCount: 40,
        spread: 60,
        colors: ['#8B4513', '#FFF8DC', '#FF8C00', '#FFD700'],
        origin: { y: 0.7 }
      });
    } else if (type === 'drink') {
      setDrinksCount(prev => prev + 1);
      setCheerSent("Clink! You raised a cold evening drink & campfire toast to Mousse! 🍻✨");
      confetti({
        particleCount: 45,
        spread: 70,
        colors: ['#FFD700', '#FFA500', '#FFFFFF', '#1E3A8A'],
        origin: { y: 0.7 }
      });
    } else if (type === 'fire') {
      setFiresCount(prev => prev + 1);
      setCheerSent("You stoked the evening campfire for warmth under the northern stars! 🔥🪵");
      confetti({
        particleCount: 35,
        spread: 50,
        colors: ['#FF4500', '#FF8C00', '#FFD700'],
        origin: { y: 0.7 }
      });
    } else {
      setDrinksCount(prev => prev + 1);
      setCheerSent("Fresh hot camp coffee brewed for the early morning expedition drive! ☕🌲");
      confetti({
        particleCount: 35,
        spread: 50,
        colors: ['#4A2E18', '#A0522D', '#D2B48C'],
        origin: { y: 0.7 }
      });
    }

    setTimeout(() => setCheerSent(null), 4500);
  };

  // Post guest comment on radar
  const handlePostRadarComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsPostingComment(true);
    const author = currentUser ? currentUser.name : (guestName.trim() || 'Guest Follower');
    const content = commentText.trim();

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: 'live_radar',
          targetType: 'radar',
          content,
          authorName: author
        })
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setRadarComments(prev => [data.comment, ...prev]);
        setCommentText('');
        setIsPostingComment(false);
        return;
      }
    } catch (err) {
      // static fallback
    }

    const localComment: CommentItem = {
      id: `comment-radar-${Date.now()}`,
      targetId: 'live_radar',
      targetType: 'live_radar',
      authorName: author,
      content,
      createdAt: new Date().toISOString(),
      likes: 0
    };
    setRadarComments(prev => [localComment, ...prev]);
    setCommentText('');
    setIsPostingComment(false);
  };

  // Admin remove inappropriate comment
  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Remove this comment as administrator?')) {
      try {
        await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      } catch (err) {
        // static fallback
      }
      setRadarComments(prev => prev.filter(c => c.id !== commentId));
    }
  };

  return (
    <div id="live-location-tracker-page" className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 font-sans">
      
      {/* Primary Telemetry Console Card */}
      <div className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-800/60 p-0.5 shadow-md flex items-center justify-center text-blue-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                  Live Expedition GPS Radar
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  liveLocation.isSharing
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${liveLocation.isSharing ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                  {liveLocation.isSharing ? 'Live Broadcast' : 'Sharing Paused'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Real-time satellite coordinates & telemetry for Joannie, Barton, and baby Henri.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
              liveLocation.isSharing 
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' 
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${liveLocation.isSharing ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
              <span>{liveLocation.isSharing ? 'Live GPS Active' : 'GPS Standby'}</span>
            </div>

            <button
              onClick={handleCopyLink}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-blue-400" />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics Bento */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 relative z-10">
          {/* Coordinates */}
          <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" /> GPS Fix
            </div>
            <div className="text-sm font-mono font-bold text-slate-100">
              {liveLocation.lat.toFixed(4)}° N
            </div>
            <div className="text-sm font-mono font-bold text-slate-100">
              {Math.abs(liveLocation.lng).toFixed(4)}° W
            </div>
          </div>

          {/* Elevation & Speed */}
          <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <Mountain className="w-3.5 h-3.5 text-cyan-400" /> Altitude & Speed
            </div>
            <div className="text-lg font-bold text-white">
              {liveLocation.altitudeM || 68} m
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Speed: {liveLocation.speedKmh || 0} km/h
            </div>
          </div>

          {/* Power & Starlink */}
          <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <Battery className="w-3.5 h-3.5 text-emerald-400" /> Rig Battery
            </div>
            <div className="text-lg font-bold text-emerald-400">
              {liveLocation.batteryPercent || 92}%
            </div>
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Wifi className="w-3 h-3 text-blue-400" /> Starlink Connected
            </div>
          </div>

          {/* Last Sync */}
          <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Timestamp
            </div>
            <div className="text-xs font-bold text-white">
              {new Date(liveLocation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-[11px] text-slate-400">
              {new Date(liveLocation.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Current Status Dispatch */}
        <div className="mt-6 bg-slate-950/90 border border-blue-900/40 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-slate-200 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-blue-900/40 border border-blue-700/50 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
            <Navigation className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Field Status Note from Joannie & Barton
            </div>
            <p className="text-sm font-serif italic text-slate-100 leading-relaxed">
              "{liveLocation.statusMessage}"
            </p>
            <div className="pt-1 text-xs text-slate-400 font-sans flex flex-wrap items-center gap-4">
              <span>📍 Location: <strong className="text-white">{liveLocation.lastCity}</strong></span>
              <span>🎯 Next Target: <strong className="text-white">{liveLocation.nextMilestone}</strong></span>
            </div>
          </div>
        </div>

        {/* Campfire, S'mores & Drinks Cheers Experience */}
        <div className="mt-6 pt-5 border-t border-slate-800 space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Campfire Gathering & S'mores for the Rig</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Send a warm campfire gesture, toast a golden s'more, or raise a drink with Joannie, Barton, and baby Henri!
              </p>
            </div>

            <div className="text-xs text-slate-300 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span><strong className="text-white font-mono">{cheerCount}</strong> Campfire Cheers Sent</span>
            </div>
          </div>

          {/* Interactive Campfire Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => handleSendCampfireCheer('smore')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/70 text-amber-200 border border-amber-800/60 text-xs font-semibold shadow-xs transition hover:scale-102 active:scale-95"
            >
              <span className="text-base">🍫</span>
              <span>Toast a S'more ({smoresCount})</span>
            </button>

            <button
              onClick={() => handleSendCampfireCheer('drink')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-blue-200 border border-blue-800/60 text-xs font-semibold shadow-xs transition hover:scale-102 active:scale-95"
            >
              <Wine className="w-3.5 h-3.5 text-blue-400" />
              <span>Raise a Drink ({drinksCount})</span>
            </button>

            <button
              onClick={() => handleSendCampfireCheer('fire')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-orange-950/50 hover:bg-orange-900/70 text-orange-200 border border-orange-800/60 text-xs font-semibold shadow-xs transition hover:scale-102 active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Stoke Fire ({firesCount})</span>
            </button>

            <button
              onClick={() => handleSendCampfireCheer('coffee')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-semibold shadow-xs transition hover:scale-102 active:scale-95"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-300" />
              <span>Camp Coffee</span>
            </button>
          </div>

          {/* Cheer feedback toast */}
          {cheerSent && (
            <div className="bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs p-3 rounded-xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-medium">{cheerSent}</span>
            </div>
          )}
        </div>
      </div>

      {/* Guest & Follower Campfire Messages */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900">
                Campfire Messages & Well Wishes ({radarComments.length})
              </h2>
              <p className="text-xs text-stone-500">
                Send notes, road advice, and love to Joannie, Barton & Henri on their 35,000 km trek.
              </p>
            </div>
          </div>
        </div>

        {/* Leave message form */}
        <form onSubmit={handlePostRadarComment} className="bg-[#FAF8F5] border border-stone-200/90 rounded-2xl p-4 space-y-3">
          {!currentUser && (
            <div>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your Name (e.g. Grandma Sarah, Riley, Cousin Alex)"
                className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-900"
              />
            </div>
          )}

          <div>
            <textarea
              rows={2}
              required
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Leave a campfire message for the family around Mousse..."
              className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-blue-900"
            />
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-500 text-[11px]">
              Posting as: <strong className="text-stone-800">{currentUser ? currentUser.name : (guestName || 'Guest Follower')}</strong>
            </span>
            <button
              type="submit"
              disabled={isPostingComment || !commentText.trim()}
              className="bg-blue-900 hover:bg-blue-950 text-white font-medium px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>Send Message</span>
            </button>
          </div>
        </form>

        {/* Messages List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {radarComments.length === 0 ? (
            <div className="text-center py-6 text-xs text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
              No messages posted yet. Be the first to leave a warm campfire greeting!
            </div>
          ) : (
            radarComments.map((comment) => (
              <div key={comment.id} className="bg-stone-50/80 border border-stone-200 rounded-xl p-3.5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-[10px]">
                      {comment.authorName ? comment.authorName.charAt(0) : 'G'}
                    </div>
                    <span className="font-semibold text-stone-900">{comment.authorName}</span>
                    {comment.authorRoleLabel && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                        {comment.authorRoleLabel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-stone-400 text-[10px]">
                    <span>{comment.createdAt}</span>
                  </div>
                </div>
                <p className="text-stone-700 pl-8 leading-relaxed font-sans">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Expedition GPS Feed Informational Card */}
      <div className="bg-stone-50 border border-stone-200/90 rounded-3xl p-6 text-center space-y-2 shadow-xs">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-900 mx-auto flex items-center justify-center">
          <Satellite className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-stone-900">Expedition GPS Feed</h3>
        <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
          Live GPS telemetry and status notes are broadcast directly by Joannie & Barton from the Mousse overland truck. Follow along on the interactive route map above.
        </p>
      </div>

    </div>
  );
};

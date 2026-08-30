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
  onUpdateLocation: (newLocation: Partial<LiveLocation>) => Promise<void>;
  onClose?: () => void;
}

export const LiveLocationTracker: React.FC<LiveLocationTrackerProps> = ({
  liveLocation,
  currentUser,
  onUpdateLocation,
  onClose,
}) => {
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [checkinMessage, setCheckinMessage] = useState<string>('');
  const [checkinCity, setCheckinCity] = useState<string>(liveLocation.lastCity);
  const [checkinLat, setCheckinLat] = useState<number>(liveLocation.lat);
  const [checkinLng, setCheckinLng] = useState<number>(liveLocation.lng);
  const [checkinAltitude, setCheckinAltitude] = useState<number>(liveLocation.altitudeM || 68);
  const [checkinSpeed, setCheckinSpeed] = useState<number>(liveLocation.speedKmh || 0);
  const [checkinBattery, setCheckinBattery] = useState<number>(liveLocation.batteryPercent || 94);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLocatingDevice, setIsLocatingDevice] = useState<boolean>(false);

  // Sync state if liveLocation prop updates
  useEffect(() => {
    setCheckinCity(liveLocation.lastCity);
    setCheckinLat(liveLocation.lat);
    setCheckinLng(liveLocation.lng);
    if (liveLocation.altitudeM) setCheckinAltitude(liveLocation.altitudeM);
    if (liveLocation.speedKmh !== undefined) setCheckinSpeed(liveLocation.speedKmh);
    if (liveLocation.batteryPercent) setCheckinBattery(liveLocation.batteryPercent);
  }, [liveLocation]);
  
  // Campfire Cheers State
  const [cheerSent, setCheerSent] = useState<string | null>(null);
  const [cheerCount, setCheerCount] = useState<number>(0);
  const [smoresCount, setSmoresCount] = useState<number>(0);
  const [drinksCount, setDrinksCount] = useState<number>(0);
  const [firesCount, setFiresCount] = useState<number>(0);
  const [gpsError, setGpsError] = useState<string | null>(null);

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

  // Toggle Live Browser GPS tracking
  const toggleBroadcasting = () => {
    if (isBroadcasting) {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      setIsBroadcasting(false);
    } else {
      if (!('geolocation' in navigator)) {
        setGpsError('Geolocation is not supported on this browser.');
        return;
      }

      setGpsError(null);
      setIsBroadcasting(true);

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, altitude, speed, heading, accuracy } = position.coords;

          onUpdateLocation({
            lat: latitude,
            lng: longitude,
            altitudeM: altitude ? Math.round(altitude) : liveLocation.altitudeM,
            speedKmh: speed ? Math.round(speed * 3.6) : 0,
            heading: heading || 0,
            accuracyM: accuracy ? Math.round(accuracy) : 5,
            timestamp: new Date().toISOString(),
            trackingMode: 'live_browser_gps',
          });
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          setGpsError(`GPS Notice: ${error.message} (Maintaining last satellite coordinates)`);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );

      setWatchId(id);
    }
  };

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Detect current phone/laptop GPS coordinates on demand
  const handleFetchCurrentGps = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported on this browser.');
      return;
    }

    setIsLocatingDevice(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, altitude, speed } = position.coords;
        setCheckinLat(Number(latitude.toFixed(5)));
        setCheckinLng(Number(longitude.toFixed(5)));
        if (altitude) setCheckinAltitude(Math.round(altitude));
        if (speed) setCheckinSpeed(Math.round(speed * 3.6));
        setIsLocatingDevice(false);
      },
      (error) => {
        setGpsError(`Could not fetch device GPS: ${error.message}`);
        setIsLocatingDevice(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Quick jump presets
  const applyPresetLocation = (preset: { city: string; lat: number; lng: number; alt: number; milestone?: string }) => {
    setCheckinCity(preset.city);
    setCheckinLat(preset.lat);
    setCheckinLng(preset.lng);
    setCheckinAltitude(preset.alt);
    if (preset.milestone) {
      onUpdateLocation({ nextMilestone: preset.milestone });
    }
  };

  // Handle manual checkin
  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateLocation({
        statusMessage: checkinMessage || liveLocation.statusMessage,
        lastCity: checkinCity || liveLocation.lastCity,
        lat: Number(checkinLat),
        lng: Number(checkinLng),
        altitudeM: Number(checkinAltitude),
        speedKmh: Number(checkinSpeed),
        batteryPercent: Number(checkinBattery),
        timestamp: new Date().toISOString(),
        trackingMode: 'manual_checkin',
      });
      setCheckinMessage('');
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle privacy / location sharing globally
  const handleToggleSharing = async () => {
    const nextState = !liveLocation.isSharing;
    await onUpdateLocation({ isSharing: nextState });
  };

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
                Real-time satellite coordinates & telemetry for Dr. Joannie, Dr. Barton, and baby Henri.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleSharing}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                liveLocation.isSharing 
                  ? 'bg-blue-950 text-blue-300 border border-blue-800 hover:bg-blue-900' 
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              {liveLocation.isSharing ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              <span>{liveLocation.isSharing ? 'Sharing On' : 'Sharing Paused'}</span>
            </button>

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
              Field Status Note from Dr. Joannie & Dr. Barton
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
                    {currentUser?.isAdmin && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-stone-400 hover:text-rose-600 ml-1 p-1"
                        title="Remove inappropriate comment (Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-stone-700 pl-8 leading-relaxed font-sans">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Driver & Expedition Admin Check-in Controls */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-900" />
              Expedition Broadcast & GPS Telemetry Controls
            </h2>
            <p className="text-xs text-stone-500 font-sans mt-0.5">
              For Dr. Joannie & Dr. Barton: Broadcast live coordinates via device GPS, enter coordinates manually, or publish a field note.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleFetchCurrentGps}
              disabled={isLocatingDevice}
              className="bg-emerald-800 hover:bg-emerald-900 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
            >
              {isLocatingDevice ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              <span>{isLocatingDevice ? 'Detecting Fix...' : 'Detect Device GPS'}</span>
            </button>

            <button
              onClick={toggleBroadcasting}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-sm ${
                isBroadcasting
                  ? 'bg-rose-700 hover:bg-rose-800 text-white animate-pulse'
                  : 'bg-blue-900 hover:bg-blue-950 text-white'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{isBroadcasting ? 'Stop Live GPS Stream' : 'Start Continuous Stream'}</span>
            </button>
          </div>
        </div>

        {gpsError && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* Quick Location Jump Presets */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Quick Route Jump Presets
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { city: 'Lethbridge, AB', lat: 49.6956, lng: -112.8451, alt: 910, milestone: 'Banff National Park' },
              { city: 'Banff National Park, AB', lat: 51.1784, lng: -115.5708, alt: 1383, milestone: 'Jasper / Icefields' },
              { city: 'Jasper, AB', lat: 52.8737, lng: -118.0814, alt: 1062, milestone: 'Alaska Highway' },
              { city: 'Whitehorse, Yukon', lat: 60.7212, lng: -135.0568, alt: 670, milestone: 'Dawson City & Dempster' },
              { city: 'Dawson City, YT', lat: 64.0601, lng: -139.4320, alt: 320, milestone: 'Arctic Circle Sign' },
              { city: 'Tuktoyaktuk, NWT (Arctic Ocean)', lat: 69.4454, lng: -133.0342, alt: 5, milestone: 'Southbound to Alaska' },
              { city: 'San Ignacio, Baja California', lat: 27.2842, lng: -112.8970, alt: 120, milestone: 'Central America' },
              { city: 'Ushuaia, Argentina', lat: -54.8019, lng: -68.3030, alt: 6, milestone: 'Expedition Complete!' }
            ].map(preset => (
              <button
                key={preset.city}
                type="button"
                onClick={() => applyPresetLocation(preset)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 px-2.5 py-1 rounded-lg text-[11px] transition"
              >
                📍 {preset.city}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Check-in Form with Coordinates */}
        <form onSubmit={handleCheckinSubmit} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Current Landmark / City
              </label>
              <input
                type="text"
                value={checkinCity}
                onChange={(e) => setCheckinCity(e.target.value)}
                placeholder="e.g. Whitehorse, YT / Dempster Highway"
                className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Next Destination Target
              </label>
              <input
                type="text"
                defaultValue={liveLocation.nextMilestone}
                onChange={(e) => onUpdateLocation({ nextMilestone: e.target.value })}
                placeholder="e.g. Tuktoyaktuk, NWT"
                className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
              />
            </div>
          </div>

          {/* Coordinate Precision Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <div>
              <label className="block font-semibold text-stone-700 mb-1 text-[11px]">
                Latitude (°N)
              </label>
              <input
                type="number"
                step="0.0001"
                value={checkinLat}
                onChange={(e) => setCheckinLat(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 font-mono text-xs focus:outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 text-[11px]">
                Longitude (°W)
              </label>
              <input
                type="number"
                step="0.0001"
                value={checkinLng}
                onChange={(e) => setCheckinLng(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 font-mono text-xs focus:outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 text-[11px]">
                Altitude (m)
              </label>
              <input
                type="number"
                value={checkinAltitude}
                onChange={(e) => setCheckinAltitude(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 font-mono text-xs focus:outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 text-[11px]">
                Speed (km/h)
              </label>
              <input
                type="number"
                value={checkinSpeed}
                onChange={(e) => setCheckinSpeed(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 font-mono text-xs focus:outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 text-[11px]">
                Battery (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={checkinBattery}
                onChange={(e) => setCheckinBattery(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-900 font-mono text-xs focus:outline-none focus:border-blue-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Field Status Note for Followers & Family
            </label>
            <textarea
              rows={2}
              value={checkinMessage}
              onChange={(e) => setCheckinMessage(e.target.value)}
              placeholder="e.g. Starlink connected under midnight sun, baby Henri napping peacefully after gravel drive..."
              className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-blue-900"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-stone-500">
              Updates immediately sync to the interactive map & notify family in NL, BC, and QC.
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-900 hover:bg-blue-950 text-white font-medium px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Publish Coordinates & Field Check-In</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

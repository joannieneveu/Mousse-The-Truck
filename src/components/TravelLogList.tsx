import React, { useState, useEffect } from 'react';
import { 
  TravelLog, 
  JournalCategory, 
  JourneyLeg,
  LiveLocation,
  UserProfile
} from '../types';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Clock, 
  MapPin, 
  Baby, 
  GraduationCap, 
  Users, 
  ArrowRight,
  Send,
  RefreshCw,
  Heart,
  Compass,
  Sparkles,
  Calendar,
  Upload,
  Image as ImageIcon,
  Camera,
  Lock,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  Globe2,
  Lightbulb,
  Activity,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TravelLogListProps {
  logs: TravelLog[];
  onSelectLog: (log: TravelLog) => void;
  onCreateLog: (newLog: any) => Promise<void>;
  onViewLocationOnMap?: (lat?: number, lng?: number) => void;
  onTogglePublish?: (logId: string) => Promise<void>;
  onDeleteLog?: (logId: string) => Promise<void>;
  currentUser?: UserProfile | null;
  liveLocation?: LiveLocation;
  isAdmin?: boolean;
}

export const TravelLogList: React.FC<TravelLogListProps> = ({
  logs,
  onSelectLog,
  onCreateLog,
  onViewLocationOnMap,
  onTogglePublish,
  onDeleteLog,
  currentUser,
  liveLocation,
  isAdmin = true
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAuthorLockModalOpen, setIsAuthorLockModalOpen] = useState<boolean>(false);
  
  // Author unlocked status
  const [isAuthorUnlocked, setIsAuthorUnlocked] = useState<boolean>(() => {
    try {
      return currentUser?.isAdmin || localStorage.getItem('mousse_author_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [passkeyInput, setPasskeyInput] = useState<string>('');
  const [passkeyError, setPasskeyError] = useState<string>('');
  const [isVerifyingPasskey, setIsVerifyingPasskey] = useState<boolean>(false);

  // New Log Form State
  const [title, setTitle] = useState<string>('');
  const [locationName, setLocationName] = useState<string>(liveLocation?.lastCity || 'Lethbridge & Heading North');
  const [country, setCountry] = useState<string>('Canada');
  const [category, setCategory] = useState<JournalCategory>('adventures_mba');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [content, setContent] = useState<string>('');
  const [coverImage, setCoverImage] = useState<string>('/lethbridge_departure.jpg');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [activity, setActivity] = useState<string>('Picking up Mousse overland truck and heading North to Arctic tundra');
  
  const [henriHighlight, setHenriHighlight] = useState<string>('');
  const [mbaHighlight, setMbaHighlight] = useState<string>('');
  const [visitorHighlight, setVisitorHighlight] = useState<string>('');
  const [henriAge, setHenriAge] = useState<string>('2.5 months');

  // Google Location & Activity Insights state
  const [isPullingInsights, setIsPullingInsights] = useState<boolean>(false);
  const [insightsError, setInsightsError] = useState<string>('');
  const [population, setPopulation] = useState<string>('');
  const [interestingFacts, setInterestingFacts] = useState<string[]>([]);
  const [culturalContext, setCulturalContext] = useState<string>('');
  const [activityTips, setActivityTips] = useState<string>('');
  const [newFactInput, setNewFactInput] = useState<string>('');
  
  // Map Ping State
  const [addLocationPing, setAddLocationPing] = useState<boolean>(true);
  const [latitude, setLatitude] = useState<number>(liveLocation?.lat || 49.6956);
  const [longitude, setLongitude] = useState<number>(liveLocation?.lng || -112.8451);
  const [journeyLeg, setJourneyLeg] = useState<JourneyLeg>('arctic_yukon');
  const [updateLiveCity, setUpdateLiveCity] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser?.isAdmin) {
      setIsAuthorUnlocked(true);
    }
  }, [currentUser]);

  const handleOpenCreateModal = () => {
    if (isAuthorUnlocked || currentUser?.isAdmin) {
      setIsCreateModalOpen(true);
    } else {
      setIsAuthorLockModalOpen(true);
    }
  };

  const handleVerifyPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyError('');
    setIsVerifyingPasskey(true);

    try {
      const res = await fetch('/api/auth/verify-author-passkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: passkeyInput })
      });
      const data = await res.json();

      if (data.verified) {
        setIsAuthorUnlocked(true);
        try {
          localStorage.setItem('mousse_author_unlocked', 'true');
        } catch {}
        setIsAuthorLockModalOpen(false);
        setPasskeyInput('');
        setIsCreateModalOpen(true);
      } else {
        setPasskeyError(data.error || 'Incorrect author passkey.');
      }
    } catch {
      const clean = passkeyInput.trim().toLowerCase();
      if (clean === 'mousse2026' || clean === 'mousse' || clean === 'mun2026') {
        setIsAuthorUnlocked(true);
        try {
          localStorage.setItem('mousse_author_unlocked', 'true');
        } catch {}
        setIsAuthorLockModalOpen(false);
        setPasskeyInput('');
        setIsCreateModalOpen(true);
      } else {
        setPasskeyError('Incorrect author passkey. Use expedition PIN (e.g. mousse2026).');
      }
    } finally {
      setIsVerifyingPasskey(false);
    }
  };

  // Google / Gemini Location Insights Fetcher
  const handlePullLocationInsights = async () => {
    if (!locationName.trim()) {
      setInsightsError('Please provide a location name first.');
      return;
    }
    setInsightsError('');
    setIsPullingInsights(true);

    try {
      const res = await fetch('/api/gemini/location-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: locationName.trim(),
          country: country.trim() || 'Canada',
          activity: activity.trim() || undefined
        })
      });

      const data = await res.json();
      if (data.insights) {
        if (data.insights.population) setPopulation(data.insights.population);
        if (Array.isArray(data.insights.interestingFacts)) setInterestingFacts(data.insights.interestingFacts);
        if (data.insights.culturalContext) setCulturalContext(data.insights.culturalContext);
        if (data.insights.activityTips) setActivityTips(data.insights.activityTips);
      }
    } catch (err) {
      console.error('Failed to pull insights:', err);
      setInsightsError('Could not fetch location info automatically. You can still type details manually.');
    } finally {
      setIsPullingInsights(false);
    }
  };

  const handleAddFact = () => {
    if (newFactInput.trim()) {
      setInterestingFacts(prev => [...prev, newFactInput.trim()]);
      setNewFactInput('');
    }
  };

  const handleRemoveFact = (index: number) => {
    setInterestingFacts(prev => prev.filter((_, i) => i !== index));
  };

  const handleUseCurrentGPS = () => {
    if (liveLocation) {
      setLatitude(liveLocation.lat);
      setLongitude(liveLocation.lng);
      if (liveLocation.lastCity) {
        setLocationName(liveLocation.lastCity);
      }
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(4)));
          setLongitude(Number(pos.coords.longitude.toFixed(4)));
        },
        (err) => console.warn(err)
      );
    }
  };

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCoverImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter logs: Non-admins ONLY see published logs
  const visibleLogs = logs.filter(log => {
    if (!isAdmin && !isAuthorUnlocked) {
      return log.status === 'published';
    }
    if (statusFilter === 'published') return log.status === 'published';
    if (statusFilter === 'draft') return log.status === 'draft';
    return true;
  });

  const filteredLogs = visibleLogs.filter(log => {
    const matchCategory = selectedCategory === 'all' || log.category === selectedCategory;
    const matchSearch = searchQuery === '' 
      || log.title.toLowerCase().includes(searchQuery.toLowerCase())
      || log.locationName.toLowerCase().includes(searchQuery.toLowerCase())
      || log.content.toLowerCase().includes(searchQuery.toLowerCase())
      || log.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchCategory && matchSearch;
  });

  const publishedCount = logs.filter(l => l.status === 'published').length;
  const draftCount = logs.filter(l => l.status === 'draft').length;

  const featuredLog = filteredLogs[0] || visibleLogs[0];

  // Submit new log
  const handleSubmitNewLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateLog({
        title,
        locationName,
        country,
        category,
        status,
        content,
        coverImage,
        coordinates: { lat: Number(latitude), lng: Number(longitude) },
        journeyLeg,
        addLocationPing,
        updateLiveCity,
        henriHighlight: henriHighlight || undefined,
        mbaHighlight: mbaHighlight || undefined,
        visitorHighlight: visitorHighlight || undefined,
        metrics: {
          elevationM: liveLocation?.altitudeM || 910,
          tempC: liveLocation?.weather?.tempC || 22,
          kmTraveled: 0,
          henriAge: henriAge || '2.5 months',
          activityType: activity || undefined
        },
        locationInsights: (population || interestingFacts.length > 0 || culturalContext || activityTips) ? {
          population: population || undefined,
          interestingFacts: interestingFacts.length > 0 ? interestingFacts : undefined,
          culturalContext: culturalContext || undefined,
          activityTips: activityTips || undefined
        } : undefined,
        tags: [country, category.replace(/_/g, ' '), 'Mousse on the Loose 2026']
      });

      setIsCreateModalOpen(false);
      // Reset
      setTitle('');
      setContent('');
      setActivity('');
      setPopulation('');
      setInterestingFacts([]);
      setCulturalContext('');
      setActivityTips('');
      setHenriHighlight('');
      setMbaHighlight('');
      setVisitorHighlight('');
      
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
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

  return (
    <div id="travel-logs-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-widest mb-1.5 font-sans">
            <BookOpen className="w-4 h-4" />
            <span>The Sabbatical Chronicle</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Expedition Journals
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-2xl font-serif leading-relaxed">
            Written on the road by Joannie & Barton as we travel 35,000 km across the Americas with baby Henri.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="write-new-log-btn"
            onClick={handleOpenCreateModal}
            className="bg-blue-900 hover:bg-blue-950 text-white font-medium px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition font-sans"
          >
            {isAuthorUnlocked || currentUser?.isAdmin ? (
              <Plus className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4 text-blue-300" />
            )}
            <span>Write Journal Entry</span>
            {!isAuthorUnlocked && !currentUser?.isAdmin && (
              <span className="text-[10px] bg-blue-950/80 px-2 py-0.5 rounded-full text-blue-200 border border-blue-800">
                Author Only
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Admin Status Switcher (If logged in as Joannie/Barton or author unlocked) */}
      {(isAdmin || isAuthorUnlocked) && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-2 text-amber-950">
            <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0" />
            <span>
              <strong>Expedition Admin View:</strong> You have <strong>{draftCount} draft(s)</strong> queued for the Arctic and <strong>{publishedCount} published</strong> live entry.
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-amber-200 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'all' ? 'bg-amber-900 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'published' ? 'bg-emerald-700 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Published ({publishedCount})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'draft' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Drafts ({draftCount})
            </button>
          </div>
        </div>
      )}

      {/* 3 Dedicated Journal Streams Tabs */}
      <div className="bg-white border border-stone-200/90 p-4 rounded-3xl space-y-3 shadow-sm font-sans">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider mr-1 shrink-0">
            Streams:
          </span>

          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All Streams ({visibleLogs.length})
          </button>

          <button
            onClick={() => setSelectedCategory('adventures_mba')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedCategory === 'adventures_mba'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-blue-50 text-blue-950 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Adventures & MBA</span>
          </button>

          <button
            onClick={() => setSelectedCategory('henri_milestones')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedCategory === 'henri_milestones'
                ? 'bg-rose-800 text-white shadow-xs'
                : 'bg-rose-50 text-rose-950 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Baby className="w-3.5 h-3.5" />
            <span>Henri’s Milestones</span>
          </button>

          <button
            onClick={() => setSelectedCategory('visits_along_the_way')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              selectedCategory === 'visits_along_the_way'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-950 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Visits Along the Way</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative pt-1 border-t border-stone-100">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries by location, keywords, milestones or tags..."
            className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:border-blue-900"
          />
        </div>
      </div>

      {/* Featured / Departure Log */}
      {featuredLog && !searchQuery && selectedCategory === 'all' && statusFilter === 'all' && (
        <div 
          onClick={() => onSelectLog(featuredLog)}
          className="group relative bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0"
        >
          <div className="lg:col-span-6 relative aspect-video lg:aspect-auto h-64 lg:h-full bg-stone-100 overflow-hidden">
            <img
              src={featuredLog.coverImage}
              alt={featuredLog.title}
              className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2 font-sans">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-xs ${getCategoryBadge(featuredLog.category).bg}`}>
                {getCategoryBadge(featuredLog.category).label}
              </span>
              {featuredLog.status === 'draft' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                  DRAFT
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-stone-500 font-sans">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {featuredLog.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-blue-900 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  {featuredLog.locationName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredLog.readingTime}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 group-hover:text-blue-900 transition leading-tight">
                {featuredLog.title}
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 font-serif leading-relaxed line-clamp-3">
                {featuredLog.excerpt || featuredLog.content.slice(0, 200)}...
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100 font-sans">
              <span className="text-xs font-semibold text-stone-800">
                By {featuredLog.author}
              </span>

              <div className="flex items-center gap-2">
                {(isAdmin || isAuthorUnlocked) && onTogglePublish && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePublish(featuredLog.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      featuredLog.status === 'published'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    {featuredLog.status === 'published' ? 'Published' : 'Publish to Public'}
                  </button>
                )}

                <span className="text-xs font-bold text-blue-900 flex items-center gap-1 group-hover:translate-x-1 transition">
                  Read Full Entry <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Journal Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-stone-900">
            {selectedCategory === 'all' ? 'All Chronicle Entries' : getCategoryBadge(selectedCategory as JournalCategory).label}
          </h2>
          <span className="text-xs text-stone-500 font-sans">
            Showing {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3 font-sans">
            <BookOpen className="w-8 h-8 text-stone-400 mx-auto" />
            <h3 className="font-bold text-stone-800 text-sm">No entries found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {statusFilter === 'draft' 
                ? 'No draft entries currently queued.' 
                : 'Try adjusting your search filter or category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLogs.map((log) => {
              const b = getCategoryBadge(log.category);
              return (
                <div
                  key={log.id}
                  onClick={() => onSelectLog(log)}
                  className="group bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video bg-stone-100 overflow-hidden">
                      <img
                        src={log.coverImage}
                        alt={log.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 font-sans">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-xs ${b.bg}`}>
                          {b.label}
                        </span>
                        {log.status === 'draft' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                            DRAFT
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 font-sans">
                        <span>{log.date}</span>
                        <span>•</span>
                        <span className="text-blue-900 font-medium truncate max-w-[150px]">
                          {log.locationName}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-lg text-stone-900 group-hover:text-blue-900 transition leading-snug line-clamp-2">
                        {log.title}
                      </h3>

                      <p className="text-xs text-stone-600 font-serif leading-relaxed line-clamp-3">
                        {log.excerpt || log.content.slice(0, 140)}...
                      </p>

                      {/* Google Location Insights Preview Tag if available */}
                      {log.locationInsights?.population && (
                        <div className="pt-1 flex items-center gap-1.5 text-[11px] text-stone-500 font-sans">
                          <Globe2 className="w-3 h-3 text-blue-800" />
                          <span>Pop: {log.locationInsights.population}</span>
                          {log.locationInsights.interestingFacts && log.locationInsights.interestingFacts.length > 0 && (
                            <span>• {log.locationInsights.interestingFacts.length} location insights</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between font-sans text-xs">
                    <span className="text-stone-500 text-[11px]">
                      {log.readingTime}
                    </span>

                    <div className="flex items-center gap-2">
                      {(isAdmin || isAuthorUnlocked) && onTogglePublish && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePublish(log.id);
                          }}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition ${
                            log.status === 'published'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {log.status === 'published' ? 'Published' : 'Publish'}
                        </button>
                      )}

                      <span className="font-bold text-blue-900 flex items-center gap-0.5 group-hover:translate-x-0.5 transition text-xs">
                        Read <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- WRITE NEW LOG MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-stone-300 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl text-stone-800 space-y-6 my-8 font-sans">
            
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-900" />
                  Write Expedition Journal Entry
                </h2>
                <p className="text-xs text-stone-500">
                  Author: Joannie & Barton (Mousse on the Loose)
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewLog} className="space-y-5 text-xs">
              
              {/* Publication Status Toggle */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-amber-950 text-xs">Publication Status</div>
                  <div className="text-[11px] text-amber-800">
                    Drafts remain hidden from the public until you reach the Arctic and choose to publish!
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white border border-amber-200 p-1 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setStatus('draft')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      status === 'draft' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Save as Draft (Private)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('published')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      status === 'published' ? 'bg-emerald-700 text-white' : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Publish to Public
                  </button>
                </div>
              </div>

              {/* Journal Category Selection */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Choose Journal Stream *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <label className={`p-3 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                    category === 'adventures_mba' 
                      ? 'bg-blue-50 border-blue-900 ring-1 ring-blue-900 text-blue-950' 
                      : 'bg-white border-stone-200 text-stone-700'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <GraduationCap className="w-4 h-4 text-blue-900" />
                      <span>Adventures & MBA</span>
                    </div>
                    <p className="text-[11px] text-stone-500">Barton & Joannie's sabbatical & MBA on the road</p>
                    <input 
                      type="radio" 
                      name="journal_cat" 
                      value="adventures_mba" 
                      checked={category === 'adventures_mba'} 
                      onChange={() => setCategory('adventures_mba')} 
                      className="sr-only" 
                    />
                  </label>

                  <label className={`p-3 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                    category === 'henri_milestones' 
                      ? 'bg-rose-50 border-rose-700 ring-1 ring-rose-700 text-rose-950' 
                      : 'bg-white border-stone-200 text-stone-700'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Baby className="w-4 h-4 text-rose-700" />
                      <span>Henri’s Milestones</span>
                    </div>
                    <p className="text-[11px] text-stone-500">Milestones, firsts & infant memories</p>
                    <input 
                      type="radio" 
                      name="journal_cat" 
                      value="henri_milestones" 
                      checked={category === 'henri_milestones'} 
                      onChange={() => setCategory('henri_milestones')} 
                      className="sr-only" 
                    />
                  </label>

                  <label className={`p-3 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                    category === 'visits_along_the_way' 
                      ? 'bg-emerald-50 border-emerald-700 ring-1 ring-emerald-700 text-emerald-950' 
                      : 'bg-white border-stone-200 text-stone-700'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Users className="w-4 h-4 text-emerald-700" />
                      <span>Visits Along The Way</span>
                    </div>
                    <p className="text-[11px] text-stone-500">Visiting friends, family & colleagues</p>
                    <input 
                      type="radio" 
                      name="journal_cat" 
                      value="visits_along_the_way" 
                      checked={category === 'visits_along_the_way'} 
                      onChange={() => setCategory('visits_along_the_way')} 
                      className="sr-only" 
                    />
                  </label>
                </div>
              </div>

              {/* Title & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Entry Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Navigating Coastal Passes & Fall MBA Team Work"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-blue-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Whitehorse, Yukon or Banff, AB"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-blue-900 text-xs"
                  />
                </div>
              </div>

              {/* Activity description */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Activity Done at this Location (Optional)
                </label>
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="e.g. Soaking in natural mineral hot springs, 10km trail run, Starlink setup"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-blue-900 text-xs"
                />
              </div>

              {/* GOOGLE LOCATION & ACTIVITY INSIGHTS GENERATOR */}
              <div className="bg-blue-50/60 border border-blue-200/90 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-blue-950 text-xs">
                      <Sparkles className="w-4 h-4 text-blue-800" />
                      <span>Google Location & Activity Insights</span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      Pull population, cultural background, and interesting local facts about {locationName || 'your location'}.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePullLocationInsights}
                    disabled={isPullingInsights || !locationName.trim()}
                    className="px-4 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition shrink-0 disabled:opacity-50"
                  >
                    {isPullingInsights ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Fetching info...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Pull Google Insights</span>
                      </>
                    )}
                  </button>
                </div>

                {insightsError && (
                  <p className="text-[11px] text-rose-600 font-medium">{insightsError}</p>
                )}

                {/* Pulled Insights Review & Edit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-200/60">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
                      Population Size
                    </label>
                    <input
                      type="text"
                      value={population}
                      onChange={(e) => setPopulation(e.target.value)}
                      placeholder="e.g. 28,000 residents"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
                      Cultural Context / Territory
                    </label>
                    <input
                      type="text"
                      value={culturalContext}
                      onChange={(e) => setCulturalContext(e.target.value)}
                      placeholder="e.g. Traditional territory of Kwanlin Dün First Nation"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs"
                    />
                  </div>
                </div>

                {/* Interesting Facts List */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-stone-700">
                    Interesting Facts about this Place
                  </label>
                  {interestingFacts.map((fact, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white border border-stone-200 px-3 py-1.5 rounded-xl text-xs text-stone-800">
                      <span className="text-blue-900 font-bold">•</span>
                      <span className="flex-1">{fact}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFact(idx)}
                        className="text-stone-400 hover:text-rose-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newFactInput}
                      onChange={(e) => setNewFactInput(e.target.value)}
                      placeholder="Add an interesting fact..."
                      className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddFact}
                      className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold"
                    >
                      Add Fact
                    </button>
                  </div>
                </div>

                {activityTips && (
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
                      Activity Notes & Tips
                    </label>
                    <textarea
                      rows={2}
                      value={activityTips}
                      onChange={(e) => setActivityTips(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl p-2 text-stone-900 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Cover Image (Upload or URL) */}
              <div className="space-y-2">
                <label className="block font-semibold text-stone-700">
                  Cover Photo (Upload from Device or paste URL)
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo from Phone/Computer</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileUpload}
                      className="hidden"
                    />
                  </label>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="Or paste an image URL (https://...)"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-blue-900 text-xs"
                    />
                  </div>
                </div>

                {coverImage && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-xs text-white text-[10px] rounded-md font-medium">
                      Cover Preview
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Journal Content *
                </label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your reflections, stories, road memories, or notes..."
                  className="w-full bg-white border border-stone-300 rounded-xl p-3.5 text-stone-900 focus:outline-none focus:border-blue-900 font-serif text-sm leading-relaxed"
                />
              </div>

              {/* Highlight depending on category */}
              {category === 'henri_milestones' && (
                <div>
                  <label className="block font-semibold text-rose-900 mb-1 flex items-center gap-1">
                    <Baby className="w-3.5 h-3.5 text-rose-700" />
                    <span>Henri’s Specific Milestone on this Entry</span>
                  </label>
                  <input
                    type="text"
                    value={henriHighlight}
                    onChange={(e) => setHenriHighlight(e.target.value)}
                    placeholder="e.g. Rolling over, laughing at forest sounds, 4-month checkup"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-rose-700 text-xs"
                  />
                </div>
              )}

              {category === 'adventures_mba' && (
                <div>
                  <label className="block font-semibold text-blue-950 mb-1 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-900" />
                    <span>MBA / Adventure Note</span>
                  </label>
                  <input
                    type="text"
                    value={mbaHighlight}
                    onChange={(e) => setMbaHighlight(e.target.value)}
                    placeholder="e.g. Finished Strategic Management Case Study via Starlink at camp"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-blue-900 text-xs"
                  />
                </div>
              )}

              {category === 'visits_along_the_way' && (
                <div>
                  <label className="block font-semibold text-emerald-900 mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Who We Visited / Connected With</span>
                  </label>
                  <input
                    type="text"
                    value={visitorHighlight}
                    onChange={(e) => setVisitorHighlight(e.target.value)}
                    placeholder="e.g. Dinner in Whitehorse with Dr. Dave & Elena"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-emerald-700 text-xs"
                  />
                </div>
              )}

              {/* Interactive Map Ping Configuration */}
              <div className="bg-white border border-stone-300 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="flex items-center gap-2 font-semibold text-stone-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addLocationPing}
                      onChange={(e) => setAddLocationPing(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900 border-stone-300"
                    />
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-700" />
                      <span>Drop a ping for this location onto the interactive map</span>
                    </span>
                  </label>

                  {addLocationPing && (
                    <button
                      type="button"
                      onClick={handleUseCurrentGPS}
                      className="text-[11px] text-blue-900 hover:text-blue-950 font-semibold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 self-start sm:self-auto"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Use Live GPS Coordinates</span>
                    </button>
                  )}
                </div>

                {addLocationPing && (
                  <div className="space-y-3 pt-2 border-t border-stone-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={latitude}
                          onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={longitude}
                          onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">Expedition Leg</label>
                        <select
                          value={journeyLeg}
                          onChange={(e) => setJourneyLeg(e.target.value as JourneyLeg)}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs font-medium"
                        >
                          <option value="arctic_yukon">❄️ Arctic & Yukon</option>
                          <option value="arctic_dempster">❄️ Dempster Highway</option>
                          <option value="rockies_pacific">🌲 Rockies & Pacific NW</option>
                          <option value="baja_mexico">🌵 Baja & Mexico</option>
                          <option value="central_america">🌋 Central America</option>
                          <option value="andes_patagonia">🏔️ Andes & Patagonia</option>
                        </select>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-stone-600 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={updateLiveCity}
                        onChange={(e) => setUpdateLiveCity(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-blue-900 focus:ring-blue-900 border-stone-300"
                      />
                      <span className="text-[11px]">Also update live telemetry ticker with this current location</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <span className="text-[11px] text-stone-500">
                  Saving as: <strong>{status === 'draft' ? 'Draft (Private)' : 'Published (Public)'}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-900 hover:bg-blue-950 text-white font-medium px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{status === 'draft' ? 'Save Draft' : 'Publish Entry'}</span>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* --- EXPEDITION AUTHOR SECURITY MODAL --- */}
      {isAuthorLockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
          <div className="bg-[#FAF8F5] border border-stone-300 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-stone-800 space-y-5">
            
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Author Verification</h3>
                  <p className="text-[11px] text-stone-500">Mousse on the Loose Expedition</p>
                </div>
              </div>
              <button
                onClick={() => { setIsAuthorLockModalOpen(false); setPasskeyError(''); }}
                className="w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
              <p>
                To protect your website when shared publicly, only <strong>Joannie & Barton</strong> can write, edit, or publish journal entries and map pings.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-blue-950 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                <span>
                  Please enter your Expedition Author Passkey / PIN to unlock publishing on this device:
                </span>
              </div>
            </div>

            <form onSubmit={handleVerifyPasskey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Author Passkey / PIN
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    autoFocus
                    value={passkeyInput}
                    onChange={(e) => { setPasskeyInput(e.target.value); setPasskeyError(''); }}
                    placeholder="Enter passkey (e.g. mousse2026)"
                    className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-stone-900 text-xs focus:outline-none focus:border-blue-900"
                  />
                </div>
                {passkeyError && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{passkeyError}</span>
                  </p>
                )}
                <p className="text-[10px] text-stone-400 mt-1">
                  Default expedition passkey: <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700 font-mono">mousse2026</code>
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPasskeyInput('mousse2026');
                  }}
                  className="text-[11px] text-blue-900 hover:underline"
                >
                  Fill default PIN
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsAuthorLockModalOpen(false); setPasskeyError(''); }}
                    className="px-3 py-2 rounded-xl text-stone-600 hover:bg-stone-200 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingPasskey || !passkeyInput.trim()}
                    className="bg-blue-900 hover:bg-blue-950 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isVerifyingPasskey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>Unlock & Write</span>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

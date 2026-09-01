import React, { useState } from 'react';
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
  ShieldCheck,
  Globe2,
  Edit3
} from 'lucide-react';
import { JournalEditorModal } from './JournalEditorModal';

interface TravelLogListProps {
  logs: TravelLog[];
  onSelectLog: (log: TravelLog) => void;
  onCreateLog: (newLog: any) => Promise<void>;
  onUpdateLog?: (logId: string, updatedLog: Partial<TravelLog>) => Promise<void>;
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
  onUpdateLog,
  onViewLocationOnMap,
  onTogglePublish,
  onDeleteLog,
  currentUser,
  liveLocation,
  isAdmin: propIsAdmin
}) => {
  const isUserAdmin = Boolean(currentUser?.isAdmin);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingLog, setEditingLog] = useState<TravelLog | null>(null);

  // Filter logs: public users only see published entries, admin sees all
  const visibleLogs = logs.filter(log => {
    if (isUserAdmin) {
      if (statusFilter === 'published') return log.status === 'published';
      if (statusFilter === 'draft') return log.status === 'draft';
      return true;
    }
    return log.status === 'published';
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
    <div id="travel-logs-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header & Admin Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wider mb-1 font-sans">
            <BookOpen className="w-4 h-4" />
            <span>Expedition Chronicles</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Expedition Journals
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-2xl font-serif leading-relaxed">
            Written on the road by Joannie & Barton as we travel 35,000 km across the Americas with baby Henri.
          </p>
        </div>

        {isUserAdmin && (
          <div className="flex items-center gap-3">
            <button
              id="write-new-log-btn"
              onClick={() => {
                setEditingLog(null);
                setIsCreateModalOpen(true);
              }}
              className="bg-blue-900 hover:bg-blue-950 text-white font-medium px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition font-sans"
            >
              <Plus className="w-4 h-4" />
              <span>Write Journal Entry</span>
            </button>
          </div>
        )}
      </div>

      {/* Admin Status Switcher (If logged in as Joannie/Barton) */}
      {isUserAdmin && (
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

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center font-sans">
        
        {/* Stream Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            All Entries ({visibleLogs.length})
          </button>

          <button
            onClick={() => setSelectedCategory('adventures_mba')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCategory === 'adventures_mba'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Adventures & MBA</span>
          </button>

          <button
            onClick={() => setSelectedCategory('henri_milestones')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCategory === 'henri_milestones'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Baby className="w-3.5 h-3.5" />
            <span>Henri’s Milestones</span>
          </button>

          <button
            onClick={() => setSelectedCategory('visits_along_the_way')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCategory === 'visits_along_the_way'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Visits Along the Way</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search stories, places, milestones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-white border border-stone-200 rounded-2xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Featured Story Hero Card (if filtered has entries) */}
      {featuredLog && selectedCategory === 'all' && searchQuery === '' && (
        <div 
          onClick={() => onSelectLog(featuredLog)}
          className="group relative bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0"
        >
          <div className="lg:col-span-7 relative bg-stone-900 overflow-hidden min-h-[300px] sm:min-h-[360px]">
            <img
              src={featuredLog.coverImage}
              alt={featuredLog.title}
              className={`w-full h-full ${
                featuredLog.coverImage.includes('departure.jpeg') ? 'object-cover object-[50%_15%]' : 'object-cover'
              } group-hover:scale-103 transition duration-700`}
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2 font-sans">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-xs text-blue-950 border border-stone-200 shadow-xs">
                ⭐ Featured Chronicle
              </span>
              {featuredLog.status === 'draft' && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs">
                  DRAFT
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 font-sans text-xs">
                <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${getCategoryBadge(featuredLog.category).bg}`}>
                  {getCategoryBadge(featuredLog.category).label}
                </span>
                <span className="text-stone-400">•</span>
                <span className="text-stone-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredLog.readingTime}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-blue-900 font-semibold font-sans">
                <MapPin className="w-3.5 h-3.5" />
                <span>{featuredLog.locationName}</span>
                <span className="text-stone-400">•</span>
                <span className="text-stone-500 font-normal">{featuredLog.date}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 group-hover:text-blue-900 transition leading-tight">
                {featuredLog.title}
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 font-serif leading-relaxed line-clamp-4">
                {featuredLog.excerpt || featuredLog.content.slice(0, 200)}...
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100 font-sans">
              <span className="text-xs font-semibold text-stone-800">
                By {featuredLog.author}
              </span>

              <div className="flex items-center gap-2">
                {isUserAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingLog(featuredLog);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 inline-flex items-center gap-1 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}

                {isUserAdmin && onTogglePublish && (
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
                    <div className="relative aspect-video bg-stone-900 overflow-hidden">
                      <img
                        src={log.coverImage}
                        alt={log.title}
                        className={`w-full h-full ${
                          log.coverImage.includes('departure.jpeg') ? 'object-cover object-[50%_15%]' : 'object-cover'
                        } group-hover:scale-103 transition duration-500`}
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
                      {isUserAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingLog(log);
                          }}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 inline-flex items-center gap-1 transition"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}

                      {isUserAdmin && onTogglePublish && (
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

      {/* --- WRITE / EDIT JOURNAL ENTRY MODAL --- */}
      {(isCreateModalOpen || editingLog !== null) && (
        <JournalEditorModal
          initialLog={editingLog}
          isOpen={isCreateModalOpen || editingLog !== null}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingLog(null);
          }}
          onSave={async (logData) => {
            if (editingLog && onUpdateLog) {
              await onUpdateLog(editingLog.id, logData);
            } else {
              await onCreateLog(logData);
            }
            setIsCreateModalOpen(false);
            setEditingLog(null);
          }}
          liveLocation={liveLocation}
          authorName={currentUser?.name || 'Joannie & Barton'}
        />
      )}

    </div>
  );
};

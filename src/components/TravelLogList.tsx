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
  Search, 
  Clock, 
  MapPin, 
  Baby, 
  GraduationCap, 
  Users, 
  ArrowRight,
  Globe2,
  Check
} from 'lucide-react';

interface TravelLogListProps {
  logs: TravelLog[];
  onSelectLog: (log: TravelLog) => void;
  onViewLocationOnMap?: (lat?: number, lng?: number) => void;
  currentUser?: UserProfile | null;
  liveLocation?: LiveLocation;
}

export const TravelLogList: React.FC<TravelLogListProps> = ({
  logs,
  onSelectLog,
  currentUser,
  liveLocation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Public logs (exclude drafts)
  const visibleLogs = logs.filter(log => log.status !== 'draft');

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

  const getCategoryBadge = (_cat?: JournalCategory) => {
    return { label: 'Expedition Journal', bg: 'bg-blue-100 text-blue-950 border-blue-200' };
  };

  return (
    <div id="travel-logs-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header & Admin Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wider mb-1 font-sans">
            <BookOpen className="w-4 h-4" />
            <span>Expedition Chronicle</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Expedition Journal
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-2xl font-serif leading-relaxed">
            Written on the road by Joannie & Barton as we travel 35,000 km across the Americas with baby Henri.
          </p>
        </div>
      </div>

      {/* Search Bar & Entry Counter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center font-sans">
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 text-white shadow-xs">
            All Entries ({visibleLogs.length})
          </div>
          <span className="text-xs text-stone-500">
            Chronological field dispatches & updates from the road
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px] sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search stories, places, route stops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-8 py-2 bg-white border border-stone-200 rounded-2xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
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
                {featuredLog.metrics?.kmTraveled ? (
                  <>
                    <span className="text-stone-400">•</span>
                    <span className="font-semibold text-stone-700 font-mono">
                      {featuredLog.metrics.kmTraveled.toLocaleString()} km from start
                    </span>
                  </>
                ) : null}
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
            All Journal Dispatches
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
                    <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                      <span>{log.readingTime}</span>
                      {log.metrics?.kmTraveled ? (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-stone-700 font-mono">
                            {log.metrics.kmTraveled.toLocaleString()} km
                          </span>
                        </>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
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

    </div>
  );
};

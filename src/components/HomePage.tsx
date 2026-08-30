import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  BookOpen, 
  Camera, 
  Users, 
  Truck, 
  Radio, 
  Baby, 
  GraduationCap, 
  Heart, 
  ArrowRight, 
  Sparkles, 
  Map, 
  Calendar,
  Mountain,
  Navigation,
  Globe,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  X,
  Instagram
} from 'lucide-react';
import { LiveLocation, TravelLog, Waypoint } from '../types';

interface HomePageProps {
  onNavigateTab: (tab: 'home' | 'map' | 'journal' | 'gallery' | 'rig' | 'family' | 'live') => void;
  onSelectLog: (log: TravelLog) => void;
  liveLocation: LiveLocation;
  recentLogs: TravelLog[];
  waypoints: Waypoint[];
  onOpenSubscribeModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateTab,
  onSelectLog,
  liveLocation,
  recentLogs,
  waypoints,
  onOpenSubscribeModal
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string; caption: string } | null>(null);

  return (
    <div id="home-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 animate-in fade-in duration-300 font-sans">
      
      {/* HERO SECTION WITH CUSTOM "MOUSSE ON THE LOOSE" GRAPHIC EMBLEM */}
      <section className="relative rounded-3xl overflow-hidden border border-stone-200/90 bg-[#FAF8F5] shadow-xs">
        <div className="p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Graphic Banner, Story & Actions */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6">
            
            {/* Custom Expedition Graphic Emblem Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-100 border border-emerald-800/80 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <Compass className="w-4 h-4 text-emerald-300" />
              <span className="tracking-wider uppercase text-[11px] font-bold">Mousse on the Loose • 35,000 KM</span>
              <span className="text-emerald-500">•</span>
              <span className="text-emerald-300">2026 – 2027</span>
            </div>

            {/* Main Graphic Title */}
            <div className="space-y-2">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-850 to-slate-950 text-white flex items-center justify-center font-black text-2xl shadow-md border border-emerald-600/40 shrink-0">
                  <span className="bg-gradient-to-br from-emerald-300 to-amber-200 bg-clip-text text-transparent">M</span>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    Mousse on the Loose
                  </h1>
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-900">
                    Arctic to Antarctica • 35,000 km Overland Expedition
                  </p>
                </div>
              </div>
            </div>

            {/* Narrative Bio */}
            <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-normal">
              We are Joannie and Barton, a Newfoundland-based blended family, travelling with our newest addition, Henri. In August 2026, we set off in our custom moss-green overland truck, Mousse, on Mousse on the Loose: a year-long, 35,000 km journey from the Arctic to Antarctica, alongside remote Executive MBA studies. Our older children will join us for stretches of the adventure between university, work and lives of their own.
            </p>

            {/* Key Telemetry Quick Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-stone-500 text-[10px] font-bold uppercase tracking-wider">
                  <MapPin className="w-3 h-3 text-blue-900" />
                  <span>Launch Point</span>
                </div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm mt-1 truncate">
                  Lethbridge, AB
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-stone-500 text-[10px] font-bold uppercase tracking-wider">
                  <Baby className="w-3 h-3 text-blue-900" />
                  <span>Infant Henri</span>
                </div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm mt-1">
                  Born June 2026
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-stone-500 text-[10px] font-bold uppercase tracking-wider">
                  <GraduationCap className="w-3 h-3 text-blue-900" />
                  <span>Executive MBAs</span>
                </div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm mt-1">
                  Remote Studies
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  <Truck className="w-3 h-3 text-emerald-800" />
                  <span>The Rig</span>
                </div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm mt-1">
                  Mousse (4x4)
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => onNavigateTab('map')}
                className="px-5 py-3 bg-blue-900 hover:bg-blue-950 text-white rounded-2xl font-semibold text-sm flex items-center gap-2 shadow-sm transition hover:scale-[1.01]"
              >
                <Compass className="w-4 h-4" />
                <span>Follow the Route Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('journal')}
                className="px-5 py-3 bg-white hover:bg-stone-100 text-slate-900 border border-stone-300 rounded-2xl font-semibold text-sm flex items-center gap-2 transition"
              >
                <BookOpen className="w-4 h-4 text-blue-900" />
                <span>Read Expedition Journals</span>
              </button>

              <a
                href="https://www.instagram.com/moussethetruck/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 bg-orange-50 hover:bg-orange-100/90 text-orange-900 border border-orange-300/80 rounded-2xl font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <Instagram className="w-4 h-4 text-orange-700" />
                <span>Follow @moussethetruck</span>
              </a>

              <button
                onClick={onOpenSubscribeModal}
                className="px-4 py-3 text-stone-600 hover:text-blue-900 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Subscribe for Updates</span>
              </button>
            </div>

          </div>

          {/* Right Column: Hero Photo Showcase with Portrait Departure */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center">
            
            {/* Departure Photo: Formatted in Portrait (Preserving Heads with object-cover object-top) */}
            <div 
              onClick={() => setSelectedPhoto({
                url: '/departure.jpeg',
                title: 'The Departure in Mousse',
                caption: 'Joannie, Barton, and baby Henri setting off in Lethbridge, AB to begin the 35,000 km journey to the Arctic and Antarctica.'
              })}
              className="relative rounded-3xl overflow-hidden border border-stone-300 shadow-md bg-stone-900 group cursor-pointer aspect-[3/4] max-h-[500px] w-full"
            >
              <img
                src="/departure.jpeg"
                alt="The Departure - Joannie, Barton, and baby Henri in portrait view"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-700/50">
                    Portrait • Departure Launch
                  </span>
                  <span className="p-1.5 rounded-lg bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 transition">
                    <Maximize2 className="w-4 h-4" />
                  </span>
                </div>
                <div className="font-bold text-lg sm:text-xl mt-2">The Grand Departure</div>
                <p className="text-stone-300 text-xs sm:text-sm mt-0.5">Joannie, Barton & baby Henri setting off in Mousse</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* WHY WE NAMED HER MOUSSE (MOSS, NEWFOUNDLAND MOOSE, & PETIT MOUSSE) */}
      <section className="rounded-3xl border border-stone-200 bg-[#FAF8F5] p-6 sm:p-10 shadow-xs">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-100 border border-emerald-800 shadow-xs">
              <Truck className="w-3.5 h-3.5 text-emerald-300" />
              <span>The Meaning Behind the Name</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Why We Named Our Overland Truck “Mousse”
            </h2>
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-normal max-w-2xl mx-auto">
              When we built our custom moss-green overland truck, the name <strong>Mousse</strong> brought together three deep inspirations for our family’s journey:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            
            {/* Meaning 1: Tundra Moss */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-sm mb-3">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  Tundra Moss (French <em>Mousse</em>)
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  In French, <em>mousse</em> translates directly to <strong>moss</strong>. The truck is wrapped in the exact deep moss-green tone found flourishing across the Arctic and sub-Arctic tundra.
                </p>
              </div>
              <div className="text-[11px] font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-150">
                Arctic & Tundra Ecology
              </div>
            </div>

            {/* Meaning 2: Newfoundland Moose */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm mb-3">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  The Newfoundland Moose
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  A proud phonetic nod to our rugged Newfoundland home base, where wild moose reign supreme across the rocky coastlines and boreal forests.
                </p>
              </div>
              <div className="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-150">
                Newfoundland Roots
              </div>
            </div>

            {/* Meaning 3: French Petit Mousse */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm mb-3">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  French <em>“Petit Mousse”</em>
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  A traditional French maritime term of endearment for a cabin boy or young voyager taking his first voyage at sea—a loving tribute to our infant son <strong>Henri</strong> on his inaugural 35,000 km expedition!
                </p>
              </div>
              <div className="text-[11px] font-semibold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-150">
                Young Voyager Henri
              </div>
            </div>

          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onNavigateTab('rig')}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition"
            >
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Explore Rig Specs, Systems & Build Photos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* THE 3 DEDICATED JOURNAL STREAMS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 uppercase tracking-wider mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Three Field Story Streams</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Stories from the 35,000 km Sabbatical
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('journal')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-950 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View all journal entries</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Stream 1 */}
          <div 
            onClick={() => onNavigateTab('journal')}
            className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  Adventures & MBA
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-2 group-hover:text-blue-900 transition">
                  Barton & Joannie
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                4x4 mountain passes, wilderness camp meals, off-grid solar rigs, and balancing remote Executive MBA coursework with medical sabbatical reflections.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-blue-900">
              <span>Read Adult & MBA Logs</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Stream 2 */}
          <div 
            onClick={() => onNavigateTab('journal')}
            className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                <Baby className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Infant Milestones
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-2 group-hover:text-emerald-900 transition">
                  Henri’s Milestones
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                Born June 2026. Following baby Henri’s first words, tummy time on Arctic pebble beaches, custom truck crib naps, and growing up on the overland trail.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-900">
              <span>Read Henri’s Growth Logs</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Stream 3 */}
          <div 
            onClick={() => onNavigateTab('journal')}
            className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Family & Friends
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-2 group-hover:text-amber-900 transition">
                  Visits Along the Way
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                Our older children joining for legs of the trip, reunions with medical colleagues and MBA classmates, and unforgettable encounters across the continents.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-amber-900">
              <span>Read Visit Stories</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

        </div>
      </section>

      {/* ROUTE OVERVIEW STRIP & QUICK MAP JUMP */}
      <section className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-md relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700">
              <Globe className="w-3.5 h-3.5" />
              <span>Full Route Trajectory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Arctic Ocean to Antarctica: 35,000 Kilometers
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              From the Beaufort Sea ice edge at Tuktoyaktuk, south through the Yukon, Canadian Rockies, Pacific Northwest, Baja California, Central America, the Andes, down to Tierra del Fuego.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('map')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow transition"
              >
                <Compass className="w-4 h-4" />
                <span>Open Full Interactive Route Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('live')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Satellite Tracker</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Expedition Route Launch</div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">Starting Point</span>
                <span className="text-emerald-400">Lethbridge Pickup ➔ Arctic Leg</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full w-[10%]"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700">
                <div className="text-[10px] text-slate-400">Expedition Phase</div>
                <div className="font-bold text-white mt-0.5">Rig Pickup & Launch</div>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700">
                <div className="text-[10px] text-slate-400">Next Destination</div>
                <div className="font-bold text-white mt-0.5">Arctic Dempster Highway</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FULL PHOTO LIGHTBOX MODAL */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-950 text-white">
              <div>
                <h3 className="font-bold text-sm sm:text-base">{selectedPhoto.title}</h3>
                <p className="text-xs text-stone-400">{selectedPhoto.caption}</p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

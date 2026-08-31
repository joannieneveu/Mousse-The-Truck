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
  Instagram,
  Home,
  Upload,
  ArrowUpRight
} from 'lucide-react';
import { LiveLocation, TravelLog, Waypoint, FamilyMember } from '../types';
import { INITIAL_FAMILY_MEMBERS } from '../data/initialData';
import { useLanguage } from '../context/LanguageContext';

interface HomePageProps {
  onNavigateTab: (tab: 'home' | 'map' | 'journal' | 'gallery' | 'rig' | 'live') => void;
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
  const { language, t } = useLanguage();
  const isFr = language === 'fr';
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string; caption: string } | null>(null);
  
  // Family state (merged into Home)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(INITIAL_FAMILY_MEMBERS);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [familyHeroPhoto, setFamilyHeroPhoto] = useState<string>(() => {
    try {
      return localStorage.getItem('mousse_family_hero_photo') || '/Family.jpeg';
    } catch {
      return '/Family.jpeg';
    }
  });
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [isEditingHeroPhoto, setIsEditingHeroPhoto] = useState<boolean>(false);

  const onTripMembers = familyMembers.filter(m => m.onTripWithUs);
  const atHomeMembers = familyMembers.filter(m => !m.onTripWithUs);

  const handleUpdateAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !newPhotoUrl.trim()) return;

    setFamilyMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, avatar: newPhotoUrl.trim() } : m));
    setEditingMember(null);
    setNewPhotoUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'member' | 'hero') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (target === 'hero') {
          setFamilyHeroPhoto(dataUrl);
          try {
            localStorage.setItem('mousse_family_hero_photo', dataUrl);
          } catch {
            // ignore quota
          }
          setIsEditingHeroPhoto(false);
        } else if (editingMember) {
          setFamilyMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, avatar: dataUrl } : m));
          setEditingMember(null);
        }
      }
    };
    reader.readAsDataURL(file);
  };

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
              <span className="tracking-wider uppercase text-[11px] font-bold">
                {isFr ? 'Mousse on the Loose • 35 000 KM' : 'Mousse on the Loose • 35,000 KM'}
              </span>
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
                    {isFr ? 'De l\'Arctique à l\'Antarctique • Expédition tout-terrain de 35 000 km' : 'Arctic to Antarctica • 35,000 km Overland Expedition'}
                  </p>
                </div>
              </div>
            </div>

            {/* Narrative Bio */}
            <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-normal">
              {isFr
                ? "Nous sommes Joannie et Barton, une famille recomposée de Terre-Neuve voyageant avec notre plus récent moussaillon, Henri. En août 2026, nous sommes partis à bord de notre camion tout-terrain vert mousse sur mesure pour Mousse on the Loose : une expédition d'un an et 35 000 km de l'Arctique à l'Antarctique, tout en poursuivant des études d'Executive MBA à distance. Les plus grands enfants se joindront à nous pour certaines étapes de l'aventure entre leurs études universitaires, leur travail et leur vie personnelle."
                : "We are Joannie and Barton, a Newfoundland-based blended family, travelling with our newest addition, Henri. In August 2026, we set off in our custom moss-green overland truck, Mousse, on Mousse on the Loose: a year-long, 35,000 km journey from the Arctic to Antarctica, alongside remote Executive MBA studies. The older children will join us for stretches of the adventure between university, work and lives of their own."}
            </p>

            {/* Key Telemetry Quick Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-stone-500 text-[10px] font-bold uppercase tracking-wider">
                  <MapPin className="w-3 h-3 text-blue-900" />
                  <span>{isFr ? 'Point de départ' : 'Launch Point'}</span>
                </div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm mt-1 truncate">
                  Lethbridge, AB
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-stone-500 text-[10px] font-bold uppercase tracking-wider">
                  <Baby className="w-3 h-3 text-blue-900" />
                  <span>{isFr ? 'Bébé Henri' : 'Infant Henri'}</span>
                </div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm mt-1">
                  {isFr ? 'Né en juin 2026' : 'Born June 2026'}
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-stone-500 text-[10px] font-bold uppercase tracking-wider">
                  <GraduationCap className="w-3 h-3 text-blue-900" />
                  <span>{isFr ? 'Executive MBAs' : 'Executive MBAs'}</span>
                </div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm mt-1">
                  {isFr ? 'Études à distance' : 'Remote Studies'}
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  <Truck className="w-3 h-3 text-emerald-800" />
                  <span>{isFr ? 'Le Camion' : 'The Rig'}</span>
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
                <span>{isFr ? 'Suivre la carte de l\'itinéraire' : 'Follow the Route Map'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('journal')}
                className="px-5 py-3 bg-white hover:bg-stone-100 text-slate-900 border border-stone-300 rounded-2xl font-semibold text-sm flex items-center gap-2 transition"
              >
                <BookOpen className="w-4 h-4 text-blue-900" />
                <span>{isFr ? 'Lire les journaux d\'expédition' : 'Read Expedition Journals'}</span>
              </button>

              <a
                href="https://www.instagram.com/moussethetruck/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 bg-orange-50 hover:bg-orange-100/90 text-orange-900 border border-orange-300/80 rounded-2xl font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <Instagram className="w-4 h-4 text-orange-700" />
                <span>{isFr ? 'Suivre @moussethetruck' : 'Follow @moussethetruck'}</span>
              </a>

              <button
                onClick={onOpenSubscribeModal}
                className="px-4 py-3 text-stone-600 hover:text-blue-900 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{isFr ? 'S\'abonner aux nouvelles' : 'Subscribe for Updates'}</span>
              </button>
            </div>

          </div>

          {/* Right Column: Hero Photo Showcase with Fixed Portrait Departure */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center items-center lg:items-end">
            
            {/* Departure Photo: Fixed Format Portrait (Ensures Baby Henri is 100% visible) */}
            <div 
              onClick={() => setSelectedPhoto({
                url: '/departure.jpeg',
                title: 'The Grand Departure in Mousse',
                caption: 'Joannie, Barton, and baby Henri setting off in Lethbridge, AB to begin the 35,000 km expedition to the Arctic and Antarctica.'
              })}
              className="relative rounded-3xl overflow-hidden border border-stone-300 shadow-lg bg-stone-900 group cursor-pointer aspect-[3/4] w-full max-w-xs sm:max-w-sm lg:max-w-md mx-auto lg:mx-0"
            >
              <img
                src="/departure.jpeg"
                alt="The Departure - Joannie, Barton, and baby Henri in fixed portrait format"
                className="w-full h-full object-cover object-[50%_15%] group-hover:scale-103 transition duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/85 px-2.5 py-0.5 rounded-md border border-emerald-700/50 shadow-xs">
                    Fixed Portrait • Expedition Launch
                  </span>
                  <span className="p-1.5 rounded-lg bg-black/40 text-white/90 opacity-0 group-hover:opacity-100 transition">
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
              <span>{isFr ? 'La signification derrière le nom' : 'The Meaning Behind the Name'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {isFr ? 'Pourquoi nous avons nommé notre camion « Mousse »' : 'Why We Named Our Overland Truck “Mousse”'}
            </h2>
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-normal max-w-2xl mx-auto">
              {isFr
                ? 'Lorsque nous avons conçu notre camion tout-terrain sur mesure vert mousse, le nom Mousse a réuni trois inspirations profondes pour l\'expédition de notre famille :'
                : 'When we built our custom moss-green overland truck, the name Mousse brought together three deep inspirations for our family’s journey:'}
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
                  {isFr ? 'La Mousse de la Toundra' : 'Tundra Moss (French Mousse)'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {isFr
                    ? 'En français, la mousse évoque la végétation résiliente du Grand Nord. Le véhicule arbore exactement cette teinte vert mousse profonde qui s\'épanouit à travers la toundra arctique et subarctique.'
                    : 'In French, mousse translates directly to moss. The truck is wrapped in the exact deep moss-green tone found flourishing across the Arctic and sub-Arctic tundra.'}
                </p>
              </div>
              <div className="text-[11px] font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-150">
                {isFr ? 'Écologie arctique et toundra' : 'Arctic & Tundra Ecology'}
              </div>
            </div>

            {/* Meaning 2: Newfoundland Moose */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm mb-3">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  {isFr ? 'L\'orignal de Terre-Neuve (Moose)' : 'The Newfoundland Moose'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {isFr
                    ? 'Un clin d\'œil phonétique à nos racines de Terre-Neuve, où les orignaux sauvages règnent en maîtres sur les côtes rocheuses et les forêts boréales.'
                    : 'A proud phonetic nod to our rugged Newfoundland home base, where wild moose reign supreme across the rocky coastlines and boreal forests.'}
                </p>
              </div>
              <div className="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-150">
                {isFr ? 'Racines de Terre-Neuve' : 'Newfoundland Roots'}
              </div>
            </div>

            {/* Meaning 3: French Petit Mousse */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm mb-3">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  {isFr ? 'Le « Petit Mousse »' : 'French “Petit Mousse”'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {isFr
                    ? 'Le terme maritime traditionnel affectueux pour désigner un jeune marin lors de son tout premier voyage en mer—un hommage affectueux à notre fils Henri pour son expédition inaugurale de 35 000 km !'
                    : 'A traditional French maritime term of endearment for a cabin boy or young voyager taking his first voyage at sea—a loving tribute to our infant son Henri on his inaugural 35,000 km expedition!'}
                </p>
              </div>
              <div className="text-[11px] font-semibold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-150">
                {isFr ? 'Jeune moussaillon Henri' : 'Young Voyager Henri'}
              </div>
            </div>

          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onNavigateTab('rig')}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition"
            >
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>{isFr ? 'Explorer la fiche technique, les systèmes et photos' : 'Explore Rig Specs, Systems & Build Photos'}</span>
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
              <span>{isFr ? 'Trois flux de récits de voyage' : 'Three Field Story Streams'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {isFr ? 'Récits du congé sabbatique de 35 000 km' : 'Stories from the 35,000 km Sabbatical'}
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('journal')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-950 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>{isFr ? 'Voir tous les articles du journal' : 'View all journal entries'}</span>
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
                  {isFr ? 'Aventures & MBA' : 'Adventures & MBA'}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-2 group-hover:text-blue-900 transition">
                  Barton & Joannie
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                {isFr
                  ? 'Cols de montagne en 4x4, repas de camp en pleine nature, autonomie solaire et équilibre entre les cours d\'Executive MBA et les réflexions du sabbatique médical.'
                  : '4x4 mountain passes, wilderness camp meals, off-grid solar rigs, and balancing remote Executive MBA coursework with medical sabbatical reflections.'}
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-blue-900">
              <span>{isFr ? 'Lire le journal Adultes & MBA' : 'Read Adult & MBA Logs'}</span>
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
                  {isFr ? 'Grandir sur la route' : 'Infant Milestones'}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-2 group-hover:text-emerald-900 transition">
                  {isFr ? 'Les progrès d\'Henri' : 'Henri’s Milestones'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                {isFr
                  ? 'Né en juin 2026. Suivez les premiers mots de bébé Henri, ses moments d\'éveil sur les plages de galets arctiques, ses siestes dans le camion et son quotidien sur la piste.'
                  : 'Born June 2026. Following baby Henri’s first words, tummy time on Arctic pebble beaches, custom truck crib naps, and growing up on the overland trail.'}
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-900">
              <span>{isFr ? 'Lire le journal d\'Henri' : 'Read Henri’s Growth Logs'}</span>
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
                  {isFr ? 'Famille & Amis' : 'Family & Friends'}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-2 group-hover:text-amber-900 transition">
                  {isFr ? 'Visites au fil de la route' : 'Visits Along the Way'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                {isFr
                  ? 'Les plus grands enfants qui nous rejoignent pour des tronçons, retrouvailles avec des collègues médecins et camarades de MBA, et rencontres inoubliables.'
                  : 'The older children joining for legs of the trip, reunions with medical colleagues and MBA classmates, and unforgettable encounters across the continents.'}
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-amber-900">
              <span>{isFr ? 'Lire les récits de visites' : 'Read Visit Stories'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

        </div>
      </section>

      {/* OUR BLENDED FAMILY: EXPEDITION TRIO & FAMILY AT HOME (MERGED FROM FAMILY TAB) */}
      <section id="family-section" className="space-y-12 pt-4 border-t border-stone-200">
        
        {/* Family Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 uppercase tracking-wider mb-1">
              <Users className="w-3.5 h-3.5 text-emerald-800" />
              <span>{isFr ? 'Notre famille recomposée de Terre-Neuve' : 'Our Blended Newfoundland Family'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {isFr ? 'L\'équipage derrière Mousse on the Loose' : 'Meet the Crew Behind Mousse on the Loose'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md">
            {isFr
              ? 'Joannie, Barton et bébé Henri sur la route à plein temps, soutenus par les plus grands enfants qui nous encouragent depuis la maison et nous rejoignent pour des étapes.'
              : 'Joannie, Barton, and baby Henri on the road full-time, supported by the older kids cheering from home and joining for legs of the route.'}
          </p>
        </div>

        {/* Editorial Overview Card with Family Photo */}
        <div className="relative rounded-3xl overflow-hidden border border-stone-200 bg-[#FAF8F5] text-stone-900 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            <div className="p-6 sm:p-10 lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/10 text-emerald-950 border border-emerald-900/15">
                <Users className="w-3.5 h-3.5 text-emerald-900" />
                <span>{isFr ? 'Mousse on the Loose • De l\'Arctique à l\'Antarctique' : 'Mousse on the Loose • Arctic to Antarctica'}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                {isFr ? 'Joannie, Barton, Bébé Henri & L\'Expédition des Amériques' : 'Joannie, Barton, Baby Henri & The Americas Expedition'}
              </h3>

              <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-normal">
                {isFr
                  ? "Partis de St. John's, Terre-Neuve à bord de notre camion tout-terrain Mousse, notre famille recomposée entreprend un congé sabbatique de 35 000 km à travers les Amériques. Tandis que Joannie, Barton et bébé Henri voyagent à plein temps dans le camion, les plus grands enfants nous encouragent depuis la maison et planifient des séjours avec nous au fil du parcours entre leurs études et leurs vies professionnelles."
                  : "Setting out from St. John's, Newfoundland and launching our overland rig Mousse, our blended family is taking on a 35,000 km sabbatical across the Americas. While Joannie, Barton, and baby Henri travel full-time in the truck, the older kids are cheering from home and planning fly-in legs along our route between their studies and careers."}
              </p>

              {/* Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-200">
                <div className="bg-white/90 border border-stone-200 rounded-2xl p-3 shadow-xs">
                  <div className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">{isFr ? 'Port d\'attache' : 'Home Base'}</div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">{isFr ? 'Terre-Neuve, Canada' : 'Newfoundland, Canada'}</div>
                </div>
                <div className="bg-white/90 border border-stone-200 rounded-2xl p-3 shadow-xs">
                  <div className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider">{isFr ? 'Le Camion (Mousse)' : 'The Rig (Mousse)'}</div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">Lethbridge (Aug 27)</div>
                </div>
                <div className="bg-white/90 border border-stone-200 rounded-2xl p-3 shadow-xs">
                  <div className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">{isFr ? 'Jeune explorateur' : 'Infant Explorer'}</div>
                  <div className="font-bold text-blue-950 text-xs sm:text-sm mt-0.5">{isFr ? 'Henri (Né en juin 2026)' : 'Henri (Born June 2026)'}</div>
                </div>
                <div className="bg-white/90 border border-stone-200 rounded-2xl p-3 shadow-xs">
                  <div className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">{isFr ? 'Études en route' : 'Studies On Road'}</div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">{isFr ? 'Executive MBAs (À distance)' : 'Executive MBAs (Remote)'}</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-6 flex flex-col justify-center">
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-md group bg-stone-100">
                <img
                  src={familyHeroPhoto}
                  alt="Joannie, Barton, and baby Henri on the Newfoundland pebble beach"
                  className="w-full h-80 object-cover group-hover:scale-105 transition duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">{isFr ? 'Portrait de famille d\'expédition' : 'Expedition Family Portrait'}</span>
                      <div className="text-white text-sm font-bold">Joannie, Barton & Baby Henri</div>
                      <div className="text-stone-300 text-[11px]">{isFr ? 'Plage de galets de Terre-Neuve, août 2026' : 'Newfoundland pebble coast, August 2026'}</div>
                    </div>
                    <button
                      onClick={() => setIsEditingHeroPhoto(true)}
                      className="px-2.5 py-1.5 bg-white/20 backdrop-blur-md hover:bg-blue-900 text-white rounded-xl text-xs flex items-center gap-1 shadow transition cursor-pointer"
                      title="Change or upload family photo"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isFr ? 'Changer la photo' : 'Change Photo'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* The Sabbatical Crew on the Road */}
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-6 h-6 text-blue-900" />
              {isFr ? 'Sur la route : Le trio de l\'expédition à plein temps' : 'On the Road: The Full-Time Expedition Trio'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              {isFr
                ? 'Joannie, Barton et bébé Henri voyageant à plein temps dans notre camion 4x4 tout-terrain personnalisé.'
                : 'Joannie, Barton, and baby Henri traveling full-time in our custom 4x4 overland truck.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {onTripMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-900/30 shadow-xs"
                      />
                      <button
                        onClick={() => { setEditingMember(member); setNewPhotoUrl(''); }}
                        title="Update photo"
                        className="absolute -bottom-1 -right-1 p-1.5 bg-blue-950 hover:bg-blue-900 text-white rounded-lg opacity-85 hover:opacity-100 transition shadow-xs cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{member.name}</h4>
                      <div className="text-xs font-semibold text-blue-900">{member.relation}</div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
                    {member.bio}
                  </p>

                  {member.detailNote && (
                    <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-2.5 text-[11px] text-stone-700">
                      <span className="font-semibold text-slate-900">{isFr ? 'Statut : ' : 'Status: '}</span>
                      {member.detailNote}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <button
                    onClick={() => { setEditingMember(member); setNewPhotoUrl(''); }}
                    className="text-blue-900 hover:text-blue-950 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{isFr ? 'Mettre à jour la photo' : 'Update Picture'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Our Family at Home (Monogram avatars per guidelines) */}
        <div className="space-y-6 pt-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Home className="w-6 h-6 text-stone-700" />
              {isFr ? 'Notre famille à la maison' : 'Our Family at Home'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              {isFr
                ? 'Les plus grands enfants de notre famille recomposée qui nous soutiennent, suivent nos coordonnées en direct et veillent sur leur petit frère Henri.'
                : 'The older kids in our blended family cheering us on, tracking our live coordinates, and following little brother Henri.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {atHomeMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-3 flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {/* Monogram avatar badge instead of photo */}
                    <div className="w-12 h-12 rounded-2xl bg-blue-950 text-white flex items-center justify-center font-bold text-base shadow-xs border border-blue-900">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{member.name}</h4>
                      <div className="text-xs text-stone-500">{member.relation}</div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed font-normal">
                    {member.bio}
                  </p>
                </div>

                {member.detailNote && (
                  <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-2 text-[11px] text-stone-700 font-medium">
                    {member.detailNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instagram Follow Banner */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-stone-50 border border-orange-200/90 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-orange-800 font-bold text-base">
              <Instagram className="w-5 h-5 text-orange-700" />
              <span>{isFr ? 'Suivre l\'expédition sur Instagram' : 'Follow the Expedition on Instagram'}</span>
            </div>
            <p className="text-xs text-stone-600 max-w-xl leading-relaxed">
              {isFr
                ? 'Suivez nos reels quotidiens, nos installations de camp, les progrès de bébé Henri et les coulisses de notre périple de l\'Arctique à Ushuaïa.'
                : 'Follow our daily reels, camp setups, baby Henri milestones, and behind-the-scenes overland stories as we make our way from the Arctic to Ushuaia.'}
            </p>
          </div>

          <a
            href="https://www.instagram.com/moussethetruck/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-700 hover:bg-orange-800 text-white font-semibold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition shrink-0"
          >
            <span>@moussethetruck</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

      </section>

      {/* ROUTE OVERVIEW STRIP & QUICK MAP JUMP */}
      <section className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-md relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700">
              <Globe className="w-3.5 h-3.5" />
              <span>{isFr ? 'Trajectoire complète de l\'itinéraire' : 'Full Route Trajectory'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {isFr ? 'De l\'océan Arctique à l\'Antarctique : 35 000 kilomètres' : 'Arctic Ocean to Antarctica: 35,000 Kilometers'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {isFr
                ? 'De la mer de Beaufort à Tuktoyaktuk, vers le sud à travers le Yukon, les Rocheuses canadiennes, le nord-ouest du Pacifique, la Basse-Californie, l\'Amérique centrale, les Andes, jusqu\'à la Terre de Feu.'
                : 'From the Beaufort Sea ice edge at Tuktoyaktuk, south through the Yukon, Canadian Rockies, Pacific Northwest, Baja California, Central America, the Andes, down to Tierra del Fuego.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('map')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow transition"
              >
                <Compass className="w-4 h-4" />
                <span>{isFr ? 'Ouvrir la carte interactive complète' : 'Open Full Interactive Route Map'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('live')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isFr ? 'Suivi satellite en direct' : 'Live Satellite Tracker'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isFr ? 'Lancement de l\'itinéraire' : 'Expedition Route Launch'}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">{isFr ? 'Point de départ' : 'Starting Point'}</span>
                <span className="text-emerald-400">{isFr ? 'Prise en main à Lethbridge ➔ Étape Arctique' : 'Lethbridge Pickup ➔ Arctic Leg'}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full w-[10%]"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700">
                <div className="text-[10px] text-slate-400">{isFr ? 'Phase actuelle' : 'Expedition Phase'}</div>
                <div className="font-bold text-white mt-0.5">{isFr ? 'Prise en main & Départ' : 'Rig Pickup & Launch'}</div>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700">
                <div className="text-[10px] text-slate-400">{isFr ? 'Prochaine destination' : 'Next Destination'}</div>
                <div className="font-bold text-white mt-0.5">{isFr ? 'Route Dempster (Arctique)' : 'Arctic Dempster Highway'}</div>
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
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer"
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

      {/* Photo update modal for Joannie, Barton & Henri */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-stone-300 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Update Profile Picture for {editingMember.name}
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              {/* Option A: Select file from device */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2">
                <label className="block font-semibold text-stone-800">
                  Select Real Photo from Device
                </label>
                <p className="text-[11px] text-stone-500">
                  Choose your exact original photo file (JPG, PNG).
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'member')}
                  className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-950 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 text-stone-400 text-center">
                <div className="h-[1px] bg-stone-300 flex-1"></div>
                <span>OR PASTE URL</span>
                <div className="h-[1px] bg-stone-300 flex-1"></div>
              </div>

              {/* Option B: Enter URL */}
              <form onSubmit={handleUpdateAvatar} className="space-y-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Image Web Link / URL
                  </label>
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="https://... or photo link"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 rounded-xl bg-stone-200 text-stone-700 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newPhotoUrl.trim()}
                    className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    Save Photo URL
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Hero Photo update modal */}
      {isEditingHeroPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-stone-300 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Upload Real Family Photo
              </h3>
              <button
                onClick={() => setIsEditingHeroPhoto(false)}
                className="w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2">
                <label className="block font-semibold text-stone-800">
                  Select Family Photo File from Your Device
                </label>
                <p className="text-[11px] text-stone-500">
                  Select your original family photo.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'hero')}
                  className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-950 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingHeroPhoto(false)}
                  className="px-4 py-2 rounded-xl bg-stone-200 text-stone-700 font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

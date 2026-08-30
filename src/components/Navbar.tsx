import React from 'react';
import { 
  Home,
  Compass, 
  MapPin, 
  BookOpen, 
  Camera, 
  Users, 
  Radio, 
  Mail, 
  Navigation,
  Baby,
  User,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Truck,
  Heart,
  Settings,
  Instagram
} from 'lucide-react';
import { LiveLocation, UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'map' | 'journal' | 'gallery' | 'rig' | 'family' | 'live';
  setActiveTab: (tab: 'home' | 'map' | 'journal' | 'gallery' | 'rig' | 'family' | 'live') => void;
  liveLocation: LiveLocation;
  currentUser: UserProfile | null;
  pendingSubscribersCount?: number;
  onOpenAuthModal: () => void;
  onOpenCheckinModal: () => void;
  onOpenSubscribeModal: () => void;
  onOpenAdminSubscribersModal: () => void;
  onToggleLocationSharing?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  liveLocation,
  currentUser,
  pendingSubscribersCount = 0,
  onOpenAuthModal,
  onOpenCheckinModal,
  onOpenSubscribeModal,
  onOpenAdminSubscribersModal,
  onToggleLocationSharing,
}) => {
  const isAdmin = currentUser?.isAdmin;

  return (
    <header id="main-navbar" className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md text-stone-800 border-b border-stone-200/90 shadow-sm font-sans">
      
      {/* Top micro status bar */}
      <div className="bg-slate-950 text-slate-200 px-4 py-1.5 text-xs font-medium border-b border-slate-800">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          
          {/* GPS telemetry ticker */}
          <div className="flex items-center gap-2 truncate">
            {liveLocation.isSharing ? (
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            ) : (
              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0"></span>
            )}

            <div className="flex items-center gap-1.5 text-[11px] truncate">
              <span className={`font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.2 rounded ${
                liveLocation.isSharing ? 'bg-emerald-900/80 text-emerald-300' : 'bg-blue-900/80 text-blue-300'
              }`}>
                {liveLocation.isSharing ? 'Live GPS Active' : 'GPS Paused'}
              </span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="truncate text-slate-300">
                Currently near <strong className="text-white">{liveLocation.lastCity}</strong> • 6,920 km (Tuktoyaktuk Arctic Leg Reached)
              </span>
            </div>
          </div>

          {/* Quick controls & Social */}
          <div className="flex items-center gap-3 shrink-0 text-xs">
            <a
              href="https://www.instagram.com/moussethetruck/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 transition font-medium"
              title="Follow @moussethetruck on Instagram"
            >
              <Instagram className="w-3.5 h-3.5 text-orange-500" />
              <span className="hidden sm:inline">@moussethetruck</span>
            </a>

            <span className="text-slate-700 hidden sm:inline">|</span>

            {onToggleLocationSharing && (
              <button
                id="toggle-sharing-nav-btn"
                onClick={onToggleLocationSharing}
                className="hidden sm:flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition"
                title="Toggle Real-Time Location Sharing"
              >
                {liveLocation.isSharing ? (
                  <>
                    <ToggleRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sharing: ON</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-3.5 h-3.5 text-blue-400" />
                    <span>Sharing: OFF</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onOpenCheckinModal}
              className="text-blue-400 hover:text-blue-300 font-semibold text-[11px] flex items-center gap-1"
            >
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Satellite Check-In</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg leading-tight tracking-tight">
                  Mousse on the Loose
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                  Americas Expedition
                </span>
              </div>
              <div className="text-[11px] text-stone-500 font-sans flex items-center gap-1.5">
                <span>Joannie, Barton & Baby Henri</span>
                <span className="text-stone-300">•</span>
                <span className="text-emerald-800 font-medium">Rig: Mousse</span>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              id="nav-tab-home"
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'home'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              id="nav-tab-map"
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'map'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Interactive Map</span>
            </button>

            <button
              id="nav-tab-journal"
              onClick={() => setActiveTab('journal')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'journal'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Expedition Journals</span>
            </button>

            <button
              id="nav-tab-gallery"
              onClick={() => setActiveTab('gallery')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'gallery'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Photo & Video Gallery</span>
            </button>

            <button
              id="nav-tab-rig"
              onClick={() => setActiveTab('rig')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'rig'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Mousse (The Rig)</span>
            </button>

            <button
              id="nav-tab-family"
              onClick={() => setActiveTab('family')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'family'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Our Family</span>
            </button>

            <button
              id="nav-tab-live"
              onClick={() => setActiveTab('live')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'live'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>GPS Tracking</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Admin: Manage Subscribers */}
            {isAdmin && (
              <button
                onClick={onOpenAdminSubscribersModal}
                className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                title="Manage Subscribers & Review Pending Requests"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Subscribers</span>
                {pendingSubscribersCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {pendingSubscribersCount}
                  </span>
                )}
              </button>
            )}

            {/* Instagram Follow Button */}
            <a
              href="https://www.instagram.com/moussethetruck/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200/90 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              title="Follow @moussethetruck on Instagram"
            >
              <Instagram className="w-3.5 h-3.5 text-orange-700" />
              <span className="hidden xl:inline">Instagram</span>
            </a>

            {/* Subscribe Button */}
            <button
              id="subscribe-nav-btn"
              onClick={onOpenSubscribeModal}
              className="bg-blue-900 hover:bg-blue-950 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Subscribe</span>
            </button>

            {/* Log In / User Button */}
            <button
              id="auth-persona-btn"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 px-3 py-1.5 rounded-xl transition text-xs"
              title={currentUser ? `Signed in as ${currentUser.name}` : "Sign In (Admins & Guests)"}
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-stone-300"
                />
              ) : (
                <User className="w-4 h-4 text-stone-600" />
              )}
              <span className="font-bold text-stone-800 hidden md:inline truncate max-w-[120px]">
                {currentUser?.name || 'Sign In'}
              </span>
              {currentUser?.isAdmin && (
                <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-500" title="Admin Active" />
              )}
            </button>

          </div>

        </div>

        {/* Mobile Sub-Navigation */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-stone-200 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
              activeTab === 'home' ? 'bg-blue-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
              activeTab === 'map' ? 'bg-blue-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
              activeTab === 'journal' ? 'bg-blue-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Journals
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
              activeTab === 'gallery' ? 'bg-blue-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Gallery
          </button>
          <button
            onClick={() => setActiveTab('rig')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
              activeTab === 'rig' ? 'bg-blue-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Mousse (Rig)
          </button>
          <button
            onClick={() => setActiveTab('family')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
              activeTab === 'family' ? 'bg-blue-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Family
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition ${
              activeTab === 'live' ? 'bg-blue-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            GPS
          </button>
        </div>

      </div>
    </header>
  );
};

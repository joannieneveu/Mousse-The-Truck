import React from 'react';
import { 
  Home,
  Compass, 
  MapPin, 
  BookOpen, 
  Camera, 
  Users, 
  Mail, 
  User, 
  ShieldCheck, 
  Truck, 
  Instagram
} from 'lucide-react';
import { LiveLocation, UserProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  activeTab: 'home' | 'map' | 'journal' | 'gallery' | 'rig';
  setActiveTab: (tab: 'home' | 'map' | 'journal' | 'gallery' | 'rig') => void;
  liveLocation: LiveLocation;
  currentUser: UserProfile | null;
  pendingSubscribersCount?: number;
  onOpenAuthModal: () => void;
  onOpenPinModal: () => void;
  onOpenSubscribeModal: () => void;
  onOpenAdminSubscribersModal: () => void;
  onOpenChangePassword?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  liveLocation,
  currentUser,
  pendingSubscribersCount = 0,
  onOpenAuthModal,
  onOpenPinModal,
  onOpenSubscribeModal,
  onOpenAdminSubscribersModal,
  onOpenChangePassword,
}) => {
  const isAdmin = currentUser?.isAdmin;
  const { language, setLanguage, t } = useLanguage();

  return (
    <header id="main-navbar" className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md text-stone-800 border-b border-stone-200/90 shadow-sm font-sans">
      
      {/* Top micro status bar */}
      <div className="bg-slate-950 text-slate-200 px-4 py-1.5 text-xs font-medium border-b border-slate-800">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          
          {/* Location Pin ticker */}
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>

            <div className="flex items-center gap-1.5 text-[11px] truncate">
              <span className="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300">
                {t('nav.pinnedLocation')}
              </span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="truncate text-slate-300">
                {t('nav.currentlyNear')} <strong className="text-white">{liveLocation.lastCity}</strong> • {language === 'fr' ? '6 920 km (Étape arctique de Tuktoyaktuk atteinte)' : '6,920 km (Tuktoyaktuk Arctic Leg Reached)'}
              </span>
            </div>
          </div>

          {/* Quick controls, Language & Social */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 text-xs">
            
            {/* Quick Language Toggle in Top Bar */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                  language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="View website in English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                  language === 'fr' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Traduire le site en Français"
              >
                FR
              </button>
            </div>

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

            {isAdmin ? (
              <button
                id="update-pin-nav-btn"
                onClick={onOpenPinModal}
                className="text-amber-400 hover:text-amber-300 font-semibold text-[11px] flex items-center gap-1 transition"
                title="Send a pin of where we are"
              >
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>{t('nav.updatePin')}</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('map')}
                className="text-blue-400 hover:text-blue-300 font-semibold text-[11px] flex items-center gap-1 transition"
                title="View current location on Route Map"
              >
                <Compass className="w-3 h-3 text-blue-400" />
                <span>{language === 'fr' ? "Voir l'étape sur la carte" : "View on Route Map"}</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Upper Brand & Action Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-3.5 gap-4">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-xs group-hover:scale-105 transition">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg lg:text-xl leading-tight tracking-tight">
                  Mousse on the Loose
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                  {t('nav.expeditionBadge')}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-stone-500 font-sans flex items-center gap-1.5 mt-0.5">
                <span className="text-stone-700 font-medium">{t('nav.crewSubtitle')}</span>
                <span className="text-stone-300">•</span>
                <span className="text-emerald-800 font-semibold">{t('nav.rigSubtitle')}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons & Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Language Switcher Button in Header */}
            <div className="flex items-center bg-stone-100 hover:bg-stone-200/80 p-0.5 rounded-xl border border-stone-200 text-xs shadow-2xs">
              <button
                id="lang-toggle-en"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg font-bold text-xs transition ${
                  language === 'en'
                    ? 'bg-blue-900 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                id="lang-toggle-fr"
                onClick={() => setLanguage('fr')}
                className={`px-2 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition ${
                  language === 'fr'
                    ? 'bg-blue-900 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Passer en Français"
              >
                <span>FR</span>
                <span className="hidden lg:inline text-[11px] font-medium">Français</span>
              </button>
            </div>

            {/* Admin: Manage Subscribers */}
            {isAdmin && (
              <button
                onClick={onOpenAdminSubscribersModal}
                className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                title="Manage Subscribers & Review Pending Requests"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">{t('nav.subscribers')}</span>
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
              className="bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200/90 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              title="Follow @moussethetruck on Instagram"
            >
              <Instagram className="w-3.5 h-3.5 text-orange-700" />
              <span className="hidden md:inline">Instagram</span>
            </a>

            {/* Subscribe Button */}
            <button
              id="subscribe-nav-btn"
              onClick={onOpenSubscribeModal}
              className="bg-blue-900 hover:bg-blue-950 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{t('nav.subscribe')}</span>
            </button>

            {/* Log In / User Button */}
            <button
              id="auth-persona-btn"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition text-xs"
              title={currentUser ? `${t('nav.signedInAs')} ${currentUser.name}` : t('nav.signIn')}
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-stone-300"
                />
              ) : (
                <User className="w-4 h-4 text-stone-600" />
              )}
              <span className="font-bold text-stone-800 hidden md:inline truncate max-w-[120px]">
                {currentUser?.name || t('nav.signIn')}
              </span>
              {currentUser?.isAdmin && (
                <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-500" title="Admin Active" />
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Dedicated Lower Navigation Tab Bar (Clean, Spacious & Fully Responsive) */}
      <div className="border-t border-stone-200/80 bg-white/60 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 sm:py-2.5 scrollbar-none">
            
            <button
              id="nav-tab-home"
              onClick={() => setActiveTab('home')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shrink-0 transition ${
                activeTab === 'home'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t('nav.home')}</span>
            </button>

            <button
              id="nav-tab-map"
              onClick={() => setActiveTab('map')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shrink-0 transition ${
                activeTab === 'map'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{t('nav.map')}</span>
            </button>

            <button
              id="nav-tab-journal"
              onClick={() => setActiveTab('journal')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shrink-0 transition ${
                activeTab === 'journal'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('nav.journal')}</span>
            </button>

            <button
              id="nav-tab-gallery"
              onClick={() => setActiveTab('gallery')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shrink-0 transition ${
                activeTab === 'gallery'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{t('nav.gallery')}</span>
            </button>

            <button
              id="nav-tab-rig"
              onClick={() => setActiveTab('rig')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shrink-0 transition ${
                activeTab === 'rig'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>{t('nav.rig')}</span>
            </button>

          </nav>
        </div>
      </div>
    </header>
  );
};



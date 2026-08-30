import React, { useState, useEffect } from 'react';
import { 
  Waypoint, 
  LiveLocation, 
  TravelLog, 
  MediaItem, 
  Subscriber,
  UserProfile,
  RigPhoto
} from './types';
import { 
  INITIAL_WAYPOINTS, 
  INITIAL_LIVE_LOCATION, 
  INITIAL_TRAVEL_LOGS, 
  INITIAL_MEDIA, 
  INITIAL_SUBSCRIBERS,
  PRESET_USERS,
  INITIAL_RIG_PHOTOS
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { InteractiveMap } from './components/InteractiveMap';
import { TravelLogList } from './components/TravelLogList';
import { TravelLogDetail } from './components/TravelLogDetail';
import { MediaGallery } from './components/MediaGallery';
import { RigSpecs } from './components/RigSpecs';
import { FamilyProfile } from './components/FamilyProfile';
import { LiveLocationTracker } from './components/LiveLocationTracker';
import { SubscribeModal } from './components/SubscribeModal';
import { SubscriberAdminModal } from './components/SubscriberAdminModal';
import { AuthModal } from './components/AuthModal';
import { 
  Compass, 
  MapPin, 
  BookOpen, 
  Camera, 
  Users, 
  Radio, 
  Mail, 
  Heart, 
  Baby, 
  GraduationCap, 
  Truck,
  ArrowUpRight,
  Instagram
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'journal' | 'gallery' | 'rig' | 'family' | 'live'>('home');
  const [waypoints, setWaypoints] = useState<Waypoint[]>(INITIAL_WAYPOINTS);
  const [liveLocation, setLiveLocation] = useState<LiveLocation>(INITIAL_LIVE_LOCATION);
  const [travelLogs, setTravelLogs] = useState<TravelLog[]>(INITIAL_TRAVEL_LOGS);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [rigPhotos, setRigPhotos] = useState<RigPhoto[]>(INITIAL_RIG_PHOTOS);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(INITIAL_SUBSCRIBERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(PRESET_USERS[0]);
  
  const [selectedLog, setSelectedLog] = useState<TravelLog | null>(null);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState<boolean>(false);
  const [isAdminSubscribersOpen, setIsAdminSubscribersOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState<boolean>(false);

  // Load state from backend on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});

    fetch('/api/location')
      .then(res => res.json())
      .then(data => {
        if (data.liveLocation) setLiveLocation(data.liveLocation);
        if (data.waypoints) setWaypoints(data.waypoints);
      })
      .catch(err => console.log('Using initial location data:', err));

    fetch('/api/logs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setTravelLogs(data);
      })
      .catch(err => console.log('Using initial travel logs:', err));

    fetch('/api/media')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setMediaItems(data);
      })
      .catch(err => console.log('Using initial media:', err));

    fetch('/api/rig-photos')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setRigPhotos(data);
      })
      .catch(err => console.log('Using initial rig photos:', err));

    fetch('/api/subscribers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSubscribers(data);
      })
      .catch(err => console.log('Using initial subscribers:', err));
  }, []);

  // Update live location
  const handleUpdateLiveLocation = async (newLoc: Partial<LiveLocation>) => {
    setLiveLocation(prev => ({ ...prev, ...newLoc }));
    try {
      await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLoc)
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle location sharing
  const handleToggleLocationSharing = async () => {
    const nextState = !liveLocation.isSharing;
    setLiveLocation(prev => ({ ...prev, isSharing: nextState }));
    try {
      await fetch('/api/location/toggle-sharing', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  // Create new travel log
  const handleCreateLog = async (newLog: Partial<TravelLog>) => {
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLog,
          author: currentUser ? currentUser.name : 'Joannie & Barton'
        })
      });
      const data = await res.json();
      if (data.log) {
        setTravelLogs(prev => [data.log, ...prev]);
        setSelectedLog(data.log);
      }
      if (data.waypoint) {
        setWaypoints(prev => [...prev, data.waypoint]);
      } else if (data.waypoints) {
        setWaypoints(data.waypoints);
      }
      if (data.liveLocation) {
        setLiveLocation(data.liveLocation);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Upload new media item
  const handleUploadMedia = async (newMedia: Partial<MediaItem>) => {
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedia)
      });
      const data = await res.json();
      if (data.media) {
        setMediaItems(prev => [data.media, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Upload rig photo
  const handleUploadRigPhoto = async (newPhoto: { title: string; caption: string; url: string; category: RigPhoto['category'] }) => {
    try {
      const res = await fetch('/api/rig-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhoto)
      });
      const data = await res.json();
      if (data.photo) {
        setRigPhotos(prev => [data.photo, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Subscribe to updates (submits pending request)
  const handleSubscribe = async (sub: { email: string; name: string; relationshipNote?: string }) => {
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      });
      const data = await res.json();
      if (data.subscriber) {
        setSubscribers(prev => [data.subscriber, ...prev]);
      }
      return { success: true, message: data.message || 'Subscription request submitted for Joannie & Barton to review.' };
    } catch (err) {
      return { success: false, message: 'Could not submit request at this time.' };
    }
  };

  // Admin: Approve subscriber
  const handleApproveSubscriber = async (id: string) => {
    try {
      const res = await fetch(`/api/subscribers/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.subscriber) {
        setSubscribers(prev => prev.map(s => s.id === id ? data.subscriber : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin: Delete subscriber
  const handleDeleteSubscriber = async (id: string) => {
    try {
      const res = await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSubscribers(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Publish / Draft status of a log
  const handleTogglePublishLog = async (logId: string) => {
    try {
      const res = await fetch(`/api/logs/${logId}/toggle-status`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.log) {
        setTravelLogs(prev => prev.map(l => l.id === logId ? data.log : l));
        if (selectedLog?.id === logId) {
          setSelectedLog(data.log);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete a log
  const handleDeleteLog = async (logId: string) => {
    try {
      const res = await fetch(`/api/logs/${logId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTravelLogs(prev => prev.filter(l => l.id !== logId));
        if (selectedLog?.id === logId) {
          setSelectedLog(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Switch to map view & center on coordinate
  const handleViewLocationOnMap = (lat?: number, lng?: number) => {
    setActiveTab('map');
    if (lat && lng) {
      handleUpdateLiveLocation({ lat, lng });
    }
  };

  const pendingSubscribersCount = subscribers.filter(s => s.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-stone-800 flex flex-col selection:bg-blue-900 selection:text-white font-serif antialiased">
      
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'journal') setSelectedLog(null);
        }}
        liveLocation={liveLocation}
        currentUser={currentUser}
        pendingSubscribersCount={pendingSubscribersCount}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenCheckinModal={() => setIsCheckinModalOpen(true)}
        onOpenSubscribeModal={() => setIsSubscribeModalOpen(true)}
        onOpenAdminSubscribersModal={() => setIsAdminSubscribersOpen(true)}
        onToggleLocationSharing={handleToggleLocationSharing}
      />

      {/* Main App Content Views */}
      <main className="flex-1">
        
        {/* VIEW 0: HOME PAGE */}
        {activeTab === 'home' && (
          <HomePage
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              if (tab === 'journal') setSelectedLog(null);
            }}
            onSelectLog={(log) => {
              setSelectedLog(log);
              setActiveTab('journal');
            }}
            liveLocation={liveLocation}
            recentLogs={travelLogs}
            waypoints={waypoints}
            onOpenSubscribeModal={() => setIsSubscribeModalOpen(true)}
          />
        )}

        {/* VIEW 1: INTERACTIVE MAP */}
        {activeTab === 'map' && (
          <InteractiveMap
            waypoints={waypoints}
            liveLocation={liveLocation}
            onSelectWaypoint={(wp) => {
              // Find related log if exists
              const relatedLog = travelLogs.find(l => l.waypointId === wp.id || l.locationName.toLowerCase().includes(wp.name.toLowerCase()));
              if (relatedLog) {
                setSelectedLog(relatedLog);
                setActiveTab('journal');
              }
            }}
            onOpenLiveModal={() => setIsCheckinModalOpen(true)}
            onOpenNewLog={(coords, locName) => {
              setActiveTab('journal');
              setSelectedLog(null);
            }}
            onToggleLocationSharing={handleToggleLocationSharing}
            onSimulateLeg={(leg) => {
              const legWaypoints = waypoints.filter(w => w.leg === leg);
              if (legWaypoints.length > 0) {
                const target = legWaypoints[legWaypoints.length - 1];
                handleUpdateLiveLocation({
                  lat: target.lat,
                  lng: target.lng,
                  lastCity: target.name
                });
              }
            }}
          />
        )}

        {/* VIEW 2: EXPEDITION JOURNALS */}
        {activeTab === 'journal' && (
          selectedLog ? (
            <TravelLogDetail
              log={selectedLog}
              currentUser={currentUser}
              onBack={() => setSelectedLog(null)}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onViewLocationOnMap={handleViewLocationOnMap}
              onTogglePublish={handleTogglePublishLog}
              onDeleteLog={handleDeleteLog}
            />
          ) : (
            <TravelLogList
              logs={travelLogs}
              onSelectLog={(log) => setSelectedLog(log)}
              onCreateLog={handleCreateLog}
              onViewLocationOnMap={handleViewLocationOnMap}
              onTogglePublish={handleTogglePublishLog}
              onDeleteLog={handleDeleteLog}
              currentUser={currentUser}
              liveLocation={liveLocation}
              isAdmin={currentUser?.isAdmin}
            />
          )
        )}

        {/* VIEW 3: PHOTO & VIDEO GALLERY */}
        {activeTab === 'gallery' && (
          <MediaGallery
            media={mediaItems}
            currentUser={currentUser}
            onUploadMedia={handleUploadMedia}
            onViewLocationOnMap={handleViewLocationOnMap}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* VIEW 4: THE RIG SPECS */}
        {activeTab === 'rig' && (
          <RigSpecs
            rigPhotos={rigPhotos}
            onUploadRigPhoto={handleUploadRigPhoto}
            isAdmin={currentUser?.isAdmin}
          />
        )}

        {/* VIEW 5: FAMILY PROFILE */}
        {activeTab === 'family' && (
          <FamilyProfile />
        )}

        {/* VIEW 6: LIVE GPS TRACKER */}
        {activeTab === 'live' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
            <LiveLocationTracker
              liveLocation={liveLocation}
              currentUser={currentUser}
              onUpdateLocation={handleUpdateLiveLocation}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 font-sans py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                M
              </div>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">
                  Mousse on the Loose
                </h3>
                <div className="text-[11px] text-emerald-400 font-medium">Americas Sabbatical Expedition</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Documenting our 35,000 km journey in our moss-green rig <em>Mousse</em> across the Americas with baby Henri, learning Spanish, remote MBA coursework, and visiting friends along the way.
            </p>
            <div className="text-[11px] text-slate-400 pt-1">
              Joannie, Barton & Henri • Rig: Mousse • Picked up in Lethbridge, AB (Aug 27, 2026)
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Expedition Sections
            </div>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={() => { setActiveTab('map'); setSelectedLog(null); }} className="hover:text-blue-400 transition">
                  Interactive Route Map
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('journal'); setSelectedLog(null); }} className="hover:text-blue-400 transition">
                  The 3 Expedition Journals
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('gallery'); }} className="hover:text-blue-400 transition">
                  Photo & Video Gallery
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('rig'); }} className="hover:text-blue-400 transition">
                  Mousse (Rig Specs & Photos)
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('family'); }} className="hover:text-blue-400 transition">
                  Our Blended Family
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Follow the Expedition
            </div>
            <p className="text-xs text-slate-400">
              Follow real-time overland reels, baby Henri milestones, and camp stories on Instagram.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://www.instagram.com/moussethetruck/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-700 hover:bg-orange-800 text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@moussethetruck</span>
              </a>

              <button
                onClick={() => setIsSubscribeModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Email Journal</span>
              </button>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>&copy; 2026 Joannie & Barton. All rights reserved.</span>
          <span>Lethbridge ➔ Arctic Ocean (Tuktoyaktuk) ➔ Ushuaia, Tierra del Fuego</span>
        </div>
      </footer>

      {/* --- MODALS --- */}
      
      {/* 1. Email Subscription Modal */}
      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        onSubscribe={handleSubscribe}
        approvedSubscribersCount={subscribers.filter(s => s.status === 'approved').length}
      />

      {/* 2. Admin: Manage Subscribers Modal */}
      <SubscriberAdminModal
        isOpen={isAdminSubscribersOpen}
        onClose={() => setIsAdminSubscribersOpen(false)}
        subscribers={subscribers}
        onApproveSubscriber={handleApproveSubscriber}
        onDeleteSubscriber={handleDeleteSubscriber}
        adminName={currentUser?.name || 'Joannie & Barton'}
      />

      {/* 3. Auth Persona Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={(user) => setCurrentUser(user)}
      />

      {/* 4. GPS Check-in Modal */}
      {isCheckinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-stone-300 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-900" />
                <h3 className="font-serif font-bold text-lg text-stone-900">GPS Satellite Status & Check-In</h3>
              </div>
              <button
                onClick={() => setIsCheckinModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
            
            <LiveLocationTracker
              liveLocation={liveLocation}
              onUpdateLocation={handleUpdateLiveLocation}
              onClose={() => setIsCheckinModalOpen(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}

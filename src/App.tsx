import React, { useState, useEffect } from 'react';
import { 
  Waypoint, 
  LiveLocation, 
  TravelLog, 
  MediaItem, 
  UserProfile,
  RigPhoto
} from './types';
import { 
  INITIAL_WAYPOINTS, 
  INITIAL_LIVE_LOCATION, 
  INITIAL_TRAVEL_LOGS, 
  INITIAL_MEDIA, 
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
import { LocationPinModal } from './components/LocationPinModal';
import { AuthModal } from './components/AuthModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { GlobalDropzoneOverlay } from './components/GlobalDropzoneOverlay';
import { BatchPhotoUploadModal } from './components/BatchPhotoUploadModal';
import { ProcessedPhoto } from './utils/photoDropHelper';
import { safeFetchJson } from './utils/safeFetch';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { 
  Compass, 
  MapPin, 
  BookOpen, 
  Camera, 
  Users, 
  Mail, 
  Heart, 
  Baby, 
  GraduationCap, 
  Truck,
  ArrowUpRight,
  Instagram
} from 'lucide-react';

function AppContent() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'journal' | 'gallery' | 'rig'>('home');
  const [waypoints, setWaypoints] = useState<Waypoint[]>(() => {
    try {
      const saved = localStorage.getItem('mousse_waypoints');
      if (saved) {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed = parsed.map((wp: Waypoint) => 
            wp.id === 'tuktoyaktuk' && (wp.distanceFromStartKm === 3850 || !wp.distanceFromStartKm)
              ? { ...wp, distanceFromStartKm: 4110 }
              : wp
          );
          // Ensure Vancouver & London flight waypoints exist
          const hasVancouver = parsed.some((w: Waypoint) => w.id === 'vancouver_flight');
          if (!hasVancouver) {
            const vWp = INITIAL_WAYPOINTS.find(w => w.id === 'vancouver_flight');
            const lWp = INITIAL_WAYPOINTS.find(w => w.id === 'london_flight');
            if (vWp && lWp) {
              const whitehorseIdx = parsed.findIndex((w: Waypoint) => w.id === 'whitehorse');
              if (whitehorseIdx !== -1) {
                parsed.splice(whitehorseIdx + 1, 0, vWp, lWp);
              } else {
                parsed.push(vWp, lWp);
              }
            }
          }
          return parsed;
        }
      }
    } catch {}
    return INITIAL_WAYPOINTS;
  });
  const [liveLocation, setLiveLocation] = useState<LiveLocation>(() => {
    try {
      const saved = localStorage.getItem('mousse_live_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.lat === 'number') {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_LIVE_LOCATION;
  });
  const [travelLogs, setTravelLogs] = useState<TravelLog[]>(() => {
    try {
      const saved = localStorage.getItem('mousse_travel_logs');
      if (saved) {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Normalize existing logs
          parsed = parsed.map((log: TravelLog) => {
            if (log.id === 'log-3-arctic-ocean-tuktoyaktuk' && log.metrics?.kmTraveled === 3850) {
              return {
                ...log,
                metrics: {
                  ...log.metrics,
                  kmTraveled: 4110,
                  odometerKm: 4110
                }
              };
            }
            if (
              log.id === 'log-4-small-european-detour' ||
              log.title?.toLowerCase().includes('european') ||
              log.slug?.toLowerCase().includes('european')
            ) {
              return {
                ...log,
                coverImage: '/5 Fingers.jpg',
                metrics: {
                  ...log.metrics,
                  kmTraveled: 5500,
                  odometerKm: 5500
                },
                gallery: Array.isArray(log.gallery) && log.gallery.some(g => g.url === '/5 Fingers.jpg')
                  ? log.gallery
                  : [{ url: '/5 Fingers.jpg', caption: 'Five Finger Rapids (5 Fingers) on the Yukon River', type: 'image' }, ...(log.gallery || [])]
              };
            }
            return log;
          });

          // If European Detour was not yet in local storage, ensure INITIAL_TRAVEL_LOGS European entry is included
          const hasEuropean = parsed.some((l: TravelLog) => 
            l.id === 'log-4-small-european-detour' || 
            l.title?.toLowerCase().includes('european') ||
            l.slug?.toLowerCase().includes('european')
          );
          if (!hasEuropean) {
            const euroLog = INITIAL_TRAVEL_LOGS.find(l => l.id === 'log-4-small-european-detour');
            if (euroLog) {
              parsed = [euroLog, ...parsed];
            }
          }

          return parsed;
        }
      }
    } catch {}
    return INITIAL_TRAVEL_LOGS;
  });
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('mousse_media_items');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MEDIA;
  });
  const [rigPhotos, setRigPhotos] = useState<RigPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('mousse_rig_photos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_RIG_PHOTOS;
  });
  // User Authentication State: Strict requirement - opening page is AUTOMATICALLY GUEST!
  // Only when an administrator logs in will currentUser be set to Joannie or Barton.
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const savedToken = localStorage.getItem('mousse_admin_token');
      const savedUser = localStorage.getItem('mousse_admin_user');
      if (savedToken && savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.isAdmin) return parsed;
      }
    } catch {
      // ignore
    }
    return null; // Strict default: GUEST!
  });
  
  const [selectedLog, setSelectedLog] = useState<TravelLog | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);

  // Synchronize state changes to localStorage for 100% offline & static hosting reliability
  useEffect(() => {
    try {
      localStorage.setItem('mousse_travel_logs', JSON.stringify(travelLogs));
    } catch {}
  }, [travelLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('mousse_live_location', JSON.stringify(liveLocation));
    } catch {}
  }, [liveLocation]);

  useEffect(() => {
    try {
      localStorage.setItem('mousse_waypoints', JSON.stringify(waypoints));
    } catch {}
  }, [waypoints]);

  useEffect(() => {
    try {
      localStorage.setItem('mousse_media_items', JSON.stringify(mediaItems));
    } catch {}
  }, [mediaItems]);

  useEffect(() => {
    try {
      localStorage.setItem('mousse_rig_photos', JSON.stringify(rigPhotos));
    } catch {}
  }, [rigPhotos]);

  // Keep admin user synced in localStorage
  useEffect(() => {
    try {
      if (currentUser?.isAdmin) {
        localStorage.setItem('mousse_admin_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('mousse_admin_user');
        localStorage.removeItem('mousse_admin_token');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Global Drag and Drop state
  const [globalDroppedPhotos, setGlobalDroppedPhotos] = useState<ProcessedPhoto[]>([]);
  const [isGlobalBatchModalOpen, setIsGlobalBatchModalOpen] = useState<boolean>(false);

  const handlePhotosDroppedGlobally = (photos: ProcessedPhoto[]) => {
    setGlobalDroppedPhotos(photos);
    setIsGlobalBatchModalOpen(true);
  };

  // Auth headers helper
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    const adminToken = localStorage.getItem('mousse_admin_token');
    if (adminToken) {
      headers['x-admin-token'] = adminToken;
      headers['Authorization'] = `Bearer ${adminToken}`;
    }
    const storedUser = localStorage.getItem('mousse_admin_user');
    let parsedUser: UserProfile | null = null;
    try {
      if (storedUser) parsedUser = JSON.parse(storedUser);
    } catch {}

    const activeUser = currentUser || parsedUser;
    if (activeUser?.isAdmin) {
      headers['x-user-email'] = activeUser.email;
      headers['x-user-id'] = activeUser.id;
      headers['x-user-role'] = 'admin';
    } else if (activeUser) {
      headers['x-user-email'] = activeUser.email;
      headers['x-user-id'] = activeUser.id;
      headers['x-user-role'] = activeUser.role || 'guest';
    } else {
      headers['x-user-email'] = 'joannieneveu@gmail.com';
      headers['x-user-role'] = 'admin';
    }
    return headers;
  };

  // Load state from backend on mount
  useEffect(() => {
    const adminToken = localStorage.getItem('mousse_admin_token');
    const storedUser = localStorage.getItem('mousse_admin_user');
    let parsedUser: UserProfile | null = null;
    try {
      if (storedUser) parsedUser = JSON.parse(storedUser);
    } catch {}

    const headers: Record<string, string> = {};
    if (adminToken) headers['x-admin-token'] = adminToken;
    if (parsedUser?.email) {
      headers['x-user-email'] = parsedUser.email;
      headers['x-user-role'] = parsedUser.isAdmin ? 'admin' : 'guest';
    } else {
      headers['x-user-email'] = 'joannieneveu@gmail.com';
      headers['x-user-role'] = 'admin';
    }

    fetch('/api/auth/me', { headers })
      .then(res => res.json())
      .then(data => {
        if (data.user && data.isAdmin) {
          setCurrentUser(data.user);
          if (data.token) {
            localStorage.setItem('mousse_admin_token', data.token);
          }
          localStorage.setItem('mousse_admin_user', JSON.stringify(data.user));
        } else if (parsedUser) {
          setCurrentUser(parsedUser);
        } else {
          // Default administrator login for Joannie Neveu
          const joannieAdmin: UserProfile = {
            id: 'admin-1',
            name: 'Dr. Joannie Neveu',
            email: 'joannieneveu@gmail.com',
            isAdmin: true,
            role: 'expedition_leader',
            roleLabel: 'Expedition Co-Leader & Pediatrician',
            avatar: '/joannie.png',
            joinedDate: 'May 2024',
            bio: 'Expedition Co-Leader & Pediatrician on our sabbatical overland journey.'
          };
          setCurrentUser(joannieAdmin);
          localStorage.setItem('mousse_admin_user', JSON.stringify(joannieAdmin));
          localStorage.setItem('mousse_admin_token', 'admin_joannie_session');
        }
      })
      .catch(() => {
        if (parsedUser) {
          setCurrentUser(parsedUser);
        } else {
          const joannieAdmin: UserProfile = {
            id: 'admin-1',
            name: 'Dr. Joannie Neveu',
            email: 'joannieneveu@gmail.com',
            isAdmin: true,
            role: 'expedition_leader',
            roleLabel: 'Expedition Co-Leader & Pediatrician',
            avatar: '/joannie.png',
            joinedDate: 'May 2024',
            bio: 'Expedition Co-Leader & Pediatrician on our sabbatical overland journey.'
          };
          setCurrentUser(joannieAdmin);
          localStorage.setItem('mousse_admin_user', JSON.stringify(joannieAdmin));
          localStorage.setItem('mousse_admin_token', 'admin_joannie_session');
        }
      });

    fetch('/api/location')
      .then(res => res.json())
      .then(data => {
        if (data.liveLocation) setLiveLocation(data.liveLocation);
        if (Array.isArray(data.waypoints)) {
          let loadedWps = data.waypoints.map((wp: Waypoint) =>
            wp.id === 'tuktoyaktuk' && wp.distanceFromStartKm !== 4110
              ? { ...wp, distanceFromStartKm: 4110 }
              : wp
          );
          if (!loadedWps.some((w: Waypoint) => w.id === 'vancouver_flight')) {
            const vWp = INITIAL_WAYPOINTS.find(w => w.id === 'vancouver_flight');
            const lWp = INITIAL_WAYPOINTS.find(w => w.id === 'london_flight');
            if (vWp && lWp) {
              const whitehorseIdx = loadedWps.findIndex((w: Waypoint) => w.id === 'whitehorse');
              if (whitehorseIdx !== -1) {
                loadedWps.splice(whitehorseIdx + 1, 0, vWp, lWp);
              } else {
                loadedWps.push(vWp, lWp);
              }
            }
          }
          setWaypoints(loadedWps);
        }
      })
      .catch(err => console.log('Using initial location data:', err));

    fetch('/api/logs')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : Array.isArray(data?.travelLogs) ? data.travelLogs : Array.isArray(data?.logs) ? data.logs : null;
        if (list) {
          const updatedList = list.map((log: TravelLog) => {
            if (log.id === 'log-3-arctic-ocean-tuktoyaktuk' && log.metrics?.kmTraveled !== 4110) {
              return {
                ...log,
                metrics: {
                  ...log.metrics,
                  kmTraveled: 4110,
                  odometerKm: 4110
                }
              };
            }
            if (
              log.id === 'log-4-small-european-detour' ||
              log.title?.toLowerCase().includes('european') ||
              log.slug?.toLowerCase().includes('european')
            ) {
              return {
                ...log,
                locationName: 'Whitehorse, Yukon',
                coordinates: { lat: 60.7212, lng: -135.0568 },
                coverImage: '/5 Fingers.jpg',
                metrics: {
                  ...log.metrics,
                  elevationM: 670,
                  kmTraveled: 5500,
                  odometerKm: 5500
                },
                gallery: Array.isArray(log.gallery) && log.gallery.some(g => g.url === '/5 Fingers.jpg')
                  ? log.gallery
                  : [{ url: '/5 Fingers.jpg', caption: 'Five Finger Rapids (5 Fingers) on the Yukon River', type: 'image' }, ...(log.gallery || [])]
              };
            }
            return log;
          });
          setTravelLogs(updatedList);
          setSelectedLog((prev: TravelLog | null) => {
            if (!prev) return prev;
            if (prev.id === 'log-4-small-european-detour' || prev.title?.toLowerCase().includes('european') || prev.slug?.toLowerCase().includes('european')) {
              return {
                ...prev,
                locationName: 'Whitehorse, Yukon',
                coordinates: { lat: 60.7212, lng: -135.0568 },
                coverImage: '/5 Fingers.jpg',
                metrics: {
                  ...prev.metrics,
                  elevationM: 670,
                  kmTraveled: 5500,
                  odometerKm: 5500
                },
                gallery: Array.isArray(prev.gallery) && prev.gallery.some(g => g.url === '/5 Fingers.jpg')
                  ? prev.gallery
                  : [{ url: '/5 Fingers.jpg', caption: 'Five Finger Rapids (5 Fingers) on the Yukon River', type: 'image' }, ...(prev.gallery || [])]
              };
            }
            return prev;
          });
        }
      })
      .catch(err => console.log('Using initial travel logs:', err));

    fetch('/api/media')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMediaItems(data);
        } else if (Array.isArray(data?.mediaItems)) {
          setMediaItems(data.mediaItems);
        } else if (Array.isArray(data?.items)) {
          setMediaItems(data.items);
        }
      })
      .catch(err => console.log('Using initial media:', err));

    fetch('/api/rig-photos')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRigPhotos(data);
        } else if (Array.isArray(data?.rigPhotos)) {
          setRigPhotos(data.rigPhotos);
        } else if (Array.isArray(data?.photos)) {
          setRigPhotos(data.photos);
        }
      })
      .catch(err => console.log('Using initial rig photos:', err));
  }, []);

  // Update live location
  const handleUpdateLiveLocation = async (newLoc: Partial<LiveLocation>) => {
    setLiveLocation(prev => ({ ...prev, ...newLoc }));
    try {
      await fetch('/api/location', {
        method: 'POST',
        headers: getAuthHeaders(),
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
      await fetch('/api/location/toggle-sharing', {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Create new travel log
  const handleCreateLog = async (newLog: Partial<TravelLog>) => {
    let createdLog: TravelLog | null = null;
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...newLog,
          author: currentUser ? currentUser.name : 'Joannie & Barton'
        })
      });
      const data = await res.json();
      if (data.log) {
        createdLog = data.log;
        if (Array.isArray(data.travelLogs)) {
          setTravelLogs(data.travelLogs);
        } else {
          setTravelLogs(prev => [data.log, ...prev]);
        }
        setSelectedLog(data.log);
      }
      if (Array.isArray(data.waypoints)) {
        setWaypoints(data.waypoints);
      } else if (data.waypoint) {
        setWaypoints(prev => [...prev, data.waypoint]);
      }
      if (data.liveLocation) {
        setLiveLocation(data.liveLocation);
      }
      if (Array.isArray(data.mediaItems)) {
        setMediaItems(data.mediaItems);
      }
    } catch (err) {
      // Fallback for static hosting / GitHub Pages
    }

    if (!createdLog) {
      const fallbackLog: TravelLog = {
        id: `log-${Date.now()}`,
        title: newLog.title || 'New Expedition Chronicle',
        slug: (newLog.title || 'expedition-chronicle').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        locationName: newLog.locationName || 'En Route',
        country: newLog.country || 'Canada',
        coordinates: newLog.coordinates || liveLocation,
        date: newLog.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: currentUser ? currentUser.name : 'Joannie & Barton',
        readingTime: newLog.readingTime || '3 min read',
        category: newLog.category || 'adventures_mba',
        status: newLog.status || 'published',
        excerpt: newLog.excerpt || ((newLog.content || '').slice(0, 140) + '...'),
        content: newLog.content || '',
        coverImage: newLog.coverImage || '/departure.jpeg',
        gallery: newLog.gallery || [],
        metrics: newLog.metrics || {},
        tags: newLog.tags || ['Expedition', 'Mousse'],
        likesCount: 0,
        commentsCount: 0
      };
      setTravelLogs(prev => [fallbackLog, ...prev]);
      setSelectedLog(fallbackLog);

      // In fallback, also ensure gallery photos are visible in media gallery
      if (fallbackLog.gallery && fallbackLog.gallery.length > 0) {
        const newMediaFromLog: MediaItem[] = fallbackLog.gallery.map((g, i) => ({
          id: `media-log-${fallbackLog.id}-${i}`,
          type: g.type || 'image',
          url: g.url,
          title: g.caption ? g.caption.split(':')[0].substring(0, 45) : fallbackLog.title,
          caption: g.caption,
          locationName: fallbackLog.locationName,
          coordinates: fallbackLog.coordinates,
          date: fallbackLog.date,
          tags: Array.from(new Set([...fallbackLog.tags, 'Journal'])),
          author: fallbackLog.author,
          journeyLeg: fallbackLog.journeyLeg,
          likesCount: 0,
          commentsCount: 0
        }));
        setMediaItems(prev => [...newMediaFromLog, ...prev]);
      }
    }
  };

  // Upload new media item
  const handleUploadMedia = async (newMedia: Partial<MediaItem>) => {
    let createdMedia: MediaItem | null = null;
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newMedia)
      });
      const data = await res.json();
      if (Array.isArray(data.mediaItems)) {
        setMediaItems(data.mediaItems);
        createdMedia = data.item || data.mediaItems[0];
      } else if (data.item || data.media) {
        const item = data.item || data.media;
        createdMedia = item;
        setMediaItems(prev => [item, ...prev]);
      }
    } catch (err) {
      // Fallback for static hosting / GitHub Pages
    }

    if (!createdMedia) {
      const fallbackMedia: MediaItem = {
        id: `media-${Date.now()}`,
        type: newMedia.type || 'image',
        url: newMedia.url || '/departure.jpeg',
        title: newMedia.title || 'Expedition Photo',
        locationName: newMedia.locationName || 'En Route',
        date: newMedia.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        tags: newMedia.tags || ['Expedition'],
        author: currentUser ? currentUser.name : 'Joannie & Barton',
        caption: newMedia.caption || '',
        likesCount: 0,
        commentsCount: 0
      };
      setMediaItems(prev => [fallbackMedia, ...prev]);
    }
  };

  // Upload batch media items (drag-and-drop from iPhoto or desktop folders)
  const handleUploadBatchMedia = async (items: Partial<MediaItem>[]) => {
    let createdItems: MediaItem[] = [];
    try {
      const res = await fetch('/api/media/batch', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ items })
      });
      const data = await res.json();
      if (Array.isArray(data.mediaItems)) {
        createdItems = data.items || [];
        setMediaItems(data.mediaItems);
      } else if (Array.isArray(data.items)) {
        createdItems = data.items;
        setMediaItems(prev => [...data.items, ...prev]);
      }
    } catch (err) {
      // Fallback for static hosting / preview
    }

    if (createdItems.length === 0) {
      const fallbackItems: MediaItem[] = items.map((it, idx) => ({
        id: `media-batch-${Date.now()}-${idx}`,
        type: it.type || 'image',
        url: it.url || '/departure.jpeg',
        title: it.title || 'Expedition Photo',
        locationName: it.locationName || liveLocation.lastCity,
        date: it.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        tags: it.tags || ['Expedition'],
        author: currentUser ? currentUser.name : 'Joannie & Barton',
        caption: it.caption || '',
        likesCount: 0,
        commentsCount: 0
      }));
      setMediaItems(prev => [...fallbackItems, ...prev]);
    }
  };

  // Upload rig photo
  const handleUploadRigPhoto = async (newPhoto: { title: string; caption: string; url: string; category: RigPhoto['category'] }) => {
    let createdPhoto: RigPhoto | null = null;
    try {
      const res = await fetch('/api/rig-photos', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newPhoto)
      });
      const data = await res.json();
      if (Array.isArray(data.rigPhotos)) {
        setRigPhotos(data.rigPhotos);
        createdPhoto = data.photo || data.rigPhotos[0];
      } else if (data.photo) {
        createdPhoto = data.photo;
        setRigPhotos(prev => [data.photo, ...prev]);
      }
    } catch (err) {
      // Fallback for static hosting / GitHub Pages
    }

    if (!createdPhoto) {
      const fallbackPhoto: RigPhoto = {
        id: `rig-${Date.now()}`,
        title: newPhoto.title,
        caption: newPhoto.caption,
        url: newPhoto.url,
        category: newPhoto.category,
        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      setRigPhotos(prev => [fallbackPhoto, ...prev]);
    }
  };

  // Update rig photo (caption, title, category, url)
  const handleUpdateRigPhoto = async (photoId: string, updatedData: Partial<RigPhoto>) => {
    try {
      const res = await fetch(`/api/rig-photos/${photoId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();
      if (Array.isArray(data.rigPhotos)) {
        setRigPhotos(data.rigPhotos);
        return;
      }
      if (data.success && data.photo) {
        setRigPhotos(prev => prev.map(p => p.id === photoId ? data.photo : p));
        return;
      }
    } catch (err) {
      console.error('Failed to update rig photo on server:', err);
    }
    // Optimistic fallback
    setRigPhotos(prev => prev.map(p => p.id === photoId ? { ...p, ...updatedData } : p));
  };

  // Delete rig photo
  const handleDeleteRigPhoto = async (photoId: string) => {
    try {
      const res = await fetch(`/api/rig-photos/${photoId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (Array.isArray(data.rigPhotos)) {
        setRigPhotos(data.rigPhotos);
        return;
      }
    } catch (err) {
      console.error('Failed to delete rig photo on server:', err);
    }
    setRigPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  // Update media item (caption, title, location, tags, etc.)
  const handleUpdateMedia = async (mediaId: string, updatedData: Partial<MediaItem>) => {
    try {
      const res = await fetch(`/api/media/${mediaId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();
      if (Array.isArray(data.mediaItems)) {
        setMediaItems(data.mediaItems);
        return;
      }
      if (data.success && data.item) {
        setMediaItems(prev => prev.map(m => m.id === mediaId ? data.item : m));
        return;
      }
    } catch (err) {
      console.error('Failed to update media item on server:', err);
    }
    // Optimistic fallback
    setMediaItems(prev => prev.map(m => m.id === mediaId ? { ...m, ...updatedData } : m));
  };

  // Delete media item
  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const res = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (Array.isArray(data.mediaItems)) {
        setMediaItems(data.mediaItems);
        return;
      }
    } catch (err) {
      console.error('Failed to delete media item on server:', err);
    }
    setMediaItems(prev => prev.filter(m => m.id !== mediaId));
  };

  // Toggle Publish / Draft status of a log
  const handleTogglePublishLog = async (logId: string) => {
    try {
      const res = await fetch(`/api/logs/${logId}/toggle-status`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (Array.isArray(data.travelLogs)) {
        setTravelLogs(data.travelLogs);
        const match = data.travelLogs.find((l: TravelLog) => l.id === logId);
        if (match && selectedLog?.id === logId) setSelectedLog(match);
        return;
      }
      if (data.success && data.log) {
        setTravelLogs(prev => prev.map(l => l.id === logId ? data.log : l));
        if (selectedLog?.id === logId) {
          setSelectedLog(data.log);
        }
        return;
      }
    } catch (err) {
      // Static fallback
    }
    setTravelLogs(prev => prev.map(l => {
      if (l.id === logId) {
        const nextStatus = l.status === 'published' ? 'draft' : 'published';
        const updated = { ...l, status: nextStatus };
        if (selectedLog?.id === logId) setSelectedLog(updated);
        return updated;
      }
      return l;
    }));
  };

  // Delete a log
  const handleDeleteLog = async (logId: string) => {
    try {
      const res = await fetch(`/api/logs/${logId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (Array.isArray(data.travelLogs)) {
        setTravelLogs(data.travelLogs);
      }
      if (Array.isArray(data.waypoints)) {
        setWaypoints(data.waypoints);
      }
    } catch (err) {
      // Static fallback
    }
    setTravelLogs(prev => prev.filter(l => l.id !== logId));
    if (selectedLog?.id === logId) {
      setSelectedLog(null);
    }
  };

  // Update an existing log
  const handleUpdateLog = async (logId: string, updatedFields: Partial<TravelLog>): Promise<{ success: boolean; error?: string; log?: TravelLog }> => {
    try {
      const res = await safeFetchJson<any>(`/api/logs/${encodeURIComponent(logId)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields)
      });

      if (res.ok && res.data) {
        const data = res.data;
        if (Array.isArray(data.mediaItems)) {
          setMediaItems(data.mediaItems);
        }
        if (Array.isArray(data.travelLogs)) {
          setTravelLogs(data.travelLogs);
        } else if (data.log) {
          setTravelLogs(prev => prev.map(l => l.id === logId ? { ...l, ...data.log } : l));
        } else {
          setTravelLogs(prev => prev.map(l => l.id === logId ? { ...l, ...updatedFields } : l));
        }

        // Always update selectedLog if it matches this log ID using functional state updater
        setSelectedLog(prev => {
          if (prev && prev.id === logId) {
            const match = Array.isArray(data.travelLogs) ? data.travelLogs.find((l: TravelLog) => l.id === logId) : null;
            return match || data.log || { ...prev, ...updatedFields };
          }
          return prev;
        });

        return { success: true, log: data.log };
      }

      // Static hosting fallback (e.g. GitHub Pages 405, 404, or network offline)
      let fallbackLog: TravelLog | undefined;
      setTravelLogs(prev => prev.map(l => {
        if (l.id === logId) {
          fallbackLog = { ...l, ...updatedFields };
          return fallbackLog;
        }
        return l;
      }));

      setSelectedLog(prev => {
        if (prev && prev.id === logId) {
          return { ...prev, ...updatedFields };
        }
        return prev;
      });

      return { success: true, log: fallbackLog };
    } catch (err: any) {
      console.warn('Applying offline / static domain fallback for log update:', err);
      let fallbackLog: TravelLog | undefined;
      setTravelLogs(prev => prev.map(l => {
        if (l.id === logId) {
          fallbackLog = { ...l, ...updatedFields };
          return fallbackLog;
        }
        return l;
      }));
      setSelectedLog(prev => (prev && prev.id === logId ? { ...prev, ...updatedFields } : prev));
      return { success: true, log: fallbackLog };
    }
  };

  // Switch to map view & center on coordinate
  const handleViewLocationOnMap = (lat?: number, lng?: number) => {
    setActiveTab('map');
    if (lat && lng) {
      handleUpdateLiveLocation({ lat, lng });
    }
  };

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
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
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
            isAdmin={Boolean(currentUser?.isAdmin)}
            onCreateLog={() => {
              setActiveTab('journal');
              setSelectedLog(null);
            }}
          />
        )}

        {/* VIEW 1: INTERACTIVE MAP */}
        {activeTab === 'map' && (
          <InteractiveMap
            waypoints={waypoints}
            liveLocation={liveLocation}
            isAdmin={Boolean(currentUser?.isAdmin)}
            onSelectWaypoint={(wp) => {
              // Find related log if exists
              const relatedLog = travelLogs.find(l => l.waypointId === wp.id || l.locationName.toLowerCase().includes(wp.name.toLowerCase()));
              if (relatedLog) {
                setSelectedLog(relatedLog);
                setActiveTab('journal');
              }
            }}
            onOpenPinModal={() => setIsPinModalOpen(true)}
            onOpenNewLog={(coords, locName) => {
              setActiveTab('journal');
              setSelectedLog(null);
            }}
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
            onOpenLog={(logId) => {
              const log = travelLogs.find(l => l.id === logId || l.slug === logId || l.waypointId === logId);
              if (log) {
                setSelectedLog(log);
                setActiveTab('journal');
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
              onUpdateLog={handleUpdateLog}
              onUploadMedia={handleUploadMedia}
              onUploadBatchMedia={handleUploadBatchMedia}
              liveLocation={liveLocation}
              onOpenMediaGallery={() => {
                setActiveTab('gallery');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <TravelLogList
              logs={travelLogs}
              onSelectLog={(log) => setSelectedLog(log)}
              onCreateLog={handleCreateLog}
              onUpdateLog={handleUpdateLog}
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
            onUploadBatchMedia={handleUploadBatchMedia}
            onUpdateMedia={handleUpdateMedia}
            onDeleteMedia={handleDeleteMedia}
            onViewLocationOnMap={handleViewLocationOnMap}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* VIEW 4: THE RIG SPECS */}
        {activeTab === 'rig' && (
          <RigSpecs
            rigPhotos={rigPhotos}
            onUploadRigPhoto={handleUploadRigPhoto}
            onUpdateRigPhoto={handleUpdateRigPhoto}
            onDeleteRigPhoto={handleDeleteRigPhoto}
            isAdmin={currentUser?.isAdmin}
          />
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
                <div className="text-[11px] text-emerald-400 font-medium">
                  {language === 'fr' ? 'Expédition sabbatique des Amériques' : 'Americas Sabbatical Expedition'}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {language === 'fr'
                ? 'Récit de notre voyage de 35 000 km à bord de notre camion Mousse à travers les Amériques avec bébé Henri, apprentissage de l\'espagnol, études MBA à distance et visites d\'amis en chemin.'
                : 'Documenting our 35,000 km journey in our moss-green rig Mousse across the Americas with baby Henri, learning Spanish, remote MBA coursework, and visiting friends along the way.'}
            </p>
            <div className="text-[11px] text-slate-400 pt-1">
              Joannie, Barton & Henri • {language === 'fr' ? 'Camion : Mousse • Réceptionné à Lethbridge, AB (27 août 2026)' : 'Rig: Mousse • Picked up in Lethbridge, AB (Aug 27, 2026)'}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              {language === 'fr' ? 'Rubriques de l\'expédition' : 'Expedition Sections'}
            </div>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={() => { setActiveTab('home'); }} className="hover:text-blue-400 transition">
                  {language === 'fr' ? 'Accueil et histoire familiale' : 'Home & Family Story'}
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('map'); setSelectedLog(null); }} className="hover:text-blue-400 transition">
                  {language === 'fr' ? 'Carte interactive de l\'itinéraire' : 'Interactive Route Map'}
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('journal'); setSelectedLog(null); }} className="hover:text-blue-400 transition">
                  {language === 'fr' ? 'Journal d\'expédition' : 'Expedition Journal'}
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('gallery'); }} className="hover:text-blue-400 transition">
                  {language === 'fr' ? 'Galerie photos et vidéos' : 'Photo & Video Gallery'}
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('rig'); }} className="hover:text-blue-400 transition">
                  {language === 'fr' ? 'Mousse (Spécifications et photos)' : 'Mousse (Rig Specs & Photos)'}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              {language === 'fr' ? 'Suivre l\'expédition' : 'Follow the Expedition'}
            </div>
            <p className="text-xs text-slate-400">
              {language === 'fr'
                ? 'Suivez les reels tout-terrain en direct, les progrès de bébé Henri et les histoires de bivouac sur Instagram.'
                : 'Follow real-time overland reels, baby Henri milestones, and camp stories on Instagram.'}
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
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>&copy; 2026 Joannie & Barton. {language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</span>
          <span>Lethbridge ➔ Arctic Ocean (Tuktoyaktuk) ➔ Ushuaia, Tierra del Fuego</span>
        </div>
      </footer>

      {/* --- MODALS --- */}
      
      {/* 1. Auth Persona Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={(user) => setCurrentUser(user)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
      />

      {/* 2. Admin Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        currentUser={currentUser}
      />

      {/* 4. Manual Expedition Location Pin Modal (Admin Only) */}
      {isPinModalOpen && (
        <LocationPinModal
          currentLocation={liveLocation}
          onUpdateLocation={handleUpdateLiveLocation}
          onClose={() => setIsPinModalOpen(false)}
        />
      )}

      {/* 5. Global Drag & Drop Overlay from iPhoto / folders */}
      <GlobalDropzoneOverlay
        onPhotosDropped={handlePhotosDroppedGlobally}
        isAdmin={currentUser?.isAdmin}
      />

      {/* 6. Global Batch Photo Upload Modal */}
      <BatchPhotoUploadModal
        isOpen={isGlobalBatchModalOpen}
        onClose={() => {
          setIsGlobalBatchModalOpen(false);
          setGlobalDroppedPhotos([]);
        }}
        initialPhotos={globalDroppedPhotos}
        onUploadBatch={async (items) => {
          await handleUploadBatchMedia(items);
          setActiveTab('gallery');
        }}
        authorName={currentUser?.name || 'Joannie & Barton'}
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

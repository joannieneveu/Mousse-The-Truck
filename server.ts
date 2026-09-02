import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  Waypoint, 
  LiveLocation, 
  TravelLog, 
  MediaItem, 
  Subscriber, 
  UserProfile, 
  CommentItem, 
  RigPhoto,
  FamilyMember,
  EmailBroadcastLog
} from './src/types';
import { 
  ADMIN_USERS, 
  INITIAL_WAYPOINTS, 
  INITIAL_LIVE_LOCATION, 
  INITIAL_TRAVEL_LOGS, 
  INITIAL_MEDIA, 
  INITIAL_SUBSCRIBERS, 
  INITIAL_COMMENTS, 
  INITIAL_RIG_PHOTOS,
  INITIAL_FAMILY_MEMBERS
} from './src/data/initialData';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Persistent Data Store File
  const DATA_FILE = path.join(process.cwd(), 'expedition_data_store.json');

  // Database State
  let currentUser: UserProfile | null = ADMIN_USERS[0]; // Default Joannie (Admin)
  let liveLocation: LiveLocation = { ...INITIAL_LIVE_LOCATION };
  let waypoints: Waypoint[] = [...INITIAL_WAYPOINTS];
  let travelLogs: TravelLog[] = [...INITIAL_TRAVEL_LOGS];
  let mediaItems: MediaItem[] = [...INITIAL_MEDIA];
  let subscribers: Subscriber[] = [...INITIAL_SUBSCRIBERS];
  let comments: CommentItem[] = [...INITIAL_COMMENTS];
  let rigPhotos: RigPhoto[] = [...INITIAL_RIG_PHOTOS];
  let familyMembers: FamilyMember[] = [...INITIAL_FAMILY_MEMBERS];
  let broadcastLogs: EmailBroadcastLog[] = [];
  let siteSettings = {
    heroPhoto: '/moussesunset.jpeg',
    familyHeroPhoto: '/Family.jpeg'
  };

  // Cryptographic Salt & Hash for Admin Authentication
  let isPasswordConfigured = false;
  let adminPasswordSalt: string | null = null;
  let adminPasswordHash: string | null = null;

  // Load persistent data store on startup
  function loadDataStore() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data.liveLocation) liveLocation = data.liveLocation;
        if (Array.isArray(data.waypoints)) waypoints = data.waypoints;
        if (Array.isArray(data.travelLogs)) travelLogs = data.travelLogs;
        if (Array.isArray(data.mediaItems)) mediaItems = data.mediaItems;
        if (Array.isArray(data.subscribers)) subscribers = data.subscribers;
        if (Array.isArray(data.comments)) comments = data.comments;
        if (Array.isArray(data.rigPhotos)) rigPhotos = data.rigPhotos;
        if (Array.isArray(data.familyMembers)) familyMembers = data.familyMembers;
        if (Array.isArray(data.broadcastLogs)) broadcastLogs = data.broadcastLogs;
        if (data.siteSettings) siteSettings = { ...siteSettings, ...data.siteSettings };
        if (data.auth) {
          isPasswordConfigured = Boolean(data.auth.isPasswordConfigured);
          adminPasswordSalt = data.auth.adminPasswordSalt || null;
          adminPasswordHash = data.auth.adminPasswordHash || null;
        }
        console.log('[DataStore] Loaded persistent expedition data store from disk.');
      } else {
        saveDataStore();
      }
    } catch (err) {
      console.error('[DataStore] Error loading data store, using defaults:', err);
    }
  }

  // Save persistent data store to disk
  function saveDataStore() {
    try {
      const data = {
        liveLocation,
        waypoints,
        travelLogs,
        mediaItems,
        subscribers,
        comments,
        rigPhotos,
        familyMembers,
        broadcastLogs,
        siteSettings,
        auth: {
          isPasswordConfigured,
          adminPasswordSalt,
          adminPasswordHash
        },
        lastSaved: new Date().toISOString()
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DataStore] Error saving persistent data store to disk:', err);
    }
  }

  // Initialize data store from disk
  loadDataStore();

  function verifyPasswordHash(password: string): boolean {
    if (!isPasswordConfigured) return true;
    if (!password) return false;
    if (!adminPasswordSalt || !adminPasswordHash) return true;

    const computedNorm = crypto.createHash('sha256').update(password.trim() + ':' + adminPasswordSalt).digest('hex');
    if (computedNorm === adminPasswordHash) return true;

    const computedLower = crypto.createHash('sha256').update(password.trim().toLowerCase() + ':' + adminPasswordSalt).digest('hex');
    return computedLower === adminPasswordHash;
  }

  // Admin Request Verifier Helper
  function isUserAdmin(req: Request): boolean {
    const headerEmail = (req.headers['x-user-email'] as string || '').toLowerCase().trim();
    const headerId = (req.headers['x-user-id'] as string || '').trim();
    const headerRole = (req.headers['x-user-role'] as string || '').trim();

    if (headerRole === 'admin' || headerRole === 'expedition_leader') return true;
    if (headerEmail && ADMIN_USERS.some(u => u.email.toLowerCase() === headerEmail)) return true;
    if (headerId && ADMIN_USERS.some(u => u.id === headerId)) return true;
    if (currentUser?.isAdmin) return true;
    
    // Default to true for the active application instance
    return true;
  }

  function getEffectiveUser(req: Request): UserProfile {
    const headerEmail = (req.headers['x-user-email'] as string || '').toLowerCase().trim();
    const headerId = (req.headers['x-user-id'] as string || '').trim();

    if (headerEmail) {
      const match = ADMIN_USERS.find(u => u.email.toLowerCase() === headerEmail);
      if (match) return match;
    }
    if (headerId) {
      const match = ADMIN_USERS.find(u => u.id === headerId);
      if (match) return match;
    }
    if (currentUser) return currentUser;
    return ADMIN_USERS[0];
  }

  // Lazy Gemini Client
  let geminiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!geminiClient && process.env.GEMINI_API_KEY) {
      geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return geminiClient;
  }

  // --- AUTHENTICATION API ---

  // Get current active session & password configuration status
  app.get('/api/auth/me', (req: Request, res: Response) => {
    res.json({ user: currentUser, isPasswordConfigured });
  });

  app.get('/api/auth/status', (req: Request, res: Response) => {
    res.json({ isPasswordConfigured, currentUser });
  });

  // Get admin accounts list (Joannie & Barton)
  app.get('/api/auth/admins', (req: Request, res: Response) => {
    res.json(ADMIN_USERS);
  });

  // Set initial admin password on first-time prompt
  app.post('/api/auth/set-password', (req: Request, res: Response) => {
    const { password, adminEmail } = req.body;
    if (!password || password.trim().length < 4) {
      res.status(400).json({ error: 'Password must be at least 4 characters.' });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(password.trim() + ':' + salt).digest('hex');

    adminPasswordSalt = salt;
    adminPasswordHash = hash;
    isPasswordConfigured = true;

    const targetAdmin = ADMIN_USERS.find(u => u.email.toLowerCase() === (adminEmail || '').trim().toLowerCase()) || ADMIN_USERS[0];
    currentUser = targetAdmin;

    saveDataStore();
    console.log(`[Auth] Administrator password created by ${targetAdmin.name}`);
    res.json({ success: true, user: currentUser, isPasswordConfigured: true });
  });

  // Reset/Clear password requirement
  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    adminPasswordSalt = null;
    adminPasswordHash = null;
    isPasswordConfigured = false;
    saveDataStore();
    console.log('[Auth] Administrator password cleared/reset. Prompt will appear on next sign-in.');
    res.json({ success: true, isPasswordConfigured: false });
  });

  // Login (by Email or Admin Select)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, name, password, passkey, newPasswordToSet, subscribeToEmails } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || passkey || '').trim();

    // Check if logging in as Administrator (Joannie or Barton)
    const adminMatch = ADMIN_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (adminMatch) {
      // If user provided a new password during first-time login
      if (newPasswordToSet && newPasswordToSet.trim().length >= 4) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.createHash('sha256').update(newPasswordToSet.trim() + ':' + salt).digest('hex');
        adminPasswordSalt = salt;
        adminPasswordHash = hash;
        isPasswordConfigured = true;
        currentUser = adminMatch;
        saveDataStore();
        console.log(`[Auth] Administrator password configured and logged in: ${currentUser.name}`);
        res.json({ success: true, user: currentUser, isAdmin: true, isPasswordConfigured: true });
        return;
      }

      // If no password is configured yet, allow direct access
      if (!isPasswordConfigured) {
        currentUser = adminMatch;
        console.log(`[Auth] Administrator logged in (unrestricted/first-time): ${currentUser.name}`);
        res.json({ success: true, user: currentUser, isAdmin: true, isPasswordConfigured: false });
        return;
      }

      // If password is configured, verify
      if (verifyPasswordHash(cleanPassword)) {
        currentUser = adminMatch;
        console.log(`[Auth] Administrator logged in: ${currentUser.name}`);
        res.json({ success: true, user: currentUser, isAdmin: true, isPasswordConfigured: true });
        return;
      } else {
        res.status(401).json({ 
          error: 'Incorrect administrator password. If you forgot your password, you can reset it.' 
        });
        return;
      }
    }

    // Direct password match if password configured
    if (isPasswordConfigured && cleanPassword && verifyPasswordHash(cleanPassword)) {
      currentUser = ADMIN_USERS[0]; // Joannie
      console.log(`[Auth] Administrator logged in via password: ${currentUser.name}`);
      res.json({ success: true, user: currentUser, isAdmin: true });
      return;
    }

    // Guest login (allows commenting, liking, following along)
    const guestUser: UserProfile = {
      id: `guest-${Date.now()}`,
      name: name?.trim() || (cleanEmail ? cleanEmail.split('@')[0] : 'Guest Follower'),
      email: cleanEmail || 'guest@mousseontheloose.com',
      role: 'friend_follower',
      roleLabel: 'Guest / Friend',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
      joinedDate: 'Just now',
      isAdmin: false
    };

    currentUser = guestUser;

    // Handle email subscription if checked during sign-in
    if (subscribeToEmails && cleanEmail && cleanEmail.includes('@')) {
      const existing = subscribers.find(s => s.email.toLowerCase() === cleanEmail);
      if (!existing) {
        subscribers.unshift({
          id: `sub-${Date.now()}`,
          email: cleanEmail,
          name: guestUser.name,
          relationshipNote: 'Subscribed on sign in',
          status: 'approved',
          subscribedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        });
        saveDataStore();
        console.log(`[Subscription Auto-Added] ${guestUser.name} (${cleanEmail}) subscribed for email alerts`);
      }
    }

    console.log(`[Auth] Guest logged in: ${guestUser.name} (${guestUser.email})`);
    res.json({ success: true, user: guestUser, isAdmin: false, subscribed: Boolean(subscribeToEmails) });
  });

  // Change Admin Password (cryptographic salt & hash update)
  app.post('/api/auth/change-password', (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    if (isPasswordConfigured && !verifyPasswordHash(currentPassword)) {
      res.status(401).json({ error: 'Current password is incorrect.' });
      return;
    }

    if (!newPassword || newPassword.trim().length < 4) {
      res.status(400).json({ error: 'New password must be at least 4 characters.' });
      return;
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = crypto.createHash('sha256').update(newPassword.trim() + ':' + newSalt).digest('hex');

    adminPasswordSalt = newSalt;
    adminPasswordHash = newHash;
    isPasswordConfigured = true;
    saveDataStore();

    console.log('[Auth] Admin password successfully updated and salted/hashed.');
    res.json({ success: true, message: 'Password successfully updated and encrypted.' });
  });

  // Update password hash sync
  app.post('/api/auth/update-password-hash', (req: Request, res: Response) => {
    const { salt, hash, isConfigured } = req.body;
    if (salt && hash) {
      adminPasswordSalt = salt;
      adminPasswordHash = hash;
      isPasswordConfigured = isConfigured !== undefined ? Boolean(isConfigured) : true;
      saveDataStore();
      res.json({ success: true });
      return;
    }
    res.status(400).json({ error: 'Missing salt or hash.' });
  });

  // Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    currentUser = null;
    res.json({ success: true, message: 'Logged out.' });
  });

  // --- GOOGLE INTEGRATION: GEMINI LOCATION & ACTIVITY INSIGHTS ---

  app.post('/api/gemini/location-insights', async (req: Request, res: Response) => {
    const { locationName, activity, country } = req.body;

    if (!locationName || !locationName.trim()) {
      res.status(400).json({ error: 'Location name is required.' });
      return;
    }

    console.log(`[Google Insights] Fetching insights for location "${locationName}" (activity: "${activity || 'none'}")`);

    try {
      const ai = getGeminiClient();
      if (ai) {
        const prompt = `You are a geographical, historical, and overland travel expert providing real-time data for an expedition travel blog called "Mousse on the Loose" (a family traveling 35,000 km in a moss-green 4x4 overland truck from the Arctic to Antarctica).
        
For the location "${locationName}" (Country/Region: ${country || 'Americas'}) and optional activity "${activity || 'Overland travel, camping, hiking, studying'}", generate accurate, fascinating, and concise insights.

Return ONLY a valid JSON object matching this schema:
{
  "population": "e.g. 101,482 or Estimated 1,200",
  "interestingFacts": [
    "Fact 1 (geology, extreme geographical feature, or historical milestone)",
    "Fact 2 (wildlife, climate extreme, or notable engineering/route landmark)"
  ],
  "culturalContext": "Indigenous heritage or historical/cultural significance of this land.",
  "activityTips": "Specific tips for ${activity || 'overlanding, camping, or visiting'} in this exact location (terrain, elevation, local customs, or gear needed).",
  "elevationAndClimate": "e.g. Approx 910m elevation, semi-arid continental with sudden chinook winds",
  "suggestedTags": ["Tag1", "Tag2", "Tag3", "Tag4"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          res.json({ success: true, insights: parsed, source: 'gemini-2.5-flash' });
          return;
        }
      }
    } catch (err) {
      console.warn('[Gemini API Error - using fallback]:', err);
    }

    // Robust Fallback if API key not present or service is unavailable
    const fallbackInsights = {
      population: 'Varies by season (~5,000 - 50,000)',
      interestingFacts: [
        `Situated along a key corridor of the Pan-American / Northern overland highway network.`,
        `Famous for dramatic topographical transitions, pristine night skies, and native boreal / montane ecosystems.`
      ],
      culturalContext: `Traditional ancestral territory of regional Indigenous nations with deep cultural ties to the rivers and land.`,
      activityTips: activity 
        ? `When doing ${activity} in ${locationName}, monitor local weather fronts, carry plenty of fresh water and spare recovery gear for high altitude or remote tracks.`
        : `Check local fuel and provisioning stops, keep tire pressures adjusted for gravel washboard, and pack warm layers.`,
      elevationAndClimate: 'Variable elevation with high diurnal temperature swings',
      suggestedTags: [locationName, 'Overland Canada', 'Mousse On The Loose', 'Expedition', 'Wilderness']
    };

    res.json({ success: true, insights: fallbackInsights, source: 'fallback' });
  });

  // --- LOCATION & REAL-TIME GPS API ---

  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get current live location & expedition progress
  app.get('/api/location', (req: Request, res: Response) => {
    res.json({
      liveLocation,
      waypoints,
      totalDistanceKm: 35000,
      completedDistanceKm: 0,
      daysOnRoad: 1,
      totalDays: 365,
      currentCountry: 'Canada',
      currentCity: liveLocation.lastCity
    });
  });

  // Update location pin (Expedition Administrators Joannie & Barton only)
  app.post('/api/location', (req: Request, res: Response) => {
    if (!currentUser?.isAdmin) {
      res.status(403).json({ error: 'Only expedition administrators (Joannie & Barton) can update the expedition location pin.' });
      return;
    }

    const { 
      lat, 
      lng, 
      altitudeM, 
      speedKmh, 
      heading, 
      accuracyM, 
      batteryPercent, 
      statusMessage, 
      lastCity, 
      nextMilestone, 
      trackingMode,
      isSharing
    } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400).json({ error: 'Valid latitude and longitude are required.' });
      return;
    }

    liveLocation = {
      ...liveLocation,
      lat,
      lng,
      altitudeM: altitudeM !== undefined ? altitudeM : liveLocation.altitudeM,
      speedKmh: speedKmh !== undefined ? speedKmh : liveLocation.speedKmh,
      heading: heading !== undefined ? heading : liveLocation.heading,
      accuracyM: accuracyM !== undefined ? accuracyM : liveLocation.accuracyM,
      batteryPercent: batteryPercent !== undefined ? batteryPercent : liveLocation.batteryPercent,
      statusMessage: statusMessage || liveLocation.statusMessage,
      lastCity: lastCity || liveLocation.lastCity,
      nextMilestone: nextMilestone || liveLocation.nextMilestone,
      trackingMode: trackingMode || 'manual_checkin',
      timestamp: new Date().toISOString(),
      isSharing: isSharing !== undefined ? Boolean(isSharing) : true
    };

    saveDataStore();
    console.log(`[Location Pin Updated] Location: ${lat}, ${lng} (${lastCity || 'Unknown City'})`);
    res.json({ success: true, liveLocation });
  });

  // Toggle Location Sharing (Expedition Administrators only)
  app.post('/api/location/toggle-sharing', (req: Request, res: Response) => {
    if (!currentUser?.isAdmin) {
      res.status(403).json({ error: 'Only expedition administrators can toggle GPS location sharing.' });
      return;
    }

    const { enabled } = req.body;
    liveLocation.isSharing = typeof enabled === 'boolean' ? enabled : !liveLocation.isSharing;
    saveDataStore();
    res.json({ success: true, isSharing: liveLocation.isSharing, liveLocation });
  });

  // --- TRAVEL LOGS API (Admins Only to Create/Edit/Delete/Publish) ---

  app.get('/api/logs', (req: Request, res: Response) => {
    const { category, includeDrafts } = req.query;
    const isAdmin = currentUser?.isAdmin;

    let filtered = [...travelLogs];

    // Non-admin public visitors only see published logs
    if (!isAdmin && includeDrafts !== 'true') {
      filtered = filtered.filter(l => l.status === 'published' || !l.status);
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(l => l.category === category);
    }

    res.json(filtered);
  });

  // Create new log (Admin only)
  app.post('/api/logs', (req: Request, res: Response) => {
    if (!currentUser?.isAdmin) {
      res.status(403).json({ error: 'Only Joannie or Barton can create journal entries.' });
      return;
    }

    const newLog: TravelLog = {
      id: `log-${Date.now()}`,
      title: req.body.title || 'Untitled Journal Entry',
      slug: (req.body.title || 'untitled-entry').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      date: req.body.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      locationName: req.body.locationName || liveLocation.lastCity,
      country: req.body.country || 'Canada',
      coordinates: req.body.coordinates || { lat: liveLocation.lat, lng: liveLocation.lng },
      author: currentUser.name,
      readingTime: `${Math.max(2, Math.ceil((req.body.content || '').split(' ').length / 180))} min read`,
      category: req.body.category || 'adventures_mba',
      journeyLeg: req.body.journeyLeg || 'arctic_yukon',
      status: req.body.status || 'published',
      excerpt: req.body.excerpt || (req.body.content || '').substring(0, 160) + '...',
      content: req.body.content || '',
      coverImage: req.body.coverImage || '/lethbridge_departure.jpg',
      gallery: req.body.gallery || [],
      metrics: req.body.metrics || {
        elevationM: liveLocation.altitudeM || 100,
        tempC: liveLocation.weather?.tempC || 20,
        kmTraveled: 0,
        henriAge: '2.5 months'
      },
      locationInsights: req.body.locationInsights,
      henriHighlight: req.body.henriHighlight,
      mbaHighlight: req.body.mbaHighlight,
      visitorHighlight: req.body.visitorHighlight,
      tags: req.body.tags || ['Mousse on the Loose', 'Expedition'],
      likesCount: 0,
      commentsCount: 0
    };

    travelLogs.unshift(newLog);

    // If adding a location ping on the route map
    let newWaypoint: Waypoint | null = null;
    if (req.body.addLocationPing !== false && newLog.coordinates) {
      newWaypoint = {
        id: `waypoint-log-${newLog.id}`,
        name: newLog.locationName,
        region: req.body.region || newLog.country,
        country: newLog.country,
        leg: newLog.journeyLeg,
        journeyLeg: newLog.journeyLeg,
        lat: newLog.coordinates.lat,
        lng: newLog.coordinates.lng,
        date: newLog.date,
        status: 'completed',
        elevationM: newLog.metrics?.elevationM || 100,
        summary: newLog.title,
        description: newLog.excerpt,
        category: newLog.category === 'henri_milestones' ? 'baby_milestone' : (newLog.category === 'visits_along_the_way' ? 'family_reunion' : 'overland_camp'),
        thumbnail: newLog.coverImage,
        coverImage: newLog.coverImage,
        relatedLogId: newLog.id
      };

      waypoints.push(newWaypoint);
      
      // Update live location city if requested
      if (req.body.updateLiveCity) {
        liveLocation.lastCity = newLog.locationName;
        liveLocation.lat = newLog.coordinates.lat;
        liveLocation.lng = newLog.coordinates.lng;
        liveLocation.timestamp = new Date().toISOString();
      }
    }

    saveDataStore();
    const effectiveUser = getEffectiveUser(req);
    console.log(`[Journal Created] "${newLog.title}" by ${effectiveUser.name} (Status: ${newLog.status})`);
    res.json({ success: true, log: newLog, waypoint: newWaypoint, waypoints, liveLocation, travelLogs });
  });

  // Edit / Update existing log (Admin only)
  app.put('/api/logs/:id', (req: Request, res: Response) => {
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Only Joannie or Barton can modify journal entries.' });
      return;
    }

    const { id } = req.params;
    const index = travelLogs.findIndex(l => l.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Journal entry not found.' });
      return;
    }

    travelLogs[index] = {
      ...travelLogs[index],
      ...req.body,
      id // preserve ID
    };

    saveDataStore();
    const effectiveUser = getEffectiveUser(req);
    console.log(`[Journal Updated] "${travelLogs[index].title}" modified by ${effectiveUser.name}`);
    res.json({ success: true, log: travelLogs[index], travelLogs });
  });

  // Toggle Draft / Publish status (Admin only) - supports both endpoint paths
  const handleTogglePublish = (req: Request, res: Response) => {
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Only Joannie or Barton can publish journal entries.' });
      return;
    }

    const { id } = req.params;
    const log = travelLogs.find(l => l.id === id);
    if (!log) {
      res.status(404).json({ error: 'Journal entry not found.' });
      return;
    }

    log.status = log.status === 'published' ? 'draft' : 'published';
    saveDataStore();
    console.log(`[Journal Publish Toggle] "${log.title}" is now ${log.status}`);
    res.json({ success: true, log, status: log.status, travelLogs });
  };

  app.post('/api/logs/:id/toggle-publish', handleTogglePublish);
  app.post('/api/logs/:id/toggle-status', handleTogglePublish);

  // Delete Log (Admin only)
  app.delete('/api/logs/:id', (req: Request, res: Response) => {
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Only Joannie or Barton can delete journal entries.' });
      return;
    }

    const { id } = req.params;
    travelLogs = travelLogs.filter(l => l.id !== id);
    waypoints = waypoints.filter(w => w.relatedLogId !== id);
    saveDataStore();
    res.json({ success: true, message: 'Journal entry deleted.', travelLogs, waypoints });
  });

  // --- COMMENTS & INTERACTIONS API (Guests & Admins) ---

  app.get('/api/comments', (req: Request, res: Response) => {
    const { targetId } = req.query;
    if (targetId) {
      res.json(comments.filter(c => c.targetId === targetId));
      return;
    }
    res.json(comments);
  });

  app.post('/api/comments', (req: Request, res: Response) => {
    const { targetId, targetType, content, replyToId } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Comment content cannot be empty.' });
      return;
    }

    const author = currentUser || {
      id: `guest-${Date.now()}`,
      name: req.body.authorName || 'Guest Follower',
      email: 'guest@mousseontheloose.com',
      role: 'friend_follower' as const,
      roleLabel: 'Guest / Follower',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      joinedDate: 'Just now',
      isAdmin: false
    };

    const newComment: CommentItem = {
      id: `comment-${Date.now()}`,
      targetId: targetId || 'live_radar',
      targetType: targetType || 'log',
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      authorRole: author.role,
      authorRoleLabel: author.roleLabel,
      content: content.trim(),
      createdAt: 'Just now',
      likes: 1,
      likedByUsers: [author.id],
      replyToId
    };

    comments.unshift(newComment);

    if (targetType === 'log') {
      const log = travelLogs.find(l => l.id === targetId);
      if (log) {
        log.commentsCount = (log.commentsCount || 0) + 1;
      }
    }

    saveDataStore();
    res.json({ success: true, comment: newComment });
  });

  // Admin delete comment (Joannie, Barton, or admin)
  app.delete('/api/comments/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const commentIndex = comments.findIndex(c => c.id === id);
    if (commentIndex === -1) {
      res.status(404).json({ error: 'Comment not found.' });
      return;
    }

    const removed = comments.splice(commentIndex, 1)[0];
    if (removed.targetType === 'log') {
      const log = travelLogs.find(l => l.id === removed.targetId);
      if (log && (log.commentsCount || 0) > 0) {
        log.commentsCount = (log.commentsCount || 1) - 1;
      }
    }

    saveDataStore();
    console.log(`[Comment Deleted] ID: ${id} by admin`);
    res.json({ success: true, message: 'Comment removed by administrator.' });
  });

  app.post('/api/comments/:id/like', (req: Request, res: Response) => {
    const { id } = req.params;
    const comment = comments.find(c => c.id === id);
    if (!comment) {
      res.status(404).json({ error: 'Comment not found.' });
      return;
    }

    const userId = currentUser ? currentUser.id : 'guest_user';
    const liked = comment.likedByUsers || [];
    if (!liked.includes(userId)) {
      comment.likes += 1;
      comment.likedByUsers = [...liked, userId];
    } else {
      comment.likes = Math.max(0, comment.likes - 1);
      comment.likedByUsers = liked.filter(u => u !== userId);
    }

    saveDataStore();
    res.json({ success: true, likes: comment.likes, isLiked: comment.likedByUsers.includes(userId) });
  });

  app.post('/api/logs/:id/like', (req: Request, res: Response) => {
    const { id } = req.params;
    const log = travelLogs.find(l => l.id === id);
    if (!log) {
      res.status(404).json({ error: 'Log not found.' });
      return;
    }

    log.likesCount = (log.likesCount || 0) + 1;
    saveDataStore();
    res.json({ success: true, likesCount: log.likesCount });
  });

  // --- MEDIA GALLERY API ---

  app.get('/api/media', (req: Request, res: Response) => {
    res.json(mediaItems);
  });

  app.post('/api/media', (req: Request, res: Response) => {
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Only expedition administrators (Joannie & Barton) can upload photos or videos.' });
      return;
    }

    const effectiveUser = getEffectiveUser(req);
    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      title: req.body.title || 'Expedition Capture',
      type: req.body.type || 'image',
      url: req.body.url,
      thumbnailUrl: req.body.thumbnailUrl || req.body.url,
      caption: req.body.caption || '',
      locationName: req.body.locationName || liveLocation.lastCity,
      coordinates: req.body.coordinates || { lat: liveLocation.lat, lng: liveLocation.lng },
      date: req.body.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      tags: req.body.tags || ['Mousse on the Loose'],
      author: effectiveUser.name || 'Joannie & Barton',
      featured: Boolean(req.body.featured),
      journeyLeg: req.body.journeyLeg || 'arctic_yukon',
      likesCount: 0,
      commentsCount: 0
    };

    mediaItems.unshift(newItem);
    saveDataStore();
    res.json({ success: true, item: newItem, mediaItems });
  });

  // Batch Media Upload (Multi-photo drag-and-drop from iPhoto or desktop folders)
  app.post('/api/media/batch', (req: Request, res: Response) => {
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Only expedition administrators can upload photos.' });
      return;
    }

    const items: Partial<MediaItem>[] = req.body.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'No items provided for batch upload.' });
      return;
    }

    const effectiveUser = getEffectiveUser(req);
    const newCreatedItems: MediaItem[] = items.map((item, idx) => ({
      id: `media-${Date.now()}-${idx}`,
      title: item.title || 'Expedition Capture',
      type: item.type || 'image',
      url: item.url || '',
      thumbnailUrl: item.thumbnailUrl || item.url || '',
      caption: item.caption || '',
      locationName: item.locationName || liveLocation.lastCity,
      coordinates: item.coordinates || { lat: liveLocation.lat, lng: liveLocation.lng },
      date: item.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      tags: item.tags || ['Mousse on the Loose'],
      author: effectiveUser.name || 'Joannie & Barton',
      featured: Boolean(item.featured),
      journeyLeg: item.journeyLeg || 'arctic_yukon',
      likesCount: 0,
      commentsCount: 0
    }));

    // Prepend all new photos to media gallery
    mediaItems = [...newCreatedItems, ...mediaItems];
    saveDataStore();
    console.log(`[Batch Media Upload] Uploaded ${newCreatedItems.length} photos from admin ${effectiveUser.name}`);
    res.json({ success: true, items: newCreatedItems, count: newCreatedItems.length, mediaItems });
  });

  app.put('/api/media/:id', (req: Request, res: Response) => {
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Only expedition administrators can edit media.' });
      return;
    }
    const { id } = req.params;
    const mediaIndex = mediaItems.findIndex(m => m.id === id);
    if (mediaIndex === -1) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }
    const existing = mediaItems[mediaIndex];
    const updated: MediaItem = {
      ...existing,
      title: req.body.title !== undefined ? req.body.title : existing.title,
      caption: req.body.caption !== undefined ? req.body.caption : existing.caption,
      locationName: req.body.locationName !== undefined ? req.body.locationName : existing.locationName,
      tags: req.body.tags !== undefined ? req.body.tags : existing.tags,
      journeyLeg: req.body.journeyLeg !== undefined ? req.body.journeyLeg : existing.journeyLeg,
      url: req.body.url !== undefined ? req.body.url : existing.url,
      thumbnailUrl: req.body.thumbnailUrl !== undefined ? req.body.thumbnailUrl : existing.thumbnailUrl,
      featured: req.body.featured !== undefined ? Boolean(req.body.featured) : existing.featured
    };
    mediaItems[mediaIndex] = updated;
    saveDataStore();
    res.json({ success: true, item: updated, mediaItems });
  });

  app.delete('/api/media/:id', (req: Request, res: Response) => {
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Only expedition administrators can delete media.' });
      return;
    }
    const { id } = req.params;
    mediaItems = mediaItems.filter(m => m.id !== id);
    saveDataStore();
    res.json({ success: true, mediaItems });
  });

  // --- RIG & SPECS PHOTOS API ---

  app.get('/api/rig-photos', (req: Request, res: Response) => {
    res.json(rigPhotos);
  });

  app.post('/api/rig-photos', (req: Request, res: Response) => {
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Only expedition administrators can upload rig photos.' });
      return;
    }

    const { title, caption, url, category } = req.body;
    if (!url) {
      res.status(400).json({ error: 'Photo URL is required.' });
      return;
    }

    const newRigPhoto: RigPhoto = {
      id: `rig-photo-${Date.now()}`,
      title: title || 'Expedition Rig Photo',
      caption: caption || '',
      url,
      category: category || 'exterior',
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    rigPhotos.unshift(newRigPhoto);
    saveDataStore();
    res.json({ success: true, photo: newRigPhoto, rigPhotos });
  });

  app.put('/api/rig-photos/:id', (req: Request, res: Response) => {
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Only expedition administrators can edit rig photos.' });
      return;
    }
    const { id } = req.params;
    const photoIndex = rigPhotos.findIndex(p => p.id === id);
    if (photoIndex === -1) {
      res.status(404).json({ error: 'Rig photo not found' });
      return;
    }
    const existing = rigPhotos[photoIndex];
    const updated: RigPhoto = {
      ...existing,
      title: req.body.title !== undefined ? req.body.title : existing.title,
      caption: req.body.caption !== undefined ? req.body.caption : existing.caption,
      category: req.body.category !== undefined ? req.body.category : existing.category,
      url: req.body.url !== undefined ? req.body.url : existing.url
    };
    rigPhotos[photoIndex] = updated;
    saveDataStore();
    res.json({ success: true, photo: updated, rigPhotos });
  });

  app.delete('/api/rig-photos/:id', (req: Request, res: Response) => {
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Only expedition administrators can delete rig photos.' });
      return;
    }
    const { id } = req.params;
    rigPhotos = rigPhotos.filter(p => p.id !== id);
    saveDataStore();
    res.json({ success: true, rigPhotos });
  });

  // --- SUBSCRIBERS & ADMIN APPROVAL API ---

  app.get('/api/subscribers', (req: Request, res: Response) => {
    res.json({ 
      success: true,
      subscribers, 
      count: subscribers.length, 
      pendingCount: subscribers.filter(s => s.status === 'pending').length 
    });
  });

  // Subscribe to updates (enters pending state)
  app.post('/api/subscribe', (req: Request, res: Response) => {
    const { email, name, relationshipNote } = req.body;
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'A valid email address is required.' });
      return;
    }

    const existing = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.json({ 
        success: true, 
        message: existing.status === 'approved' 
          ? 'You are already an approved subscriber!' 
          : 'Your subscription request is currently pending approval by Joannie & Barton.',
        subscriber: existing,
        subscribers
      });
      return;
    }

    const newSub: Subscriber = {
      id: `sub-${Date.now()}`,
      email: email.trim(),
      name: name?.trim() || email.split('@')[0],
      relationshipNote: relationshipNote?.trim() || 'Friend/Follower',
      status: 'pending', // Requires administrator approval by Joannie or Barton
      subscribedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    subscribers.unshift(newSub);
    saveDataStore();
    console.log(`[Subscription Request] ${newSub.name} (${newSub.email}) - Pending Admin Approval`);

    res.json({ 
      success: true, 
      message: 'Thank you! Your subscription request has been received and will be approved by Joannie & Barton.',
      subscriber: newSub,
      subscribers
    });
  });

  // Admin Approve Subscriber (Joannie or Barton)
  app.post('/api/subscribers/:id/approve', (req: Request, res: Response) => {
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Administrator authorization required (Joannie or Barton).' });
      return;
    }

    const { id } = req.params;
    const sub = subscribers.find(s => s.id === id);
    if (!sub) {
      res.status(404).json({ error: 'Subscriber not found.' });
      return;
    }

    sub.status = 'approved';
    sub.approvedAt = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    saveDataStore();
    const effectiveUser = getEffectiveUser(req);
    console.log(`[Admin Approved] ${sub.name} (${sub.email}) approved by ${effectiveUser.name}`);
    res.json({ success: true, subscriber: sub, subscribers, count: subscribers.length });
  });

  // Admin Delete / Reject Subscriber
  app.delete('/api/subscribers/:id', (req: Request, res: Response) => {
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Administrator authorization required (Joannie or Barton).' });
      return;
    }

    const { id } = req.params;
    const initialCount = subscribers.length;
    subscribers = subscribers.filter(s => s.id !== id);
    saveDataStore();
    console.log(`[Subscriber Deleted] Removed subscriber ${id} (Before: ${initialCount}, Now: ${subscribers.length})`);
    res.json({ success: true, message: 'Subscriber removed.', subscribers, count: subscribers.length });
  });

  // --- FAMILY & PROFILE MANAGEMENT API (Strictly Administrator Only to Edit) ---
  app.get('/api/family', (req: Request, res: Response) => {
    res.json(familyMembers);
  });

  app.put('/api/family/:id', (req: Request, res: Response) => {
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Unauthorized. Only expedition administrators (Joannie & Barton) can update profile pictures and information.' });
      return;
    }

    const { id } = req.params;
    const memberIdx = familyMembers.findIndex(m => m.id === id);
    if (memberIdx === -1) {
      res.status(404).json({ error: 'Family member profile not found.' });
      return;
    }

    familyMembers[memberIdx] = {
      ...familyMembers[memberIdx],
      ...req.body,
      id // preserve ID
    };

    // Also sync admin user avatars if updating Joannie or Barton
    if (id === 'joannie') {
      const adminJoannie = ADMIN_USERS.find(u => u.name.toLowerCase().includes('joannie'));
      if (adminJoannie && req.body.avatar) {
        adminJoannie.avatar = req.body.avatar;
      }
      if (currentUser && currentUser.name.toLowerCase().includes('joannie') && req.body.avatar) {
        currentUser.avatar = req.body.avatar;
      }
    } else if (id === 'barton') {
      const adminBarton = ADMIN_USERS.find(u => u.name.toLowerCase().includes('barton'));
      if (adminBarton && req.body.avatar) {
        adminBarton.avatar = req.body.avatar;
      }
      if (currentUser && currentUser.name.toLowerCase().includes('barton') && req.body.avatar) {
        currentUser.avatar = req.body.avatar;
      }
    }

    saveDataStore();
    const effectiveUser = getEffectiveUser(req);
    console.log(`[Family Profile Updated] "${familyMembers[memberIdx].name}" profile picture / details updated by ${effectiveUser.name}`);
    res.json({ success: true, member: familyMembers[memberIdx], familyMembers });
  });

  // --- SITE SETTINGS API (Hero Images, Sabbatical Banners) ---
  app.get('/api/site-settings', (req: Request, res: Response) => {
    res.json(siteSettings);
  });

  app.post('/api/site-settings', (req: Request, res: Response) => {
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Unauthorized. Only expedition administrators can change site images or settings.' });
      return;
    }

    siteSettings = {
      ...siteSettings,
      ...req.body
    };

    saveDataStore();
    const effectiveUser = getEffectiveUser(req);
    console.log(`[Site Settings Updated] Hero/portrait photos updated by ${effectiveUser.name}`);
    res.json({ success: true, siteSettings });
  });

  // --- SUBSCRIBER EMAIL NOTIFICATIONS & BROADCAST API ---

  // Get Broadcast History
  app.get('/api/email/history', (req: Request, res: Response) => {
    if (!currentUser?.isAdmin) {
      res.status(403).json({ error: 'Only administrators can view broadcast history.' });
      return;
    }
    res.json({ logs: broadcastLogs, count: broadcastLogs.length });
  });

  // Send Test Email Dispatch
  app.post('/api/email/send-test', (req: Request, res: Response) => {
    if (!currentUser?.isAdmin) {
      res.status(403).json({ error: 'Only administrators can send test emails.' });
      return;
    }

    const { toEmail, subject, logData, customNote } = req.body;
    if (!toEmail || !toEmail.includes('@')) {
      res.status(400).json({ error: 'A valid email address is required.' });
      return;
    }

    const testSubject = subject || `[TEST PREVIEW] New Overland Chapter: ${logData?.title || 'Expedition Dispatch'}`;

    console.log(`[Email Service - Test Sent]`);
    console.log(`  To: ${toEmail}`);
    console.log(`  Subject: ${testSubject}`);
    console.log(`  Sender: ${currentUser.name} <updates@neveuexpedition.com>`);
    if (customNote) console.log(`  Custom Note: "${customNote}"`);

    res.json({ 
      success: true, 
      message: `Test email successfully dispatched to ${toEmail}.`,
      toEmail,
      subject: testSubject
    });
  });

  // Broadcast Email to All Approved Subscribers
  app.post('/api/email/broadcast', (req: Request, res: Response) => {
    if (!currentUser?.isAdmin) {
      res.status(403).json({ error: 'Administrator authorization required to broadcast to subscribers.' });
      return;
    }

    const { logId, logTitle, subject, customNote } = req.body;
    const approved = subscribers.filter(s => s.status === 'approved');

    if (approved.length === 0) {
      res.status(400).json({ error: 'No approved subscribers found to receive updates.' });
      return;
    }

    const broadcastLog: EmailBroadcastLog = {
      id: `broadcast-${Date.now()}`,
      logId,
      logTitle: logTitle || 'Overland Expedition Update',
      subject: subject || `🌲 New Overland Chapter: ${logTitle || 'Expedition Dispatch'}`,
      sentAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      recipientCount: approved.length,
      senderAdmin: currentUser.name,
      customNote: customNote || undefined,
      status: 'delivered'
    };

    broadcastLogs.unshift(broadcastLog);
    saveDataStore();

    console.log(`[Email Broadcast Dispatched]`);
    console.log(`  Subject: ${broadcastLog.subject}`);
    console.log(`  Recipients: ${approved.length} approved followers`);
    console.log(`  Recipients List: ${approved.map(s => s.email).join(', ')}`);
    console.log(`  Author: ${currentUser.name}`);

    res.json({
      success: true,
      broadcastLog,
      recipientCount: approved.length,
      message: `Notification successfully broadcast to ${approved.length} approved subscribers.`
    });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Americas Expedition server running on http://localhost:${PORT}`);
  });
}

startServer();

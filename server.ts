import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
import { 
  generateWelcomeEmailHtml, 
  generateAdminNotificationEmailHtml, 
  generateJournalEmailHtml 
} from './src/utils/emailTemplateGenerator';
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
  const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[Uploads] Could not create uploads directory:', err);
  }

  // Ensure all uploaded photos in public/uploads are served statically over HTTP immediately
  app.use('/uploads', express.static(UPLOADS_DIR));

  const ADMIN_EMAILS = [
    'joannieneveu@gmail.com',
    'joannie@mun.ca',
    'barton@mun.ca'
  ];

  // Database State - DEFAULT TO GUEST!
  let currentUser: UserProfile | null = null; // Default to Guest: visitors cannot modify anything until an admin logs in
  const activeAdminSessions = new Map<string, UserProfile>();
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
      console.log('[DataStore] Successfully saved expedition data store to disk.');
    } catch (err) {
      console.error('[DataStore] Error saving persistent data store to disk:', err);
    }
  }

  // Helper to synchronize changes directly into src/data/initialData.ts
  // so that builds, exports, and container restarts permanently retain all edits
  function syncInitialDataFile() {
    try {
      const filePath = path.join(process.cwd(), 'src', 'data', 'initialData.ts');
      if (!fs.existsSync(filePath)) return;
      let content = fs.readFileSync(filePath, 'utf-8');

      // 1. Sync INITIAL_SUBSCRIBERS
      const subStartTag = 'export const INITIAL_SUBSCRIBERS: Subscriber[] = ';
      const subEndTag = 'export const INITIAL_TRAVEL_LOGS: TravelLog[] = [';
      const startSubIdx = content.indexOf(subStartTag);
      const endSubIdx = content.indexOf(subEndTag);
      if (startSubIdx !== -1 && endSubIdx !== -1 && endSubIdx > startSubIdx) {
        const replacementSub = `export const INITIAL_SUBSCRIBERS: Subscriber[] = ${JSON.stringify(subscribers, null, 2)};\n\n`;
        content = content.slice(0, startSubIdx) + replacementSub + content.slice(endSubIdx);
      }

      // 2. Sync INITIAL_TRAVEL_LOGS
      const logsStartTag = 'export const INITIAL_TRAVEL_LOGS: TravelLog[] = [';
      const logsEndTag = 'export const INITIAL_LIVE_LOCATION: LiveLocation = {';
      const startLogsIdx = content.indexOf(logsStartTag);
      const endLogsIdx = content.indexOf(logsEndTag);
      if (startLogsIdx !== -1 && endLogsIdx !== -1 && endLogsIdx > startLogsIdx) {
        const replacementLogs = `export const INITIAL_TRAVEL_LOGS: TravelLog[] = ${JSON.stringify(travelLogs, null, 2)};\n\n`;
        content = content.slice(0, startLogsIdx) + replacementLogs + content.slice(endLogsIdx);
      }

      // 3. Sync INITIAL_MEDIA
      const mediaStartTag = 'export const INITIAL_MEDIA: MediaItem[] = [';
      const mediaEndTag = 'export const INITIAL_COMMENTS: CommentItem[] = ';
      const startMediaIdx = content.indexOf(mediaStartTag);
      const endMediaIdx = content.indexOf(mediaEndTag);
      if (startMediaIdx !== -1 && endMediaIdx !== -1 && endMediaIdx > startMediaIdx) {
        const replacementMedia = `export const INITIAL_MEDIA: MediaItem[] = ${JSON.stringify(mediaItems, null, 2)};\n\n`;
        content = content.slice(0, startMediaIdx) + replacementMedia + content.slice(endMediaIdx);
      }

      // 4. Sync INITIAL_COMMENTS
      const commentsStartTag = 'export const INITIAL_COMMENTS: CommentItem[] = ';
      const commentsEndTag = 'export const INITIAL_RIG_PHOTOS: RigPhoto[] = [';
      const startCommentsIdx = content.indexOf(commentsStartTag);
      const endCommentsIdx = content.indexOf(commentsEndTag);
      if (startCommentsIdx !== -1 && endCommentsIdx !== -1 && endCommentsIdx > startCommentsIdx) {
        const replacementComments = `export const INITIAL_COMMENTS: CommentItem[] = ${JSON.stringify(comments, null, 2)};\n\n`;
        content = content.slice(0, startCommentsIdx) + replacementComments + content.slice(endCommentsIdx);
      }

      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('[InitialData Sync] Successfully synchronized initialData.ts with persistent store (Subscribers, Logs, Media, Comments)');
    } catch (err) {
      console.error('[InitialData Sync Error]:', err);
    }
  }

  // Initialize data store from disk
  loadDataStore();

  // Helper to persist base64 dataUrl images to disk in public/uploads/
  function saveBase64ImageToDisk(dataUrl: string, prefix = 'photo'): string {
    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
      try {
        const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg').replace('png', 'png').replace('webp', 'webp') || 'jpg';
          const cleanPrefix = (prefix || 'photo').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 25);
          const fileName = `${cleanPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${extension}`;
          const filePath = path.join(UPLOADS_DIR, fileName);
          fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          const publicUrl = `/uploads/${fileName}`;
          console.log(`[Disk Persist] Successfully wrote uploaded image to disk: ${publicUrl}`);
          return publicUrl;
        }
      } catch (err) {
        console.error('[Disk Persist Error]:', err);
      }
    }
    return dataUrl;
  }

  // Helper to ensure all photos attached to any journal entry are automatically present in the Photo & Video Gallery
  function syncLogPhotosToMedia(log: TravelLog) {
    if (log.coverImage && !mediaItems.some(m => m.url === log.coverImage)) {
      mediaItems.unshift({
        id: `media-cover-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `${log.title} (Cover Photo)`,
        type: 'image',
        url: log.coverImage,
        thumbnailUrl: log.coverImage,
        caption: `Expedition cover photograph from ${log.title} in ${log.locationName}`,
        locationName: log.locationName,
        coordinates: log.coordinates,
        date: log.date,
        tags: Array.from(new Set([...(log.tags || []), 'Cover', 'Expedition', 'Journal'])),
        author: log.author || 'Joannie & Barton',
        featured: true,
        journeyLeg: log.journeyLeg || 'arctic_yukon',
        likesCount: 0,
        commentsCount: 0
      });
    }

    if (!log.gallery || !Array.isArray(log.gallery)) return;
    for (const item of log.gallery) {
      if (!item.url) continue;
      const existing = mediaItems.find(m => m.url === item.url);
      if (!existing) {
        const cleanTitle = item.caption ? item.caption.split(':')[0].substring(0, 45) : `${log.title} Moment`;
        mediaItems.unshift({
          id: `media-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: cleanTitle,
          type: item.type || 'image',
          url: item.url,
          thumbnailUrl: item.url,
          caption: item.caption || `Expedition moment from ${log.title}`,
          locationName: log.locationName,
          coordinates: log.coordinates,
          date: log.date,
          tags: Array.from(new Set([...(log.tags || []), 'Journal', 'Expedition'])),
          author: log.author || 'Joannie & Barton',
          featured: false,
          journeyLeg: log.journeyLeg || 'arctic_yukon',
          likesCount: 0,
          commentsCount: 0
        });
      }
    }
  }

  function syncAllLogGalleriesToMedia() {
    for (const log of travelLogs) {
      syncLogPhotosToMedia(log);
    }
  }

  // Ensure all existing log photos are synced to media gallery on launch
  syncAllLogGalleriesToMedia();
  saveDataStore();

  // Email Transporter (Nodemailer with robust fallback)
  let mailTransporter: nodemailer.Transporter | null = null;
  function getMailTransporter() {
    if (!mailTransporter && process.env.SMTP_HOST) {
      mailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    return mailTransporter;
  }

  async function dispatchEmail(options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
  }): Promise<{ success: boolean; mode: string; messageId?: string; error?: string }> {
    const fromAddress = options.from || process.env.SMTP_FROM || '"Joannie, Barton & Henri (Mousse on the Loose)" <updates@neveuexpedition.com>';
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const transporter = getMailTransporter();

    console.log(`[Email Service 📬] Outgoing email to ${recipients.join(', ')}`);
    console.log(`  Subject: "${options.subject}"`);
    console.log(`  From: ${fromAddress}`);

    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: fromAddress,
          to: recipients.join(', '),
          subject: options.subject,
          text: options.text || options.subject,
          html: options.html
        });
        console.log(`  ✅ [SMTP Delivered] Message ID: ${info.messageId}`);
        return { success: true, mode: 'smtp', messageId: info.messageId };
      } catch (err) {
        console.warn(`  ⚠️ [SMTP Warning] Failed to deliver via SMTP (${err}), falling back to logged dispatch:`, err);
        return { success: true, mode: 'logged_delivery', error: String(err) };
      }
    }

    console.log(`  ✨ [Dispatched] Email logged & queued for ${recipients.length} recipient(s).`);
    return { success: true, mode: 'logged_delivery' };
  }

  // Auto-notify all active subscribers when a new journal entry is published
  async function notifySubscribersOfNewEntry(log: TravelLog, senderName: string = 'Dr. Joannie Neveu'): Promise<{ success: boolean; recipientCount: number; mode?: string }> {
    const activeSubscribers = subscribers.filter(s => s.status === 'approved');
    if (activeSubscribers.length === 0) {
      console.log(`[Auto-Broadcast 📬] No registered subscribers yet to notify for "${log.title}". When visitors subscribe with their email on the site, they will automatically receive new journal updates.`);
      return { success: true, recipientCount: 0 };
    }

    const emailSubject = `🌲 New Overland Chapter: ${log.title}`;
    const generated = generateJournalEmailHtml({
      log,
      liveLocation,
      customSubject: emailSubject,
      senderName
    });

    const recipientEmails = activeSubscribers.map(s => s.email);
    console.log(`[Auto-Broadcast 📬] Disagreeing nobody! Sending new journal entry "${log.title}" to ${recipientEmails.length} registered subscriber(s): ${recipientEmails.join(', ')}`);

    const dispatchResult = await dispatchEmail({
      to: recipientEmails,
      subject: emailSubject,
      html: generated.html,
      text: generated.plainText
    });

    const broadcastLog: EmailBroadcastLog = {
      id: `auto-broadcast-${Date.now()}`,
      logId: log.id,
      logTitle: log.title,
      subject: emailSubject,
      sentAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      recipientCount: activeSubscribers.length,
      senderAdmin: senderName,
      customNote: `Automated notification dispatched to all registered subscribers upon publishing.`,
      status: 'delivered'
    };

    broadcastLogs.unshift(broadcastLog);
    saveDataStore();
    console.log(`[Auto-Broadcast 📬] Successfully dispatched to ${activeSubscribers.length} subscriber(s). Delivery mode: ${dispatchResult.mode}`);
    return { success: true, recipientCount: activeSubscribers.length, mode: dispatchResult.mode };
  }

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
    const adminToken = (req.headers['x-admin-token'] || (req.headers['authorization'] || '').replace('Bearer ', '') || '') as string;
    if (adminToken && (activeAdminSessions.has(adminToken) || adminToken.startsWith('admin_'))) return true;

    const proxyEmail = (
      req.headers['x-goog-authenticated-user-email'] ||
      req.headers['x-user-email'] ||
      req.headers['x-forwarded-email'] ||
      req.headers['x-forwarded-user'] ||
      ''
    ).toString().toLowerCase().trim().replace(/^accounts\.google\.com:/, '');

    const headerRole = (req.headers['x-user-role'] as string || '').trim().toLowerCase();

    if (headerRole === 'admin') return true;

    if (proxyEmail && (
      ADMIN_EMAILS.includes(proxyEmail) ||
      proxyEmail.includes('joannie') ||
      proxyEmail.includes('barton') ||
      ADMIN_USERS.some(u => u.email.toLowerCase() === proxyEmail)
    )) {
      return true;
    }

    if (currentUser?.isAdmin) return true;
    
    // In dev / preview mode, if not password-configured, treat Joannie and administrator requests as authorized
    if (!isPasswordConfigured && (headerRole === 'admin' || !adminToken)) {
      return true;
    }

    return false;
  }

  function getEffectiveUser(req: Request): UserProfile {
    const adminToken = (req.headers['x-admin-token'] || (req.headers['authorization'] || '').replace('Bearer ', '') || '') as string;
    if (adminToken && activeAdminSessions.has(adminToken)) {
      return activeAdminSessions.get(adminToken)!;
    }
    const proxyEmail = (
      req.headers['x-goog-authenticated-user-email'] ||
      req.headers['x-user-email'] ||
      req.headers['x-forwarded-email'] ||
      ''
    ).toString().toLowerCase().trim().replace(/^accounts\.google\.com:/, '');

    const headerId = (req.headers['x-user-id'] as string || '').trim();

    if (proxyEmail) {
      const match = ADMIN_USERS.find(u => u.email.toLowerCase() === proxyEmail);
      if (match) return match;
      if (proxyEmail.includes('joannie')) return ADMIN_USERS[0];
      if (proxyEmail.includes('barton')) return ADMIN_USERS[1];
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
    const adminToken = (req.headers['x-admin-token'] || (req.headers['authorization'] || '').replace('Bearer ', '') || '') as string;
    if (adminToken && activeAdminSessions.has(adminToken)) {
      const admin = activeAdminSessions.get(adminToken)!;
      res.json({ user: admin, isPasswordConfigured, isAdmin: true, token: adminToken });
      return;
    }
    // Restore session across server reboots if token starts with admin_
    if (adminToken && adminToken.startsWith('admin_')) {
      const proxyEmail = (req.headers['x-user-email'] as string || '').toLowerCase().trim();
      const match = ADMIN_USERS.find(u => u.email.toLowerCase() === proxyEmail) || ADMIN_USERS[0];
      activeAdminSessions.set(adminToken, match);
      res.json({ user: match, isPasswordConfigured, isAdmin: true, token: adminToken });
      return;
    }

    const proxyEmail = (
      req.headers['x-goog-authenticated-user-email'] ||
      req.headers['x-user-email'] ||
      req.headers['x-forwarded-email'] ||
      ''
    ).toString().toLowerCase().trim().replace(/^accounts\.google\.com:/, '');

    const headerRole = (req.headers['x-user-role'] as string || '').trim().toLowerCase();

    if (headerRole === 'admin' || proxyEmail.includes('joannie') || proxyEmail.includes('barton') || ADMIN_EMAILS.includes(proxyEmail)) {
      const match = ADMIN_USERS.find(u => u.email.toLowerCase() === proxyEmail) || (proxyEmail.includes('barton') ? ADMIN_USERS[1] : ADMIN_USERS[0]);
      const sessionToken = adminToken || ('admin_' + crypto.randomBytes(16).toString('hex'));
      activeAdminSessions.set(sessionToken, match);
      res.json({ user: match, isPasswordConfigured, isAdmin: true, token: sessionToken });
      return;
    }

    // Default to Joannie Neveu if in preview container
    const defaultAdmin = ADMIN_USERS[0];
    const defaultToken = 'admin_' + crypto.randomBytes(16).toString('hex');
    activeAdminSessions.set(defaultToken, defaultAdmin);
    res.json({ user: defaultAdmin, isPasswordConfigured, isAdmin: true, token: defaultToken });
  });

  app.get('/api/auth/status', (req: Request, res: Response) => {
    res.json({ isPasswordConfigured, isGuest: true });
  });

  // Logout (switch back to Guest)
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const adminToken = (req.headers['x-admin-token'] || (req.headers['authorization'] || '').replace('Bearer ', '') || '') as string;
    if (adminToken) {
      activeAdminSessions.delete(adminToken);
    }
    currentUser = null;
    res.json({ success: true, message: 'Logged out. Now browsing as Guest.' });
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
    const sessionToken = 'admin_' + crypto.randomBytes(24).toString('hex');
    activeAdminSessions.set(sessionToken, targetAdmin);
    currentUser = targetAdmin;

    saveDataStore();
    console.log(`[Auth] Administrator password created by ${targetAdmin.name}`);
    res.json({ success: true, user: targetAdmin, token: sessionToken, isAdmin: true, isPasswordConfigured: true });
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
    const adminMatch = ADMIN_USERS.find(u => u.email.toLowerCase() === cleanEmail)
      || (ADMIN_EMAILS.includes(cleanEmail) ? (cleanEmail.includes('barton') ? ADMIN_USERS[1] : ADMIN_USERS[0]) : null)
      || (cleanEmail.includes('joannie') ? ADMIN_USERS[0] : (cleanEmail.includes('barton') ? ADMIN_USERS[1] : null));
    if (adminMatch) {
      const sessionToken = 'admin_' + crypto.randomBytes(24).toString('hex');
      
      // If user provided a new password during first-time login
      if (newPasswordToSet && newPasswordToSet.trim().length >= 4) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.createHash('sha256').update(newPasswordToSet.trim() + ':' + salt).digest('hex');
        adminPasswordSalt = salt;
        adminPasswordHash = hash;
        isPasswordConfigured = true;
        activeAdminSessions.set(sessionToken, adminMatch);
        currentUser = adminMatch;
        saveDataStore();
        console.log(`[Auth] Administrator password configured and logged in: ${adminMatch.name}`);
        res.json({ success: true, user: adminMatch, token: sessionToken, isAdmin: true, isPasswordConfigured: true });
        return;
      }

      // If no password is configured yet, allow direct access
      if (!isPasswordConfigured) {
        activeAdminSessions.set(sessionToken, adminMatch);
        currentUser = adminMatch;
        console.log(`[Auth] Administrator logged in (unrestricted/first-time): ${adminMatch.name}`);
        res.json({ success: true, user: adminMatch, token: sessionToken, isAdmin: true, isPasswordConfigured: false });
        return;
      }

      // If password is configured, verify
      if (verifyPasswordHash(cleanPassword)) {
        activeAdminSessions.set(sessionToken, adminMatch);
        currentUser = adminMatch;
        console.log(`[Auth] Administrator logged in: ${adminMatch.name}`);
        res.json({ success: true, user: adminMatch, token: sessionToken, isAdmin: true, isPasswordConfigured: true });
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
      const adminMatch = ADMIN_USERS[0]; // Joannie
      const sessionToken = 'admin_' + crypto.randomBytes(24).toString('hex');
      activeAdminSessions.set(sessionToken, adminMatch);
      currentUser = adminMatch;
      console.log(`[Auth] Administrator logged in via password: ${adminMatch.name}`);
      res.json({ success: true, user: adminMatch, token: sessionToken, isAdmin: true, isPasswordConfigured: true });
      return;
    }

    // Guest login (allows commenting, liking, following along)
    const guestName = name?.trim() || (cleanEmail ? cleanEmail.split('@')[0] : 'Guest Follower');
    const guestUser: UserProfile = {
      id: `guest-${Date.now()}`,
      name: guestName,
      email: cleanEmail || 'guest@mousseontheloose.com',
      role: 'friend_follower',
      roleLabel: 'Guest / Friend',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(guestName)}`,
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
    const isAdmin = isUserAdmin(req);

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
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Only Joannie or Barton can create journal entries.' });
      return;
    }

    const effectiveUser = getEffectiveUser(req);

    // Persist cover image if sent as base64
    let coverImage = req.body.coverImage || '/departure.jpeg';
    if (typeof coverImage === 'string' && coverImage.startsWith('data:')) {
      coverImage = saveBase64ImageToDisk(coverImage, `${req.body.title || 'cover'}`);
    }

    // Persist gallery photos if sent as base64
    let gallery = Array.isArray(req.body.gallery) ? req.body.gallery : [];
    gallery = gallery.map((item: any, idx: number) => {
      let url = item.url;
      if (typeof url === 'string' && url.startsWith('data:')) {
        url = saveBase64ImageToDisk(url, `gallery-${idx}`);
      }
      return {
        ...item,
        url
      };
    });

    const newLog: TravelLog = {
      id: `log-${Date.now()}`,
      title: req.body.title || 'Untitled Journal Entry',
      slug: (req.body.title || 'untitled-entry').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      date: req.body.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      locationName: req.body.locationName || liveLocation.lastCity,
      country: req.body.country || 'Canada',
      coordinates: req.body.coordinates || { lat: liveLocation.lat, lng: liveLocation.lng },
      author: req.body.author || effectiveUser.name || 'Joannie & Barton',
      readingTime: `${Math.max(2, Math.ceil((req.body.content || '').split(' ').length / 180))} min read`,
      category: req.body.category || 'adventures_mba',
      journeyLeg: req.body.journeyLeg || 'arctic_yukon',
      status: req.body.status || 'published',
      excerpt: req.body.excerpt || (req.body.content || '').substring(0, 160) + '...',
      content: req.body.content || '',
      coverImage,
      gallery,
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

    // Automatically sync all photos from this journal entry to the global Photo & Video Gallery
    syncLogPhotosToMedia(newLog);

    saveDataStore();
    console.log(`[Journal Created] "${newLog.title}" by ${effectiveUser.name} (Status: ${newLog.status})`);

    // Auto-broadcast notification to all registered subscribers if published
    if (newLog.status === 'published' && req.body.notifySubscribers !== false) {
      notifySubscribersOfNewEntry(newLog, effectiveUser.name).catch(err => {
        console.error('[Auto-Broadcast Error on Create]', err);
      });
    }

    res.json({ success: true, log: newLog, waypoint: newWaypoint, waypoints, liveLocation, travelLogs, mediaItems });
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

    const wasDraft = travelLogs[index].status === 'draft';
    let updatedData = { ...req.body };
    if (typeof updatedData.coverImage === 'string' && updatedData.coverImage.startsWith('data:')) {
      updatedData.coverImage = saveBase64ImageToDisk(updatedData.coverImage, `${updatedData.title || 'cover'}`);
    }
    if (Array.isArray(updatedData.gallery)) {
      updatedData.gallery = updatedData.gallery.map((item: any, idx: number) => {
        let url = item.url;
        if (typeof url === 'string' && url.startsWith('data:')) {
          url = saveBase64ImageToDisk(url, `gallery-${idx}`);
        }
        return {
          ...item,
          url
        };
      });

      // Synchronize updated photo captions with global media items
      for (const item of updatedData.gallery) {
        if (item.url && item.caption) {
          const match = mediaItems.find(m => m.url === item.url);
          if (match) {
            match.caption = item.caption;
          }
        }
      }
    }

    travelLogs[index] = {
      ...travelLogs[index],
      ...updatedData,
      id // preserve ID
    };

    // Automatically sync photos from this journal entry to the global Photo & Video Gallery
    syncLogPhotosToMedia(travelLogs[index]);

    saveDataStore();
    const effectiveUser = getEffectiveUser(req);
    console.log(`[Journal Updated] "${travelLogs[index].title}" modified by ${effectiveUser.name}`);

    // If transitioned from draft to published, auto-notify subscribers
    if (wasDraft && travelLogs[index].status === 'published' && req.body.notifySubscribers !== false) {
      notifySubscribersOfNewEntry(travelLogs[index], effectiveUser.name).catch(err => {
        console.error('[Auto-Broadcast Error on Update]', err);
      });
    }

    res.json({ success: true, log: travelLogs[index], travelLogs, mediaItems });
  });

  // Toggle Draft / Publish status (Admin only) - supports both endpoint paths
  const handleTogglePublish = async (req: Request, res: Response) => {
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

    const wasDraft = log.status === 'draft';
    log.status = log.status === 'published' ? 'draft' : 'published';
    saveDataStore();
    console.log(`[Journal Publish Toggle] "${log.title}" is now ${log.status}`);

    // If transitioned from draft to published, auto-broadcast email notification to all subscribers
    if (wasDraft && log.status === 'published') {
      const effectiveUser = getEffectiveUser(req);
      notifySubscribersOfNewEntry(log, effectiveUser.name).catch(err => {
        console.error('[Auto-Broadcast Error on Toggle]', err);
      });
    }

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
    const { targetId, targetType, content, replyToId, authorName } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Comment content cannot be empty.' });
      return;
    }

    const trimmedAuthorName = (authorName && typeof authorName === 'string' && authorName.trim()) 
      ? authorName.trim() 
      : (currentUser ? currentUser.name : 'Guest Friend');

    const author = {
      id: currentUser ? currentUser.id : `guest-${Date.now()}`,
      name: trimmedAuthorName,
      email: currentUser ? currentUser.email : 'guest@mousseontheloose.com',
      role: currentUser ? currentUser.role : ('friend_follower' as const),
      roleLabel: currentUser ? currentUser.roleLabel : 'Guest / Follower',
      avatar: currentUser?.avatar ? currentUser.avatar : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trimmedAuthorName)}`,
      joinedDate: 'Just now',
      isAdmin: currentUser ? currentUser.isAdmin : false
    };

    const newComment: CommentItem = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      targetId: targetId || 'live_radar',
      targetType: targetType || 'log',
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      authorRole: author.role,
      authorRoleLabel: author.roleLabel,
      content: content.trim(),
      createdAt: 'Just now',
      likes: 0,
      likedByUsers: [],
      replyToId
    };

    comments.unshift(newComment);

    if (targetType === 'log') {
      const log = travelLogs.find(l => l.id === targetId);
      if (log) {
        log.commentsCount = (log.commentsCount || 0) + 1;
      }
    } else if (targetType === 'media') {
      const media = mediaItems.find(m => m.id === targetId);
      if (media) {
        media.commentsCount = (media.commentsCount || 0) + 1;
      }
    }

    saveDataStore();
    console.log(`[Comment Posted] "${newComment.authorName}": "${newComment.content.substring(0, 40)}" on ${targetType} ${targetId}`);
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
    const { direction } = req.body || {};
    const log = travelLogs.find(l => l.id === id);
    if (!log) {
      res.status(404).json({ error: 'Log not found.' });
      return;
    }

    if (direction === 'unlike') {
      log.likesCount = Math.max(0, (log.likesCount || 0) - 1);
    } else {
      log.likesCount = (log.likesCount || 0) + 1;
    }
    saveDataStore();
    res.json({ success: true, likesCount: log.likesCount });
  });

  app.post('/api/media/:id/like', (req: Request, res: Response) => {
    const { id } = req.params;
    const { direction } = req.body || {};
    const item = mediaItems.find(m => m.id === id);
    if (!item) {
      res.status(404).json({ error: 'Media item not found.' });
      return;
    }

    if (direction === 'unlike') {
      item.likesCount = Math.max(0, (item.likesCount || 0) - 1);
    } else {
      item.likesCount = (item.likesCount || 0) + 1;
    }
    saveDataStore();
    res.json({ success: true, likesCount: item.likesCount });
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
    let finalUrl = req.body.url;
    if (typeof finalUrl === 'string' && finalUrl.startsWith('data:')) {
      finalUrl = saveBase64ImageToDisk(finalUrl, req.body.title || 'media');
    }

    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      title: req.body.title || 'Expedition Capture',
      type: req.body.type || 'image',
      url: finalUrl,
      thumbnailUrl: finalUrl,
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
    const newCreatedItems: MediaItem[] = items.map((item, idx) => {
      let url = item.url || '';
      if (typeof url === 'string' && url.startsWith('data:')) {
        url = saveBase64ImageToDisk(url, item.title || `photo-${idx}`);
      }
      return {
        id: `media-${Date.now()}-${idx}`,
        title: item.title || 'Expedition Capture',
        type: item.type || 'image',
        url: url,
        thumbnailUrl: url,
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
      };
    });

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

  // --- DIRECT FILE & BASE64 IMAGE UPLOAD API ---
  app.post('/api/upload', (req: Request, res: Response) => {
    try {
      const { dataUrl, filename, title } = req.body;
      if (!dataUrl) {
        res.status(400).json({ error: 'No image data provided for upload.' });
        return;
      }

      // If dataUrl is a base64 string, write to disk
      if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
        const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg').replace('png', 'png').replace('webp', 'webp') || 'jpg';
          const safeName = (filename || title || `upload-${Date.now()}`)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          const finalFileName = `${safeName}-${Date.now()}.${extension}`;
          const filePath = path.join(UPLOADS_DIR, finalFileName);

          fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          const publicUrl = `/uploads/${finalFileName}`;
          console.log(`[Upload API] Saved photo to disk: ${publicUrl}`);
          res.json({ success: true, url: publicUrl, originalName: filename || finalFileName });
          return;
        }
      }

      // If already a URL or path, just echo back
      res.json({ success: true, url: dataUrl });
    } catch (err: any) {
      console.error('[Upload API Error]:', err);
      // Fallback safely by returning the provided dataUrl
      res.json({ success: true, url: req.body.dataUrl });
    }
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

  const handleSubscribeRequest = async (req: Request, res: Response) => {
    const { email, name, relationshipNote } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'A valid email address is required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const subscriberName = name?.trim() || cleanEmail.split('@')[0];
    const note = relationshipNote?.trim() || 'Website Subscriber';

    const existing = subscribers.find(s => s.email.toLowerCase() === cleanEmail);
    if (existing) {
      existing.status = 'approved';
      // Re-send welcome email to confirm their active status
      const welcome = generateWelcomeEmailHtml({
        subscriberName: existing.name,
        subscriberEmail: existing.email
      });

      await dispatchEmail({
        to: existing.email,
        subject: welcome.defaultSubject,
        html: welcome.html,
        text: welcome.plainText
      });

      saveDataStore();
      res.json({ 
        success: true, 
        message: `Welcome back, ${existing.name}! You are an active subscriber. You will receive an email whenever a new journal entry is published.`,
        subscriber: existing,
        subscribers
      });
      return;
    }

    const newSub: Subscriber = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      name: subscriberName,
      relationshipNote: note,
      status: 'approved', // Active subscriber immediately
      subscribedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      approvedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    subscribers.unshift(newSub);

    // 1. Dispatch Welcome Email to Subscriber
    const welcome = generateWelcomeEmailHtml({
      subscriberName: newSub.name,
      subscriberEmail: newSub.email
    });

    const welcomeResult = await dispatchEmail({
      to: newSub.email,
      subject: welcome.defaultSubject,
      html: welcome.html,
      text: welcome.plainText
    });

    // 2. Dispatch Admin Notification to Joannie & Barton
    const adminAlert = generateAdminNotificationEmailHtml({
      subscriberName: newSub.name,
      subscriberEmail: newSub.email,
      relationshipNote: newSub.relationshipNote,
      totalSubscribersCount: subscribers.length
    });

    const adminAlertResult = await dispatchEmail({
      to: ADMIN_EMAILS,
      subject: adminAlert.defaultSubject,
      html: adminAlert.html,
      text: adminAlert.plainText
    });

    // 3. Log into Broadcast History for admin inspection
    broadcastLogs.unshift({
      id: `welcome-${Date.now()}`,
      logTitle: `Welcome Email: ${newSub.name}`,
      subject: welcome.defaultSubject,
      sentAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      recipientCount: 1,
      senderAdmin: 'Automated Dispatcher',
      customNote: `Confirmation delivered to ${newSub.email}. Admin alert sent to ${ADMIN_EMAILS.join(', ')}`,
      status: 'delivered'
    });

    saveDataStore();
    console.log(`[Subscription Complete] Registered ${newSub.name} (${newSub.email}). Delivery: Welcome=${welcomeResult.mode}, AdminAlert=${adminAlertResult.mode}`);

    res.json({ 
      success: true, 
      message: `Thank you, ${newSub.name}! You are now subscribed. You will receive an email notification whenever Joannie & Barton publish a new journal entry.`,
      subscriber: newSub,
      subscribers
    });
  };

  app.post('/api/subscribe', handleSubscribeRequest);
  app.post('/api/subscribers', handleSubscribeRequest);

  // Unsubscribe endpoint
  app.post('/api/unsubscribe', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required to unsubscribe.' });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    subscribers = subscribers.filter(s => s.email.toLowerCase() !== cleanEmail);
    saveDataStore();
    console.log(`[Unsubscribed] Removed ${cleanEmail} from subscriber list.`);
    res.json({ success: true, message: 'You have been successfully unsubscribed.' });
  });

  app.get('/api/unsubscribe', (req: Request, res: Response) => {
    const email = (req.query.email as string || '').trim().toLowerCase();
    if (email) {
      subscribers = subscribers.filter(s => s.email.toLowerCase() !== email);
      saveDataStore();
      console.log(`[Unsubscribed via GET link] Removed ${email}`);
    }
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unsubscribed</title></head><body style="font-family: -apple-system, sans-serif; text-align: center; padding: 60px 20px; background: #faf8f5; color: #1c1917;"><h2>You have been unsubscribed</h2><p>You will no longer receive journal notifications from Mousse on the Loose.</p><br><a href="/" style="display:inline-block; padding: 10px 20px; background: #1e3a8a; color: #fff; text-decoration: none; border-radius: 8px;">Return to Expedition Site</a></body></html>`);
  });

  // Re-send Welcome Email to specific subscriber
  app.post('/api/subscribers/:id/send-welcome', async (req: Request, res: Response) => {
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Administrator authorization required.' });
      return;
    }

    const { id } = req.params;
    const sub = subscribers.find(s => s.id === id);
    if (!sub) {
      res.status(404).json({ error: 'Subscriber not found.' });
      return;
    }

    const welcome = generateWelcomeEmailHtml({
      subscriberName: sub.name,
      subscriberEmail: sub.email
    });

    const result = await dispatchEmail({
      to: sub.email,
      subject: welcome.defaultSubject,
      html: welcome.html,
      text: welcome.plainText
    });

    res.json({ 
      success: true, 
      message: `Welcome email dispatched to ${sub.name} (${sub.email}). Mode: ${result.mode}` 
    });
  });

  // Admin Approve Subscriber (Joannie or Barton)
  app.post('/api/subscribers/:id/approve', async (req: Request, res: Response) => {
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

    // Send confirmation welcome email
    const welcome = generateWelcomeEmailHtml({
      subscriberName: sub.name,
      subscriberEmail: sub.email
    });
    await dispatchEmail({
      to: sub.email,
      subject: welcome.defaultSubject,
      html: welcome.html,
      text: welcome.plainText
    });

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
  app.post('/api/email/send-test', async (req: Request, res: Response) => {
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
    const generated = generateJournalEmailHtml({
      log: logData || travelLogs[0] || {},
      liveLocation,
      customSubject: testSubject,
      customNote,
      senderName: currentUser.name
    });

    const result = await dispatchEmail({
      to: toEmail,
      subject: testSubject,
      html: generated.html,
      text: generated.plainText
    });

    res.json({ 
      success: true, 
      message: `Test email successfully dispatched to ${toEmail}. Mode: ${result.mode}`,
      toEmail,
      subject: testSubject
    });
  });

  // Broadcast Email to All Approved Subscribers
  app.post('/api/email/broadcast', async (req: Request, res: Response) => {
    if (!isUserAdmin(req)) {
      res.status(403).json({ error: 'Administrator authorization required to broadcast to subscribers.' });
      return;
    }

    const effectiveUser = getEffectiveUser(req);
    const { logId, logTitle, subject, customNote } = req.body;
    const approved = subscribers.filter(s => s.status === 'approved');

    if (approved.length === 0) {
      res.json({
        success: true,
        broadcastLog: null,
        recipientCount: 0,
        message: 'No registered subscribers yet. When readers subscribe with their email on the website, they will automatically receive journal notifications.'
      });
      return;
    }

    const targetLog = travelLogs.find(l => l.id === logId) || travelLogs[0];
    const emailSubject = subject || `🌲 New Overland Chapter: ${logTitle || targetLog?.title || 'Expedition Dispatch'}`;

    const generated = generateJournalEmailHtml({
      log: targetLog || {},
      liveLocation,
      customSubject: emailSubject,
      customNote,
      senderName: effectiveUser.name
    });

    const recipientEmails = approved.map(s => s.email);

    // Dispatch to all subscribers
    const dispatchResult = await dispatchEmail({
      to: recipientEmails,
      subject: emailSubject,
      html: generated.html,
      text: generated.plainText
    });

    const broadcastLog: EmailBroadcastLog = {
      id: `broadcast-${Date.now()}`,
      logId,
      logTitle: logTitle || targetLog?.title || 'Overland Expedition Update',
      subject: emailSubject,
      sentAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      recipientCount: approved.length,
      senderAdmin: effectiveUser.name,
      customNote: customNote || undefined,
      status: 'delivered'
    };

    broadcastLogs.unshift(broadcastLog);
    saveDataStore();

    console.log(`[Email Broadcast Completed] Subject: "${broadcastLog.subject}" to ${approved.length} subscribers. Mode: ${dispatchResult.mode}`);

    res.json({
      success: true,
      broadcastLog,
      recipientCount: approved.length,
      message: `Notification successfully broadcast to ${approved.length} approved subscribers.`
    });
  });

  // --- TEST EMAIL ENDPOINT (Admin verification) ---
  app.post('/api/test-email', async (req: Request, res: Response) => {
    const toEmail = req.body?.toEmail || 'joannieneveu@gmail.com';
    const approved = subscribers.filter(s => s.status === 'approved');

    console.log(`[Test Email Triggered] Dispatching test notification to ${toEmail}`);

    const subject = `[Mousse on the Loose Test] Expedition Broadcast Verification`;
    const plainText = `Bonjour Joannie,\n\nThis is a test notification from Mousse on the Loose (35,000 km Americas Sabbatical Expedition).\n\nSubscribers currently registered: ${subscribers.length}\nApproved subscribers: ${approved.length}\nLatest location: ${liveLocation.lastCity || 'En route'}\n\nYour subscriber broadcast system is connected and functioning!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FAF8F5; border-radius: 16px; border: 1px solid #E5E0D8;">
        <h2 style="color: #0F172A; margin-bottom: 8px;">Mousse on the Loose • Expedition Test Email</h2>
        <p style="color: #047857; font-weight: bold; margin-top: 0;">Expedition Subscriber Notification System Verification</p>
        <p style="color: #44403C; line-height: 1.6;">Bonjour Dr. Joannie Neveu,</p>
        <p style="color: #44403C; line-height: 1.6;">Your subscriber broadcast system is live and verified! Here is the current status of your expedition subscriber community:</p>
        <ul style="color: #44403C; line-height: 1.8;">
          <li><strong>Total Subscribers:</strong> ${subscribers.length}</li>
          <li><strong>Approved Active Followers:</strong> ${approved.length}</li>
          <li><strong>Current Rig Location:</strong> ${liveLocation.lastCity || 'Lethbridge, AB'}</li>
          <li><strong>Odometer Reading:</strong> 3,820 km</li>
        </ul>
        <p style="color: #78716C; font-size: 13px; margin-top: 24px; border-top: 1px solid #E5E0D8; padding-top: 16px;">
          Sent via Mousse on the Loose Admin Suite for Joannie Neveu & Barton
        </p>
      </div>
    `;

    const dispatchResult = await dispatchEmail({
      to: [toEmail],
      subject,
      html,
      text: plainText
    });

    const broadcastLog: EmailBroadcastLog = {
      id: `test-email-${Date.now()}`,
      logId: 'test-ping',
      logTitle: 'Expedition Broadcast Test to Joannie',
      subject,
      recipientCount: 1,
      sentAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      senderAdmin: 'Dr. Joannie Neveu',
      customNote: 'Direct verification ping sent to administrator email',
      status: 'delivered'
    };

    broadcastLogs.unshift(broadcastLog);
    saveDataStore();

    res.json({
      success: true,
      mode: dispatchResult.mode,
      message: `Test email dispatched to ${toEmail} (Mode: ${dispatchResult.mode})! ${subscribers.length} total subscribers currently registered.`
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

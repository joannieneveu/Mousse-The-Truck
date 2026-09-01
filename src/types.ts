export type JournalCategory = 
  | 'adventures_mba'       // Barton & Joannie: Adventures & MBA on the Road
  | 'henri_milestones'     // Henri's Milestones
  | 'visits_along_the_way'; // Visits Along the Way

export type JourneyLeg = 
  | 'all'
  | 'arctic_yukon'
  | 'arctic_dempster'
  | 'rockies_pacific'
  | 'us_southwest'
  | 'baja_mexico'
  | 'mexico_central'
  | 'central_america'
  | 'andes_south_america'
  | 'andes_patagonia'
  | 'patagonia_tierradelfuego';

export type UserRole =
  | 'expedition_leader'
  | 'family_member'
  | 'colleague'
  | 'mba_cohort'
  | 'friend_follower';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatar: string;
  joinedDate: string;
  bio?: string;
  isAdmin?: boolean;
}

export interface CommentItem {
  id: string;
  targetId?: string;
  targetType?: 'log' | 'media' | 'rig' | 'live_radar';
  logId?: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  authorRole?: UserRole;
  authorRoleLabel?: string;
  content?: string;
  createdAt?: string;
  likes: number;
  likedByUsers?: string[];
  replyToId?: string;
}

export interface Waypoint {
  id: string;
  name: string;
  region?: string;
  country: string;
  leg?: JourneyLeg;
  journeyLeg?: JourneyLeg;
  lat: number;
  lng: number;
  date?: string;
  status: 'completed' | 'current' | 'in_progress' | 'upcoming';
  elevationM?: number;
  summary?: string;
  description?: string;
  henriNote?: string;
  mbaNote?: string;
  category?: string;
  familyMembersPresent?: string[];
  thumbnail?: string;
  coverImage?: string;
  distanceFromStartKm?: number;
  distanceFromPreviousKm?: number;
  relatedLogId?: string;
}

export interface LiveLocation {
  lat: number;
  lng: number;
  altitudeM?: number;
  speedKmh?: number;
  heading?: number;
  timestamp: string;
  accuracyM?: number;
  batteryPercent?: number;
  isSharing?: boolean;
  isSharingLocation?: boolean;
  statusMessage: string;
  lastCity: string;
  nextMilestone: string;
  trackingMode: 'live_browser_gps' | 'satellite_inreach' | 'manual_checkin' | 'simulated_demo';
  weather?: {
    tempC: number;
    condition: string;
    icon: string;
  };
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  caption: string;
  locationName: string;
  coordinates?: { lat: number; lng: number };
  date: string;
  tags: string[];
  author: string;
  featured?: boolean;
  videoDuration?: string;
  journeyLeg?: JourneyLeg;
  likesCount?: number;
  commentsCount?: number;
}

export interface TravelLog {
  id: string;
  title: string;
  slug: string;
  date: string;
  locationName: string;
  country: string;
  coordinates: { lat: number; lng: number };
  author: string;
  readingTime: string;
  category: JournalCategory;
  journeyLeg?: JourneyLeg;
  status?: 'draft' | 'published';
  excerpt: string;
  content: string;
  coverImage: string;
  gallery: { url: string; caption: string; type: 'image' | 'video' }[];
  metrics: {
    elevationM?: number;
    tempC?: number;
    kmTraveled?: number;
    henriAge?: string;
    mbaModule?: string;
    visitors?: string;
    activityType?: string;
  };
  locationInsights?: {
    population?: string;
    interestingFacts?: string[];
    culturalContext?: string;
    activityTips?: string;
  };
  henriHighlight?: string;
  mbaHighlight?: string;
  visitorHighlight?: string;
  tags: string[];
  fontFamily?: 'serif' | 'sans' | 'mono' | 'handwriting';
  likesCount?: number;
  commentsCount?: number;
}

export interface Subscriber {
  id: string;
  email: string;
  name: string;
  relationshipNote?: string;
  status: 'approved' | 'pending';
  subscribedAt: string;
  approvedAt?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  bio: string;
  avatar: string;
  onTripWithUs: boolean;
  detailNote?: string;
}

export interface RigPhoto {
  id: string;
  title: string;
  caption: string;
  url: string;
  category: 'exterior' | 'interior' | 'henri_cot' | 'solar_power' | 'kitchen' | 'workstation';
  uploadedAt: string;
}

export interface RigSpecCategory {
  id: string;
  title: string;
  iconName: string;
  description: string;
  specs: { label: string; value: string; details?: string }[];
}

export type GoogleMapLayerType = 
  | 'google_roadmap' 
  | 'google_satellite' 
  | 'google_hybrid' 
  | 'google_terrain' 
  | 'carto_voyager' 
  | 'osm';

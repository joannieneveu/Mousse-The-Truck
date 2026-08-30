import { 
  Waypoint, 
  LiveLocation, 
  TravelLog, 
  MediaItem, 
  Subscriber, 
  FamilyMember, 
  UserProfile, 
  CommentItem,
  RigPhoto,
  RigSpecCategory
} from '../types';

export const ADMIN_USERS: UserProfile[] = [
  {
    id: 'user_joannie',
    name: 'Joannie',
    email: 'joannie@mun.ca',
    role: 'expedition_leader',
    roleLabel: 'Joannie (Expedition Leader & Navigator)',
    avatar: '/Joannie.jpeg',
    joinedDate: 'August 2026',
    bio: 'Physician on sabbatical, part-time expedition driver, navigating 35,000 km across the Americas while caring for baby Henri, learning Spanish, doing research, and completing remote MBA coursework.',
    isAdmin: true
  },
  {
    id: 'user_barton',
    name: 'Barton',
    email: 'barton@mun.ca',
    role: 'expedition_leader',
    roleLabel: 'Barton (Expedition Leader & Driver)',
    avatar: '/Barton.jpeg',
    joinedDate: 'August 2026',
    bio: 'Physician, Skier, expedition driver, 4x4 overland student, and remote MBA student managing our travel adventures and campfire dinners while also caring for baby Henri.',
    isAdmin: true
  }
];

export const PRESET_USERS = ADMIN_USERS;

export const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'joannie',
    name: 'Joannie',
    relation: 'Physician, Runner, Snowboarder, Aspiring Kitesurfer & Mom',
    bio: 'Physician, runner, Snowboarder, and aspiring kitesurfer traversing 35,000 km across the Americas while caring for baby Henri, learning Spanish, conducting research, and completing remote MBA coursework.',
    avatar: '/Joannie.jpeg',
    onTripWithUs: true,
    detailNote: 'Physician from Newfoundland • Full-time in the truck with Barton & Henri'
  },
  {
    id: 'barton',
    name: 'Barton',
    relation: 'Physician, Skier, Mountain Biker, Driver & Dad',
    bio: 'Physician, skier, mountain biker, expedition driver, and remote MBA student managing our travel routes and campfire dinners while caring for baby Henri.',
    avatar: '/Barton.jpeg',
    onTripWithUs: true,
    detailNote: 'Physician from Newfoundland • Full-time in the truck with Joannie & Henri'
  },
  {
    id: 'baby_henri',
    name: 'Henri',
    relation: 'Chief Sunrise Supervisor, Director of Milk & Nap Operations',
    bio: 'Chief Sunrise Supervisor & Director of Milk & Nap Operations. Born June 2026, exploring all 35,000+ km from the Arctic Ocean to Ushuaia from his custom truck cot and carriers.',
    avatar: '/Henri.jpeg',
    onTripWithUs: true,
    detailNote: 'Born June 2026 • Full-time overland traveler in his custom truck cot'
  },
  {
    id: 'riley',
    name: 'Riley',
    relation: 'Daughter & Twin Mom (St. John\'s, NL)',
    bio: 'Cheering on the sabbatical from home in St. John\'s, NL! Riley just had baby twins of her own, so she is immersed in double baby bliss.',
    avatar: '',
    onTripWithUs: false,
    detailNote: 'At home in St. John’s, Newfoundland with newborn twins'
  },
  {
    id: 'bridger',
    name: 'Bridger',
    relation: 'Family (Vancouver, BC)',
    bio: 'Keeping up with the coordinates, route maps, and Henri’s newest milestones from Vancouver, BC.',
    avatar: '',
    onTripWithUs: false,
    detailNote: 'Tracking the route from Vancouver, British Columbia'
  },
  {
    id: 'nikolai',
    name: 'Nikolai',
    relation: 'Med Student (St. John\'s, NL)',
    bio: 'Med student, keeping the pulse on the hospital and our house while following our journey from Canada to Argentina.',
    avatar: '',
    onTripWithUs: false,
    detailNote: 'Med student holding down the fort in St. John’s, Newfoundland'
  },
  {
    id: 'mattea',
    name: 'Mattéa',
    relation: 'Sister & McGill Student (Montreal, QC)',
    bio: 'Loving the photos and updates of little brother Henri exploring the outdoors while doing her second year university at McGill.',
    avatar: '',
    onTripWithUs: false,
    detailNote: 'Second-year student at McGill University in Montreal'
  }
];

export const INITIAL_SUBSCRIBERS: Subscriber[] = [
  {
    id: 'sub-1',
    name: 'Riley',
    email: 'riley.family@americasexpedition.com',
    relationshipNote: 'Daughter (twin mom)',
    status: 'approved',
    subscribedAt: 'June 1, 2026',
    approvedAt: 'June 1, 2026'
  },
  {
    id: 'sub-2',
    name: 'Bridger',
    email: 'bridger.family@americasexpedition.com',
    relationshipNote: 'Family',
    status: 'approved',
    subscribedAt: 'June 2, 2026',
    approvedAt: 'June 2, 2026'
  },
  {
    id: 'sub-3',
    name: 'Nikolai',
    email: 'nikolai.family@americasexpedition.com',
    relationshipNote: 'Family',
    status: 'approved',
    subscribedAt: 'June 2, 2026',
    approvedAt: 'June 2, 2026'
  },
  {
    id: 'sub-4',
    name: 'Mattéa',
    email: 'mattea.family@americasexpedition.com',
    relationshipNote: 'Family',
    status: 'approved',
    subscribedAt: 'June 3, 2026',
    approvedAt: 'June 3, 2026'
  },
  {
    id: 'sub-5',
    name: 'Sarah Jenkins',
    email: 'sarah.hospital@calgaryhealth.ca',
    relationshipNote: 'Physician colleague',
    status: 'approved',
    subscribedAt: 'June 8, 2026',
    approvedAt: 'June 9, 2026'
  },
  {
    id: 'sub-6',
    name: 'Alex Rivera',
    email: 'alex.mba@cohort2027.org',
    relationshipNote: 'MBA classmate',
    status: 'approved',
    subscribedAt: 'June 15, 2026',
    approvedAt: 'June 16, 2026'
  },
  {
    id: 'sub-7',
    name: 'Marcus Vance',
    email: 'marcus.vance@overlandtravelers.net',
    relationshipNote: 'Met at Yukon campground',
    status: 'pending',
    subscribedAt: 'August 28, 2026'
  }
];

export const INITIAL_TRAVEL_LOGS: TravelLog[] = [
  // 1 Active Published Entry
  {
    id: 'log-departure-mousse',
    title: 'The Grand Departure in Mousse: Embarking on 35,000 km from Newfoundland to the Americas',
    slug: 'grand-departure-in-mousse',
    date: 'August 28, 2026',
    locationName: 'Lethbridge & Heading North to Arctic Tundra',
    country: 'Canada',
    coordinates: { lat: 49.6956, lng: -112.8451 },
    author: 'Joannie & Barton',
    readingTime: '4 min read',
    category: 'adventures_mba',
    journeyLeg: 'arctic_yukon',
    status: 'published',
    excerpt: 'After months of planning, packing baby Henri’s gear, and picking up our custom moss-green rig, Mousse, our 35,000 km sabbatical expedition from the Arctic to Antarctica is officially underway!',
    content: `After months of preparation, route mapping, and building out our overland truck, we picked up Mousse in Lethbridge, Alberta on August 27th and officially set off on our grand adventure on August 28th, 2026!

Travelling with our newest addition, baby Henri (born June 2026), our expedition will span 35,000 km from the Arctic Ocean all the way south to Ushuaia, Argentina and Antarctica. Alongside driving and wilderness camp routines, Barton and I are balancing remote Executive MBA coursework via Starlink satellite.

Henri is settling into his custom truck crib with wide eyes, and Mousse’s off-grid solar power and heated living quarters feel like the perfect mobile family home.

From here, our compass points north up the Alaska Highway and Dempster Highway toward the Arctic Ocean at Tuktoyaktuk. Follow along with us on our live GPS map!`,
    coverImage: '/lethbridge_departure.jpg',
    gallery: [
      {
        url: '/departure.jpeg',
        caption: 'The Family Departure: Joannie, Barton, and baby Henri (born June 2026) setting off from Lethbridge on the 35,000 km journey.',
        type: 'image'
      },
      {
        url: '/lethbridge_departure.jpg',
        caption: 'Graphic Landscape: Overland expedition rig Mousse departing Lethbridge into the Alberta big sky sunrise.',
        type: 'image'
      },
      {
        url: '/Mousse1.jpeg',
        caption: 'Mousse: Our custom moss-green 4x4 overland truck ready for gravel and tundra.',
        type: 'image'
      },
      {
        url: '/Runner.jpeg',
        caption: 'Trail running and outdoor exploration on the open road ahead.',
        type: 'image'
      }
    ],
    metrics: {
      elevationM: 910,
      tempC: 22,
      kmTraveled: 0,
      henriAge: '2.5 months',
      mbaModule: 'Foundational Strategy & Road Studies'
    },
    locationInsights: {
      population: '101,482 (Lethbridge)',
      interestingFacts: [
        'Home to the High Level Bridge, the longest and highest viable trestle bridge in the world (built in 1909).',
        'Known for its warm chinook winds and proximity to the Canadian Rocky Mountain front.'
      ],
      culturalContext: 'Located on traditional Siksikaitsitapi (Blackfoot Confederacy) territory.',
      activityTips: 'Equipping and organizing expedition gear, testing Starlink 12V conversion, and heading north along Highway 2.'
    },
    mbaHighlight: 'Configured Starlink mobile satellite system and kicked off initial road-term MBA readings.',
    henriHighlight: 'Henri testing out his custom truck crib for the very first night on the road!',
    tags: ['Departure', 'Mousse On The Loose', 'Lethbridge', 'Expedition Launch', 'Newfoundland Family'],
    likesCount: 14,
    commentsCount: 2
  },

  // Category 1: adventures_mba (DRAFT - will be published upon reaching the Arctic)
  {
    id: 'log-1-tuktoyaktuk',
    title: 'Reaching the Arctic Ocean at Tuktoyaktuk: The Northern Apex of our Sabbatical',
    slug: 'reaching-arctic-ocean-tuktoyaktuk',
    date: 'July 15, 2026',
    locationName: 'Tuktoyaktuk, Northwest Territories',
    country: 'Canada',
    coordinates: { lat: 69.4454, lng: -133.0342 },
    author: 'Joannie & Barton',
    readingTime: '5 min read',
    category: 'adventures_mba',
    journeyLeg: 'arctic_yukon',
    status: 'draft',
    excerpt: 'Standing on the rocky gravel shore of the Beaufort Sea in 3°C air, looking out at the Arctic Ocean with Barton and 3-month-old Henri. We have reached the northernmost point of our 35,000 km expedition.',
    content: `After months of preparation, route mapping, and outfitting our 4x4 campervan, reaching Tuktoyaktuk felt like stepping onto another planet.

The Dempster Highway threw everything at our rig: washboard gravel, thick northern mud, and endless rolling tundra. Barton navigated the long shifts with patience, while the van’s custom off-grid power setup and heated living quarters kept our little family cozy.

During evening stops under the 24-hour midnight sun, Barton and I worked on our remote Executive MBA readings via Starlink. Discussing corporate finance and supply chain logistics at 69° North while listening to the wind sweep across the Arctic tundra is an experience we will never forget.

From here, every single kilometer points south. Next stop: heading back through the Yukon and down toward the Pacific Northwest.`,
    coverImage: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=800&q=80',
        caption: 'The Arctic Ocean coast at Tuktoyaktuk, NWT.',
        type: 'image'
      },
      {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        caption: 'The Dempster Highway gravel stretch.',
        type: 'image'
      }
    ],
    metrics: {
      elevationM: 5,
      tempC: 3,
      kmTraveled: 3640,
      henriAge: '3 months',
      mbaModule: 'Economics & Supply Chain Analysis'
    },
    mbaHighlight: 'Reviewed remote MBA case studies under the Arctic midnight sun with our Starlink setup.',
    tags: ['Arctic Ocean', 'Dempster Highway', 'MBA On The Road', 'Adventures']
  },

  // Category 2: henri_milestones (DRAFT)
  {
    id: 'log-2-henri-arctic-dips',
    title: 'Henri’s First Ocean Dip: Touching the Arctic Sea in Wool Booties',
    slug: 'henri-first-ocean-dip-arctic',
    date: 'July 16, 2026',
    locationName: 'Beaufort Sea, Tuktoyaktuk',
    country: 'Canada',
    coordinates: { lat: 69.4454, lng: -133.0342 },
    author: 'Joannie & Barton',
    readingTime: '3 min read',
    category: 'henri_milestones',
    journeyLeg: 'arctic_yukon',
    status: 'draft',
    excerpt: 'Little Henri turned 3 months old on the Dempster Highway. Today we gently dipped his tiny wool bootie into the Arctic Ocean surf!',
    content: `Henri continues to be the calmest, happiest little companion on this expedition. 

The rhythmic vibration of the 4x4 campervan on gravel roads lulls him into the most peaceful naps. In Tuktoyaktuk, bundled in three layers of soft merino wool and his insulated down suit, he opened his big eyes to look at the vast expanse of the Beaufort Sea.

We gently dipped the toe of his warm bootie into the edge of the Arctic water. One day we will tell him that before he could crawl, he was already at the edge of the Arctic Ocean.

Milestones this month:
- Rolling over easily during tummy time on the van’s rear bed
- Big, bubbly giggles whenever Barton sings camp songs
- Sleeping through the night despite 24 hours of Arctic daylight`,
    coverImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
        caption: 'Henri all bundled up for the brisk Arctic breeze.',
        type: 'image'
      }
    ],
    metrics: {
      elevationM: 5,
      tempC: 4,
      kmTraveled: 3650,
      henriAge: '3 months, 18 days'
    },
    henriHighlight: 'Dipped his bootie in the Arctic Ocean and rolled over on the campervan bed in full midnight daylight!',
    tags: ['Henri Milestones', 'Baby On Board', 'Arctic Memories']
  },

  // Category 3: visits_along_the_way (DRAFT)
  {
    id: 'log-3-whitehorse-fellowship',
    title: 'Yukon Hospitality: Visiting Old Friends & Fellow Sabbatical Travelers in Whitehorse',
    slug: 'yukon-hospitality-whitehorse-visit',
    date: 'June 22, 2026',
    locationName: 'Whitehorse, Yukon Territory',
    country: 'Canada',
    coordinates: { lat: 60.7212, lng: -135.0568 },
    author: 'Joannie & Barton',
    readingTime: '4 min read',
    category: 'visits_along_the_way',
    journeyLeg: 'arctic_yukon',
    status: 'draft',
    excerpt: 'A wonderful stopover in Whitehorse to visit friends, share a home-cooked dinner, and connect with fellow overlanders heading north.',
    content: `After long days on the Alaska Highway, pulling into Whitehorse was a breath of fresh air. 

We had the pleasure of catching up with old medical school friends and sharing a warm meal around a real dining table. Henri loved being passed around for cuddles, and we had a great time swapping travel stories with an overlanding family who just completed their trip from South America.

Having these personal visits and connections along the route grounds our journey in community. It reminds us that while the geography is stunning, the people we visit make the trip truly special.`,
    coverImage: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
        caption: 'Evening light over the Yukon River in Whitehorse.',
        type: 'image'
      }
    ],
    metrics: {
      elevationM: 670,
      tempC: 18,
      kmTraveled: 2150,
      henriAge: '2.5 months',
      visitors: 'Dave & Elena (Whitehorse)'
    },
    visitorHighlight: 'Dinner in Whitehorse with Dave & Elena, and sharing route advice with fellow overlanders.',
    tags: ['Visits Along The Way', 'Whitehorse', 'Yukon Friends']
  },

  // Category 1: adventures_mba (DRAFT)
  {
    id: 'log-4-pacific-northwest',
    title: 'Heading South through the Pacific Northwest: Olympic Peninsula & Ferry Crossings',
    slug: 'pacific-northwest-olympic-peninsula',
    date: 'August 24, 2026',
    locationName: 'Seattle & Olympic Peninsula, WA',
    country: 'United States',
    coordinates: { lat: 47.6062, lng: -122.3321 },
    author: 'Joannie & Barton',
    readingTime: '4 min read',
    category: 'adventures_mba',
    journeyLeg: 'rockies_pacific',
    status: 'draft',
    excerpt: 'Descending into the towering mossy rainforests of Washington state, taking ferry crossings across Puget Sound, and digging into our fall MBA team project.',
    content: `The contrast between the stark Arctic tundra and the dense temperate rainforests of the Pacific Northwest is breathtaking.

We’ve set up camp along the Olympic Peninsula, surrounded by giant Douglas firs and cedar trees. The air smells of salt water and cedar.

Barton and I spent this morning on a virtual team strategy call with our MBA cohort. Working collaboratively across time zones from inside our campervan is becoming second nature. The solar battery system has been rock-solid, powering our laptops, Starlink, and baby bottle warmers effortlessly.

Next up: navigating south along the Oregon Coast and through the California Redwoods toward Baja!`,
    coverImage: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362?auto=format&fit=crop&w=800&q=80',
        caption: 'Lush greenery and coastline in the Pacific Northwest.',
        type: 'image'
      }
    ],
    metrics: {
      elevationM: 68,
      tempC: 20,
      kmTraveled: 6920,
      henriAge: '4.5 months',
      mbaModule: 'Strategic Leadership & Remote Team Dynamics'
    },
    mbaHighlight: 'Completed our MBA strategy cohort presentation via Starlink from Olympic National Park.',
    tags: ['Pacific Northwest', 'MBA On The Road', 'Camper Life', 'Adventures']
  },

  // Category 2: henri_milestones (DRAFT)
  {
    id: 'log-5-henri-forest-smiles',
    title: 'Henri’s 4-Month Milestones: Discovering Giant Trees and Rainforest Sounds',
    slug: 'henri-4-month-milestones-rainforest',
    date: 'August 26, 2026',
    locationName: 'Olympic Peninsula, Washington',
    country: 'United States',
    coordinates: { lat: 47.6062, lng: -122.3321 },
    author: 'Joannie & Barton',
    readingTime: '3 min read',
    category: 'henri_milestones',
    journeyLeg: 'rockies_pacific',
    status: 'draft',
    excerpt: 'Henri is now 4 months old! He loves riding in the front carrier, staring up through the canopy at sunlight filtering through the trees.',
    content: `Henri reached his 4-month mark this week, and we are amazed by how quickly he is growing.

His favorite activity is riding in the baby sling on morning walks. He tracks birds with his eyes and reaches his hands toward tree branches. In the van, he is practicing grabbing his soft teething toys and babbling happily while Barton cooks dinner.

We check in with family back home regularly via video calls. Riley shared photos of her newborn twins, and Henri seemed fascinated by the sounds of the babies over the screen!

Current Henri Stats:
- Age: 4 months
- Favorite sound: Barton whistling while making morning pour-over coffee
- Favorite view: Canopy leaves dancing in the coastal breeze`,
    coverImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
        caption: 'Morning carrier walk through coastal forests with Henri.',
        type: 'image'
      }
    ],
    metrics: {
      elevationM: 68,
      tempC: 19,
      kmTraveled: 6930,
      henriAge: '4 months'
    },
    henriHighlight: '4-month growth milestone! Reaching for toys, wide awake forest walks, and video chatting with big sister Riley and her new twins.',
    tags: ['Henri Milestones', '4 Months Old', 'Family Love']
  }
];

export const INITIAL_LIVE_LOCATION: LiveLocation = {
  lat: 47.6062,
  lng: -122.3321,
  altitudeM: 68,
  speedKmh: 0,
  heading: 185,
  timestamp: new Date().toISOString(),
  accuracyM: 4.8,
  batteryPercent: 92,
  isSharing: true,
  statusMessage: 'Parked along Puget Sound on the Olympic Peninsula. Coffee brewing, Henri enjoying morning tummy time, and preparing for the drive south!',
  lastCity: 'Seattle & Olympic Peninsula, WA',
  nextMilestone: 'Oregon Coast & California Redwoods',
  trackingMode: 'live_browser_gps',
  weather: {
    tempC: 19,
    condition: 'Crisp Coastal Sun',
    icon: 'sun'
  }
};

export const INITIAL_WAYPOINTS: Waypoint[] = [
  {
    id: 'lethbridge',
    name: 'Lethbridge, Alberta',
    region: 'Truck Pickup Point',
    country: 'Canada',
    leg: 'arctic_yukon',
    lat: 49.6956,
    lng: -112.8451,
    date: 'August 27, 2026',
    status: 'completed',
    elevationM: 910,
    summary: 'Picked up our custom overland truck in Lethbridge on August 27th, packed baby Henri’s gear, and embarked on our grand journey up North on August 28th!',
    henriNote: 'Henri testing out his custom truck crib for the very first night.',
    mbaNote: 'Configured Starlink and reviewed our first road-term syllabus.',
    thumbnail: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=600&q=80',
    distanceFromStartKm: 0
  },
  {
    id: 'whitehorse',
    name: 'Whitehorse, Yukon',
    region: 'Yukon Territory',
    country: 'Canada',
    leg: 'arctic_yukon',
    lat: 60.7212,
    lng: -135.0568,
    date: 'September 2026',
    status: 'completed',
    elevationM: 670,
    summary: 'Visited medical friends in Whitehorse and prepped the 4x4 rig for the Dempster Highway gravel run.',
    henriNote: 'Rolled over on the camper bed under 24-hour midnight daylight.',
    mbaNote: 'Strategy team breakout call from the banks of the Yukon River.',
    thumbnail: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80',
    distanceFromStartKm: 2150,
    relatedLogId: 'log-3-whitehorse-fellowship'
  },
  {
    id: 'tuktoyaktuk',
    name: 'Tuktoyaktuk (Arctic Ocean)',
    region: 'Beaufort Sea, NWT',
    country: 'Canada',
    leg: 'arctic_yukon',
    lat: 69.4454,
    lng: -133.0342,
    date: 'July 15, 2026',
    status: 'completed',
    elevationM: 5,
    summary: 'The Northern Apex! Dipped Henri’s bootie into the Arctic Ocean surf at 69° North.',
    henriNote: 'Dipped his bootie in the Arctic Ocean!',
    mbaNote: 'Supply chain analysis of extreme northern logistics.',
    thumbnail: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=600&q=80',
    distanceFromStartKm: 3640,
    relatedLogId: 'log-1-tuktoyaktuk'
  },
  {
    id: 'olympic_peninsula',
    name: 'Olympic Peninsula & Seattle',
    region: 'Washington State',
    country: 'United States',
    leg: 'rockies_pacific',
    lat: 47.6062,
    lng: -122.3321,
    date: 'August 24, 2026',
    status: 'current',
    elevationM: 68,
    summary: 'CURRENT POSITION: Coastal rainforests, Puget Sound ferry crossings, and Henri’s 4-month milestones.',
    henriNote: '4 months old, loving forest carrier walks and smiling at big trees.',
    mbaNote: 'Working on fall MBA strategy cohort presentations.',
    thumbnail: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362?auto=format&fit=crop&w=600&q=80',
    distanceFromStartKm: 6920,
    relatedLogId: 'log-4-pacific-northwest'
  },
  {
    id: 'baja_mexico',
    name: 'Baja California & Sea of Cortez',
    region: 'Baja Peninsula',
    country: 'Mexico',
    leg: 'baja_mexico',
    lat: 26.0118,
    lng: -111.3486,
    date: 'October 2026',
    status: 'upcoming',
    elevationM: 12,
    summary: 'Planned: Desert coastal tracks, warm turquoise water, and off-grid solar camping with Henri.',
    distanceFromStartKm: 9800,
    thumbnail: 'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'costa_rica',
    name: 'Costa Rica Rainforests',
    region: 'Central America',
    country: 'Costa Rica',
    leg: 'central_america',
    lat: 9.3892,
    lng: -84.1404,
    date: 'December 2026',
    status: 'upcoming',
    elevationM: 1200,
    summary: 'Planned: Cloud forests, wildlife encounters, and warm tropical Christmas sabbatical celebration.',
    distanceFromStartKm: 15600,
    thumbnail: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'peru_andes',
    name: 'Cusco & Sacred Valley',
    region: 'Andes Mountains',
    country: 'Peru',
    leg: 'andes_south_america',
    lat: -13.5319,
    lng: -71.9675,
    date: 'March 2027',
    status: 'upcoming',
    elevationM: 3400,
    summary: 'Planned: High Andean passes, historic cultural sites, and alpaca watching with baby Henri.',
    distanceFromStartKm: 22100,
    thumbnail: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ushuaia',
    name: 'Ushuaia, Tierra del Fuego',
    region: 'Fin del Mundo',
    country: 'Argentina',
    leg: 'patagonia_tierradelfuego',
    lat: -54.8019,
    lng: -68.3030,
    date: 'June 2027',
    status: 'upcoming',
    elevationM: 8,
    summary: 'Planned: The Southernmost point! 35,000 km sabbatical triumph and celebrating Henri’s 1st birthday at the end of the world.',
    distanceFromStartKm: 34500,
    thumbnail: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80'
  }
];

export const INITIAL_MEDIA: MediaItem[] = [];

export const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: 'comm-1',
    targetId: 'log-1-tuktoyaktuk',
    targetType: 'log',
    authorId: 'user_riley',
    authorName: 'Riley',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    authorRole: 'family_member',
    authorRoleLabel: 'Riley (Twin Mom)',
    content: 'Mom & Barton, these Arctic photos are so incredible! Henri looks so tiny and adorable in that down suit. The twins and I are following your GPS track every day from home. Love you so much!',
    createdAt: 'July 16, 2026 • 3:20 PM',
    likes: 6,
    likedByUsers: ['user_joannie', 'user_barton']
  },
  {
    id: 'comm-2',
    targetId: 'log-2-henri-arctic-dips',
    targetType: 'log',
    authorId: 'user_mattea',
    authorName: 'Mattéa',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    authorRole: 'family_member',
    authorRoleLabel: 'Mattéa (Family)',
    content: 'That bootie in the Arctic Ocean photo is the best thing ever! Henri is already such a little explorer. Miss you guys!',
    createdAt: 'July 17, 2026 • 9:10 AM',
    likes: 4,
    likedByUsers: ['user_joannie', 'user_barton']
  },
  {
    id: 'comm-3',
    targetId: 'log-1-tuktoyaktuk',
    targetType: 'log',
    authorId: 'user_alex_mba',
    authorName: 'Alex Rivera',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    authorRole: 'mba_cohort',
    authorRoleLabel: 'MBA Cohort Classmate',
    content: 'Joining Zoom strategy discussions from 69° North latitude via Starlink is next-level! The whole MBA cohort is cheering you both on.',
    createdAt: 'July 18, 2026 • 11:45 AM',
    likes: 5,
    likedByUsers: ['user_barton']
  }
];

export const INITIAL_RIG_PHOTOS: RigPhoto[] = [
  {
    id: 'rig-photo-1',
    title: 'The 2026 Ford F550 Expedition Rig (Mousse)',
    caption: 'Custom 2026 Ford F550 XLT Crew Cab with 6.7L Turbo Diesel, Kelderman Air Ride suspension, and G3 4-season habitat.',
    url: '/Mousse1.jpeg',
    category: 'exterior',
    uploadedAt: 'August 2026'
  },
  {
    id: 'rig-photo-2',
    title: 'Interior Living & Henri’s Modular Cot',
    caption: 'Custom made removable modular cot sitting on the countertop next to the dinette with OKSTENCK 360° pneumatic table.',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    category: 'interior',
    uploadedAt: 'August 2026'
  },
  {
    id: 'rig-photo-3',
    title: '1100W Solar Roof & Starlink + Weboost',
    caption: '1100W high-efficiency solar panel array, Starlink Satellite high-speed terminal, and Weboost Drive Reach Overland cell signal booster.',
    url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80',
    category: 'solar_power',
    uploadedAt: 'August 2026'
  },
  {
    id: 'rig-photo-4',
    title: 'Off-Grid Galley & Infinity Summit Shower',
    caption: 'Torva sink, Vitrifrigo Slim 150 fridge, Toshiba 8-in-1 combo oven, Clesana C1 swivel toilet, and Infinity Shower Summit.',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    category: 'kitchen',
    uploadedAt: 'August 2026'
  }
];

export const RIG_SPECS_DATA: RigSpecCategory[] = [
  {
    id: 'chassis_drivetrain',
    title: 'Chassis, Suspension & Armor',
    iconName: 'Truck',
    description: 'Heavy-duty 2026 Ford F550 platform built for extreme reliability over 35,000 km of Arctic gravel and mountain trails.',
    specs: [
      { label: 'Vehicle Platform', value: '2026 Ford F550 XLT Crew Cab' },
      { label: 'Engine & Drivetrain', value: '6.7L Power Stroke Turbo Diesel (4x4)' },
      { label: 'Suspension System', value: 'Full Kelderman Air Ride Suspension System' },
      { label: 'Front Bumper', value: 'Buckstop Front Bumper Extra Wide, Winch Ready' },
      { label: 'Recovery Winch', value: 'Warn Winch 12-Volt 16,500 Pound Line Pull' },
      { label: 'Fender Flares', value: 'Buckstop F23 Fender Flare' },
      { label: 'Brake Lines', value: 'Suspension Front & Rear Extended Brake Lines' },
      { label: 'Speedometer Calibration', value: 'Hypertech 730125 In-Line Speedometer Calibrator' },
      { label: 'Trim & Fillers', value: 'Truck Hardware SUPER DUTY Black Aluminum Bar Fillers' }
    ]
  },
  {
    id: 'power_solar',
    title: '15 kWh EcoFlow Power & 1100W Solar',
    iconName: 'Zap',
    description: 'Massive 15 kWh lithium power architecture and 1100W solar array for total off-grid energy independence.',
    specs: [
      { label: 'Total Power System', value: '15 kWh EcoFlow Power System' },
      { label: 'Main Power Kit', value: 'EcoFlow Power Independence Kit – 10 kWh' },
      { label: 'Expansion Battery', value: 'EcoFlow 5 kWh LFP (Lithium Iron Phosphate) Battery' },
      { label: 'Solar Panel Array', value: '1100W High-Efficiency Solar Panel System' },
      { label: 'Power Distribution', value: 'Smart Integrated AC/DC Distribution Panel & Inverter' },
      { label: 'Charging Modes', value: 'High-Output Alternator DC-to-DC, 1100W Solar MPPT & Shore Power' }
    ]
  },
  {
    id: 'galley_water',
    title: 'Galley, Water, Bath & Sanitation',
    iconName: 'Coffee',
    description: '285.7L total fresh water, dedicated winter tank, Infinity Shower Summit, and complete kitchen appliances.',
    specs: [
      { label: 'Habitat Floor Plan', value: 'G3, 4 Seasons Expedition Habitat' },
      { label: 'Total Fresh Water Capacity', value: '285.7 Liters (Approx. 75.5 Gallons)' },
      { label: 'Winter Fresh Water Tank', value: 'Additional 20-Gallon Interior Freshwater Tank for Reliable Winter Use' },
      { label: 'Grey Water Storage', value: '110 Liters (29 Gallons) Grey Water Tank' },
      { label: 'Water Pump', value: 'Shurflo High-Flow Reliable Water Pump' },
      { label: 'Canister & Drainage', value: 'Standard Wide Neck Canister DIN 96 (19L) & Wastewater DIN96 Screw Ring Cap with 1m Hose' },
      { label: 'Kitchen Sink & Faucet', value: 'Torva 16 x 17 x 9″ RV Sink with Foldable Faucet – Black' },
      { label: 'Refrigeration', value: 'Vitrifrigo Slim 150 Fridge w/ Top Freezer' },
      { label: 'Cooking & Microwave', value: 'Toshiba Combo 8 in 1 Countertop Microwave Oven' },
      { label: 'Shower System', value: 'Infinity Shower Summit (High-Efficiency Recirculating)' },
      { label: 'Sanitation / Toilet', value: 'Clesana C1 Toilet with Round Swivel Base' }
    ]
  },
  {
    id: 'henri_nursery',
    title: 'Henri’s Nursery & Living Quarters',
    iconName: 'Baby',
    description: 'Specially arranged living interior and custom nursery sleeping setup for baby Henri on the road.',
    specs: [
      { label: 'Baby Henri Sleep Setup', value: 'Custom made removable modular cot sitting on the counter top next to the dinette' },
      { label: 'Adjustable Table', value: 'OKSTENCK Multi-Functional Adjustable Pneumatic RV Table Stand Legs (360° Swivel)' },
      { label: 'Interior Access Ladder', value: 'Virgola Folding Aluminum Step Ladder [3 Step]' },
      { label: 'Blackout Fan Cover', value: 'Rolef 17″ Blackout Maxxfan Cover With Rounded Corners (Black)' },
      { label: 'Interior Materials', value: 'Warm natural finishes, insulated subfloor, and easy-clean surfaces' }
    ]
  },
  {
    id: 'connectivity_safety',
    title: 'Connectivity, Cameras & Safety',
    iconName: 'Wifi',
    description: 'High-speed Starlink satellite, cell signal boosting, 3K 8-channel security DVR, and essential environmental alarms.',
    specs: [
      { label: 'Satellite Internet', value: 'Starlink Satellite High-Speed' },
      { label: 'Cellular Signal Booster', value: 'Weboost Drive Reach Overland – Cell Phone Signal Booster' },
      { label: 'Video Surveillance DVR', value: 'Annke 8ch 3K lite digital video recorder with 1TB embedded SSD' },
      { label: 'Backup Camera', value: 'Pixelman backup camera AHD 1080P Metal 170 degree wide angle' },
      { label: 'Gas & Air Safety', value: 'Dual Carbon Monoxide + Propane Gas Alarm' },
      { label: 'Fire Safety', value: 'Element E50 Handheld Portable Fire Extinguisher' }
    ]
  },
  {
    id: 'climate_lighting_exterior',
    title: 'Climate, Windows, Awning & Baja Lighting',
    iconName: 'Thermometer',
    description: 'ProHeat hydronic heating/hot water, Broad Arrow windows, Carefree power awning, and Baja Designs LED lighting.',
    specs: [
      { label: 'Heating & Hot Water', value: 'ProHeat Adventure Module Heat/Hot Water (ProHeat Install Kit X30 Overlander)' },
      { label: 'Roof Ventilation Fans', value: 'MAXXFAN Deluxe 7500K, 10 Speed, with Remote (Smoke)' },
      { label: 'Auxiliary Vents & Fans', value: 'MaxxAir Vent & RV Cooling Fan' },
      { label: 'Overland Windows', value: 'Broad Arrow Flat Windows: 297×447, 797×397, 997×497' },
      { label: 'Powered Outdoor Awning', value: 'Carefree Freedom Freestyle WallMount 12 Power Awning 13’1″' },
      { label: 'Scene / Work Lighting', value: 'Baja Designs Squadron Sport Angled Flush Mount LED Work/Scene' },
      { label: 'Cornering Light Pods', value: 'Squadron-R Pro, Black LED Auxiliary Light Pod Pair Wide Cornering' },
      { label: 'Driving / Combo Lights', value: 'LP4 Pro, Pair Driving/Combo LED' }
    ]
  }
];

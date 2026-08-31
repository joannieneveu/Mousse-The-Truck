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
    name: 'Barton Thiessen',
    email: 'barton@mun.ca',
    role: 'expedition_leader',
    roleLabel: 'Barton Thiessen (Expedition Leader & Driver)',
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
    name: 'Mattea',
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
    name: 'Mattea',
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
  // 1 Active Published Entry - Departure
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
    coverImage: '/departure.jpeg',
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
    likesCount: 0,
    commentsCount: 0
  }
];

export const INITIAL_LIVE_LOCATION: LiveLocation = {
  lat: 49.6956,
  lng: -112.8451,
  altitudeM: 910,
  speedKmh: 0,
  heading: 0,
  timestamp: new Date().toISOString(),
  accuracyM: 5.0,
  batteryPercent: 98,
  isSharing: true,
  statusMessage: 'Picked up Mousse in Lethbridge, Alberta! Truck organized, baby Henri snug in his custom crib, Starlink active, and setting off on the 35,000 km expedition.',
  lastCity: 'Lethbridge, Alberta',
  nextMilestone: 'Banff National Park & Alaska Highway',
  trackingMode: 'live_browser_gps',
  weather: {
    tempC: 22,
    condition: 'Sunny & Clear Big Sky',
    icon: 'sun'
  }
};

export const INITIAL_WAYPOINTS: Waypoint[] = [
  {
    id: 'lethbridge',
    name: 'Lethbridge, Alberta',
    region: 'Truck Pickup & Launch Point',
    country: 'Canada',
    leg: 'arctic_yukon',
    lat: 49.6956,
    lng: -112.8451,
    date: 'August 28, 2026',
    status: 'completed',
    elevationM: 910,
    summary: 'Picked up our custom overland truck in Lethbridge on August 27th, packed baby Henri’s gear, and embarked on our grand journey up North on August 28th!',
    henriNote: 'Henri testing out his custom truck crib for the very first night.',
    mbaNote: 'Configured Starlink and reviewed our first road-term syllabus.',
    thumbnail: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=600&q=80',
    distanceFromStartKm: 0,
    relatedLogId: 'log-departure-mousse'
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
    status: 'upcoming',
    elevationM: 670,
    summary: 'Planned: Visiting medical friends in Whitehorse and prepping the 4x4 rig for the Dempster Highway gravel run.',
    thumbnail: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80',
    distanceFromStartKm: 2150
  },
  {
    id: 'tuktoyaktuk',
    name: 'Tuktoyaktuk (Arctic Ocean)',
    region: 'Beaufort Sea, NWT',
    country: 'Canada',
    leg: 'arctic_yukon',
    lat: 69.4454,
    lng: -133.0342,
    date: 'October 2026',
    status: 'upcoming',
    elevationM: 5,
    summary: 'Planned: The Northern Apex! Reaching the Beaufort Sea and Arctic Ocean surf at 69° North.',
    thumbnail: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=600&q=80',
    distanceFromStartKm: 3640
  },
  {
    id: 'olympic_peninsula',
    name: 'Pacific Northwest & Redwoods',
    region: 'Washington & Oregon',
    country: 'United States',
    leg: 'rockies_pacific',
    lat: 47.6062,
    lng: -122.3321,
    date: 'November 2026',
    status: 'upcoming',
    elevationM: 68,
    summary: 'Planned: Coastal rainforests, Puget Sound ferry crossings, and exploring the California Redwoods.',
    thumbnail: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362?auto=format&fit=crop&w=600&q=80',
    distanceFromStartKm: 6920
  },
  {
    id: 'baja_mexico',
    name: 'Baja California & Sea of Cortez',
    region: 'Baja Peninsula',
    country: 'Mexico',
    leg: 'baja_mexico',
    lat: 26.0118,
    lng: -111.3486,
    date: 'December 2026',
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
    date: 'February 2027',
    status: 'upcoming',
    elevationM: 1200,
    summary: 'Planned: Cloud forests, wildlife encounters, and warm tropical sabbatical adventures.',
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
    date: 'April 2027',
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

export const INITIAL_COMMENTS: CommentItem[] = [];

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

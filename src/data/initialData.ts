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
  // Entry 2 - Alberta to Yukon & Whitehorse Adventures
  {
    id: 'log-2-alberta-to-yukon',
    title: 'From Family Roots to Laundromat Fiascos: Alberta, Hot Springs & Rolling into the Yukon!',
    slug: 'alberta-to-yukon-family-roots-hot-springs-laundromat',
    date: 'August 31, 2026',
    locationName: 'Whitehorse & En Route to Pelly Crossing, Yukon',
    country: 'Canada',
    coordinates: { lat: 60.7212, lng: -135.0568 },
    author: 'Joannie & Barton',
    readingTime: '6 min read',
    category: 'adventures_mba',
    journeyLeg: 'arctic_yukon',
    status: 'published',
    excerpt: 'And just like that… Mousse is officially on the loose. From visiting the old Thiessen family farm in DeBolt and Henri’s first swim at Liard Hot Springs to the infamous Whitehorse Laundromat Incident.',
    content: `And just like that… Mousse is officially on the loose.

After a year and a half of planning, designing, changing our minds, changing them back, getting pregnant, needing a cot, waiting, dreaming, and wondering whether this enormous moss-green contraption would ever actually become ours, we finally picked up Mousse in Lethbridge.

And somehow, it is even better than we imagined.

There is something slightly surreal about spending 18 months planning a vehicle and then suddenly being handed the keys and thinking: Well… I guess we live in this now.

Our first night with Mousse was spent in the Calgary area at the home of Brian Thiessen, Barton’s first cousin once removed... a family relationship that I can confidently explain if consulting a diagram lol.

From there, we pointed Mousse north.

---

### **A Mini Thiessen Family Tour**

Our first stop was Red Deer, where we visited Barton’s Uncle Eddy and his wife, Anne.

It felt fitting that the beginning of a 35,000-km journey from Canada toward the bottom of South America would start with a little tour through Barton’s family history.

And things got even more nostalgic when we reached DeBolt, the tiny northern Alberta community where Barton’s dad grew up.

We followed gravel roads out to the old Thiessen family farm, which Barton’s grandparents sold in 1994. Amazingly, the same family still owns it today, and they very kindly welcomed a couple of strangers who showed up with a giant green expedition truck, a baby and a Thiessen family history lesson.

Then came the best surprise. Inside the garage was Nikolai (Nicholas) Thiessen’s old GMC truck.

Still there. Decades later.

Standing beside Barton, looking at his grandfather’s old GMC parked on the farm where his dad grew up, with Mousse sitting outside waiting to carry the next generation of Thiessens across the Americas, was pretty special.

Two trucks. A few generations. Very different suspension systems.

---

### **Edmonton: Pizza, Friends & Northern Intelligence**

Next stop: Edmonton, where we visited our friends Nadia and Mark and their kids, Ellie, Simon and Jacob.

Nadia and Mark lived in Inuvik for seven years, which means that compared with us, they are essentially northern expedition professionals. We arrived filled with questions. Over pizza, they downloaded as much northern wisdom into our brains as possible. They generously offered us a place to stay for the night, but apparently we had already developed a serious case of new-truck expedition fever.

We wanted NORTH. More kilometres. More wilderness. And, most importantly, we had a deadline: Dawson City for Barton’s birthday.

So we hugged everyone goodbye, climbed back into Mousse and kept driving.

---

### **Our First Proper Side-of-the-Road Sleep**

Eventually, enthusiasm lost its battle against our eyelids.

There were no towns nearby and this was precisely why we had spent 18 months building a house on wheels. So we opened iOverlander, found a quiet, flat gravel pullout in the middle of nowhere, parked Mousse, closed the blinds and went to sleep.

No reservation. No check-in. No checkout time. No fee. Five stars.

---

### **Henri’s First Swim**

The next day, we continued north through British Columbia toward the Yukon. But there was one mandatory stop along the way: Liard River Hot Springs. The weather could not have been less inviting.

Cold. Pouring rain.

And between us and the glorious steaming hot springs was a long wooden boardwalk through the boreal forest. Henri had opinions. Strong ones. We bundled him up and marched through the rain while he screamed with the conviction of a baby whose parents had clearly lost all ability to make rational decisions.

Then we reached the hot springs. We slipped into the warm water.

And…

Silence. Instantly. His eyes went huge. He relaxed. He floated. And just like that, in a natural hot spring in the middle of northern British Columbia, surrounded by forest, steam and pouring rain, Henri had his very first swim. He absolutely loved it.

---

### **Whitehorse & The Laundromat Incident**

On August 31, we crossed into the Yukon and rolled into Whitehorse. A glamorous milestone in any great overland expedition. Naturally, we celebrated by…

doing laundry ! (We didn't get the washing machine Joannie wanted... so we will spend a couple hours every week at a laundromat)

Overlanding, as it turns out, is approximately 30% breathtaking landscapes, 20% driving, 10% adventure and 40% trying to figure out where to wash your underwear ! haha Okay, Joannie's exaggerating.

We decided to divide and conquer. Barton took Mousse to run errands around Whitehorse while Joannie stayed at the laundromat with Henri.

This was a mistake.

Because the moment Barton disappeared with the truck... and, importantly, the diaper bag... Henri decided it was time.

Not for a normal poop. Not even for a respectable blowout. This was an event. The pee escaped the diaper, it conquered the pyjamas. And somehow, in the chaos that followed, our beautiful little son managed to leave a puddle of pee across the laundromat folding counter.

Meanwhile, Joannie was trying to manage multiple washing machines, deal with a half-naked baby, no clean PJ (obviously in the washing machine!) and find her cellphone (which, as anyone who travels with her knows, she loses approximately ten times per day in a 10 meter square area).

She needed to call Barton. No phone.  
She needed diapers. No diaper bag.  
She needed paper towels. Where were the paper towels?!

She turned back toward the counter.

And then… She saw her.

A lovely, completely innocent woman had walked to the counter with an enormous pile of freshly washed, beautifully warm, perfectly clean laundry. Before she could say anything, she placed the entire pile…

directly into Henri’s puddle of pee.

Joannie froze.

The lady started folding. Shirt. Fold. Pants. Fold. Another shirt. Fold.  
Then she touched the bottom of the pile. Paused. And said, very pleasantly: *“Oh… it’s a bit wet here. That’s too bad!”*

This was Joannie's moment.

She could tell her the truth. She could confess. She could explain that the mysterious moisture soaking into her freshly laundered clothing had, moments earlier, been inside her infant son. She looked at this sweet woman. She looked at her laundry. She looked at Henri.

And…

She said nothing.

She smiled sympathetically.

Yes. How unfortunate. Mysterious laundromat moisture. Who can explain these things?

Then she vigorously cleaned every remaining square centimetre of that counter while silently accepting that she had just failed some important test of Canadian citizenship.

To the lovely woman at the Whitehorse laundromat she wants to say: *I am so, so sorry.*

---

### **Yukon Hospitality & Yet Another Idea**

After surviving what will henceforth be known as The Whitehorse Laundromat Incident, we visited an acquaintance in town, a wonderful family physician/ER doctor, and his family.

They welcomed us into their home for a delicious supper, and we spent part of the evening talking and swapping expedition stories.

We also learned about wilderness river trips in the Yukon. Which naturally led us to think: you know what would be fun?

A 10-day wilderness canoe or kayak expedition down a Yukon river with the family.

Because apparently embarking on a 35,000-km overland expedition with a newborn has not provided us with quite enough logistical complexity.

So that idea has now been safely filed under: *Future Adventures That Sound Completely Reasonable After Dinner and the dopamine high of the start of a new adventure.*

---

### **Next Stop: Dawson City**

With full bellies, mostly clean laundry, one slightly guilty mother and one blissfully unaware baby, we climbed back into Mousse and headed north toward Pelly Crossing.

Tomorrow is Barton’s birthday.

And if everything goes according to plan, we will celebrate it in Dawson City, in the heart of the Klondike.

Mousse is finally on the loose.

And somehow, we’re only a few days in.`,
    coverImage: '/hot spring.jpeg',
    gallery: [
      {
        url: '/hot spring.jpeg',
        caption: 'Henri’s very first swim at Liard River Hot Springs in the warm mineral waters surrounded by northern wilderness.',
        type: 'image'
      },
      {
        url: '/departure.jpeg',
        caption: 'Expedition crew rolling through northern BC and into the Yukon Territory.',
        type: 'image'
      },
      {
        url: '/Mousse1.jpeg',
        caption: 'Mousse parked under the dramatic northern skies en route to Whitehorse.',
        type: 'image'
      },
      {
        url: '/Family.jpeg',
        caption: 'Family travel moments with baby Henri exploring the Canadian North.',
        type: 'image'
      },
      {
        url: '/Runner.jpeg',
        caption: 'Trail stops and fresh mountain air along the Alaska Highway corridor.',
        type: 'image'
      }
    ],
    metrics: {
      elevationM: 670,
      tempC: 14,
      kmTraveled: 2150,
      henriAge: '2.5 months',
      mbaModule: 'Operations & Remote Logistics'
    },
    locationInsights: {
      population: '28,201 (Whitehorse, Yukon)',
      interestingFacts: [
        'Named after the White Horse Rapids on the Yukon River, which resembled the mane of a white horse before the dam was constructed.',
        'Home to the iconic S.S. Klondike sternwheeler and the gateway to the Klondike Gold Rush Trail.'
      ],
      culturalContext: 'Located on the traditional territories of the Kwanlin Dün First Nation and Ta\'an Kwäch\'än Council.',
      activityTips: 'Stocking up on fresh supplies, dipping in Liard Hot Springs, and prepping for the Dempster Highway.'
    },
    mbaHighlight: 'Testing real-time crisis management: juggling laundromat blowouts, lost phones, and supply runs while coordinating next leg logistics!',
    henriHighlight: 'Henri’s very first swim at Liard River Hot Springs in pouring rain, and an infamous laundromat milestone in Whitehorse!',
    tags: ['Yukon', 'Whitehorse', 'Liard Hot Springs', 'Family Farm', 'DeBolt', 'Overland Journey', 'Henri First Swim'],
    likesCount: 0,
    commentsCount: 0
  },

  // Entry 1 - Departure
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

From here, our compass points north up the Alaska Highway and Dempster Highway toward the Arctic Ocean at Tuktoyaktuk. Follow along with us on our route map!`,
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
  lat: 62.8286,
  lng: -136.5772,
  altitudeM: 580,
  speedKmh: 0,
  heading: 340,
  timestamp: new Date().toISOString(),
  accuracyM: 5.0,
  batteryPercent: 96,
  isSharing: true,
  statusMessage: 'En route to Pelly Crossing & Dawson City, Yukon! Left Whitehorse after hot springs swim, laundromat adventures, and wonderful dinner with medical colleagues.',
  lastCity: 'Pelly Crossing & Heading to Dawson City, Yukon',
  nextMilestone: 'Dawson City (Barton\'s Birthday!) & Dempster Hwy',
  trackingMode: 'manual_checkin',
  weather: {
    tempC: 14,
    condition: 'Crisp Northern Sky & Boreal Forest',
    icon: 'cloud-sun'
  }
};

export const INITIAL_WAYPOINTS: Waypoint[] = [
  {
    id: 'lethbridge',
    name: 'Lethbridge & Calgary, AB',
    region: 'Truck Pickup & Launch Point',
    country: 'Canada',
    leg: 'arctic_yukon',
    lat: 49.6956,
    lng: -112.8451,
    date: 'August 28, 2026',
    status: 'completed',
    elevationM: 910,
    summary: 'Picked up our custom overland truck in Calgary area, visited family in Red Deer and DeBolt, and embarked on our grand journey up North on August 28th!',
    henriNote: 'Henri testing out his custom truck crib for the very first night.',
    mbaNote: 'Configured Starlink and reviewed our first road-term syllabus.',
    thumbnail: '/departure.jpeg',
    distanceFromStartKm: 0,
    relatedLogId: 'log-departure-mousse'
  },
  {
    id: 'whitehorse',
    name: 'Whitehorse & Pelly Crossing, Yukon',
    region: 'Yukon Territory',
    country: 'Canada',
    leg: 'arctic_yukon',
    lat: 60.7212,
    lng: -135.0568,
    date: 'August 31, 2026',
    status: 'completed',
    elevationM: 670,
    summary: 'Reached Yukon! Soaked in Liard Hot Springs in pouring cold rain (Henri’s first swim!), survived an infamous laundromat blowout, and celebrated with medical friends in Whitehorse before rolling north toward Pelly Crossing and Dawson City for Barton’s birthday.',
    henriNote: 'Henri’s very first swim at Liard Hot Springs and an epic laundromat counter pee incident!',
    mbaNote: 'Live operations management: troubleshooting errands, Starlink logistics, and gear prep on the road.',
    thumbnail: '/hot spring.jpeg',
    distanceFromStartKm: 2150,
    relatedLogId: 'log-2-alberta-to-yukon'
  },
  {
    id: 'dawson_city',
    name: 'Dawson City (Barton\'s Birthday!)',
    region: 'Klondike & Top of the World Hwy',
    country: 'Canada',
    leg: 'arctic_yukon',
    lat: 64.0601,
    lng: -139.4320,
    date: 'September 2, 2026',
    status: 'upcoming',
    elevationM: 320,
    summary: 'Celebrating Barton’s birthday in the historic Klondike gold rush capital before tackling the Dempster Highway to the Arctic Ocean!',
    thumbnail: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80',
    distanceFromStartKm: 2680
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
    id: 'rig-photo-sunset',
    title: 'Mousse at Golden Sunset',
    caption: 'Our custom moss-green Ford F550 expedition rig Mousse glowing under the golden sunset as the 35,000 km Arctic to Antarctica journey begins.',
    url: '/moussesunset.jpeg',
    category: 'exterior',
    uploadedAt: 'August 2026'
  },
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

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'fr';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Top bar & Navbar
    'nav.gpsActive': 'Live GPS Active',
    'nav.gpsPaused': 'GPS Paused',
    'nav.currentlyNear': 'Currently near',
    'nav.reachedLeg': '6,920 km (Tuktoyaktuk Arctic Leg Reached)',
    'nav.sharingOn': 'Sharing: ON',
    'nav.sharingOff': 'Sharing: OFF',
    'nav.satelliteCheckin': 'Satellite Check-In',
    'nav.brandTitle': 'Mousse on the Loose',
    'nav.expeditionBadge': 'Americas Expedition',
    'nav.crewSubtitle': 'Joannie, Barton & Baby Henri',
    'nav.rigSubtitle': 'Rig: Mousse',
    'nav.subscribers': 'Subscribers',
    'nav.security': 'Security',
    'nav.subscribe': 'Subscribe',
    'nav.signIn': 'Sign In',
    'nav.signedInAs': 'Signed in as',
    'nav.home': 'Home',
    'nav.map': 'Interactive Map',
    'nav.journal': 'Expedition Journals',
    'nav.gallery': 'Photo & Video Gallery',
    'nav.rig': 'Mousse (The Rig)',
    'nav.live': 'GPS Tracking',

    // Hero & Home
    'home.heroBadge': 'Live Expedition • 35,000 km Sabbatical',
    'home.heroTitle': 'From the Arctic Ocean to Antarctica',
    'home.heroSubtitle': 'Medicine, MBA Studies & Motherhood on the Pan-American Highway',
    'home.heroNarrative': 'We are Joannie and Barton, a Newfoundland-based blended family, travelling with our newest addition, Henri. In August 2026, we set off in our custom moss-green overland truck, Mousse, on Mousse on the Loose: a year-long, 35,000 km journey from the Arctic to Antarctica, alongside remote Executive MBA studies. The older children will join us for stretches of the adventure between university, work and lives of their own.',
    'home.liveMapBtn': 'Explore Interactive Map',
    'home.readChroniclesBtn': 'Read Expedition Journals',
    'home.seeRigBtn': 'Explore Mousse (The Rig)',
    'home.rigSpecsBadge': 'Custom 4x4 Overland Truck • Built for Extreme Latitudes',

    // Expedition Pillars / Highlights
    'home.pillar1Title': 'Barton & Joannie: Adventures & MBA',
    'home.pillar1Desc': 'Navigating remote mountain passes and wilderness routes while completing Executive MBA coursework via Starlink satellite.',
    'home.pillar2Title': "Henri's Milestones",
    'home.pillar2Desc': 'Watching our newest family addition (born June 2026) grow, smile, and experience nature from his custom truck cot.',
    'home.pillar3Title': 'Visits Along the Way',
    'home.pillar3Desc': 'The older children joining for legs of the trip, reunions with medical colleagues and MBA classmates, and unforgettable encounters across the continents.',

    // Telemetry Box
    'home.telemetryTitle': 'Expedition Telemetry & Route Status',
    'home.totalDistance': 'Total Distance Target',
    'home.distanceLogged': 'Current Distance Logged',
    'home.currentRegion': 'Current Region',
    'home.starlinkStatus': 'Starlink Uplink',
    'home.elevation': 'Elevation',
    'home.speed': 'Current Speed',
    'home.batteryLevel': 'EcoFlow Battery',
    'home.solarInput': 'Solar Generation',
    'home.waterCapacity': 'Fresh Water',

    // Crew Section
    'home.crewTitle': 'Meet the Expedition Crew',
    'home.crewDesc': 'Joannie, Barton, and baby Henri on the road full-time, supported by the older kids cheering from home and joining for legs of the route.',
    'home.crewBioSecond': "Setting out from St. John's, Newfoundland and launching our overland rig Mousse, our blended family is taking on a 35,000 km sabbatical across the Americas. While Joannie, Barton, and baby Henri travel full-time in the truck, the older kids are cheering from home and planning fly-in legs along our route between their studies and careers.",
    'home.olderKidsTitle': 'The Older Children Supporting From Home & Visiting',
    'home.olderKidsDesc': 'The older kids in our blended family cheering us on, tracking our live coordinates, and following little brother Henri.',

    // Rig Section
    'home.rigTitle': 'Meet Mousse: Our 4x4 Expedition Home',
    'home.rigDesc': 'A custom moss-green 4x4 truck engineered for off-grid family survival from -40°C Arctic tundra to high Andean passes.',

    // Journal Section
    'home.recentJournals': 'Latest Expedition Chronicles',
    'home.viewAllJournals': 'View All Journals',
    'home.allCategories': 'All Categories',

    // Footer
    'footer.disclaimer': 'Mousse on the Loose — Pan-American Overland Expedition from the Arctic to Antarctica.',
    'footer.copyright': '© 2026 Joannie & Barton. All rights reserved.',
    'footer.builtWith': 'Built for friends, family, and fellow adventurers around the world.',

    // Generic Buttons & Badges
    'btn.back': 'Back',
    'btn.save': 'Save',
    'btn.cancel': 'Cancel',
    'btn.close': 'Close',
    'btn.comment': 'Comment',
    'btn.submit': 'Submit',
    'btn.explore': 'Explore',
    'btn.viewOnMap': 'View on Map',
    'btn.readMore': 'Read More',
    'btn.share': 'Share',
    'btn.filter': 'Filter',
    'btn.langToggle': 'FR',
    'btn.langLabel': 'Français',

    // Modals
    'modal.subscribeTitle': 'Join Our Sabbatical Journal',
    'modal.subscribeDesc': 'Get occasional journal updates directly from Joannie & Barton.',
    'modal.authTitle': 'Sign In / Choose Persona',
    'modal.authDesc': 'Select your role or enter administrator credentials.',
  },
  fr: {
    // Top bar & Navbar
    'nav.gpsActive': 'GPS en direct actif',
    'nav.gpsPaused': 'GPS en pause',
    'nav.currentlyNear': 'Actuellement près de',
    'nav.reachedLeg': '6 920 km (Étape arctique de Tuktoyaktuk atteinte)',
    'nav.sharingOn': 'Partage : ACTIVÉ',
    'nav.sharingOff': 'Partage : DÉSACTIVÉ',
    'nav.satelliteCheckin': 'Pointage satellite',
    'nav.brandTitle': 'Mousse on the Loose',
    'nav.expeditionBadge': 'Expédition des Amériques',
    'nav.crewSubtitle': 'Joannie, Barton et bébé Henri',
    'nav.rigSubtitle': 'Véhicule : Mousse',
    'nav.subscribers': 'Abonnés',
    'nav.security': 'Sécurité',
    'nav.subscribe': "S'abonner",
    'nav.signIn': 'Se connecter',
    'nav.signedInAs': 'Connecté en tant que',
    'nav.home': 'Accueil',
    'nav.map': 'Carte Interactive',
    'nav.journal': "Journaux d'expédition",
    'nav.gallery': 'Galerie photos et vidéos',
    'nav.rig': 'Mousse (Le camion)',
    'nav.live': 'Suivi GPS',

    // Hero & Home
    'home.heroBadge': 'Expédition en direct • Sabbatique de 35 000 km',
    'home.heroTitle': "De l'océan Arctique à l'Antarctique",
    'home.heroSubtitle': 'Médecine, études MBA et maternité sur la route panaméricaine',
    'home.heroNarrative': "Nous sommes Joannie et Barton, une famille recomposée de Terre-Neuve voyageant avec notre plus récent moussaillon, Henri. En août 2026, nous sommes partis à bord de notre camion tout-terrain vert mousse sur mesure pour Mousse on the Loose : une expédition d'un an et 35 000 km de l'Arctique à l'Antarctique, tout en poursuivant des études d'Executive MBA à distance. Les plus grands enfants se joindront à nous pour certaines étapes de l'aventure entre leurs études universitaires, leur travail et leur vie personnelle.",
    'home.liveMapBtn': 'Explorer la carte interactive',
    'home.readChroniclesBtn': "Lire les journaux d'expédition",
    'home.seeRigBtn': 'Découvrir Mousse (Le camion)',
    'home.rigSpecsBadge': 'Camion 4x4 tout-terrain sur mesure • Conçu pour les latitudes extrêmes',

    // Expedition Pillars / Highlights
    'home.pillar1Title': 'Barton & Joannie : Aventures & MBA',
    'home.pillar1Desc': 'Franchir des cols de montagne isolés et des pistes sauvages tout en complétant des cours d’Executive MBA par satellite Starlink.',
    'home.pillar2Title': "Les étapes marquantes d'Henri",
    'home.pillar2Desc': 'Regarder le tout dernier membre de notre famille (né en juin 2026) grandir, sourire et s’éveiller à la nature depuis son berceau dans le camion.',
    'home.pillar3Title': 'Visites au fil de la route',
    'home.pillar3Desc': 'Les plus grands enfants qui nous rejoignent pour des étapes, des retrouvailles avec des collègues médecins et camarades de MBA, et des rencontres inoubliables.',

    // Telemetry Box
    'home.telemetryTitle': "Télémétrie de l'expédition & État de la route",
    'home.totalDistance': 'Objectif de distance totale',
    'home.distanceLogged': 'Distance actuelle parcourue',
    'home.currentRegion': 'Région actuelle',
    'home.starlinkStatus': 'Connexion Starlink',
    'home.elevation': 'Altitude',
    'home.speed': 'Vitesse actuelle',
    'home.batteryLevel': 'Batterie EcoFlow',
    'home.solarInput': 'Production solaire',
    'home.waterCapacity': 'Eau potable',

    // Crew Section
    'home.crewTitle': "Rencontrez l'équipage de l'expédition",
    'home.crewDesc': "Joannie, Barton et bébé Henri sur la route à temps plein, soutenus par les plus grands enfants qui nous encouragent depuis la maison et nous rejoignent pour certaines étapes.",
    'home.crewBioSecond': "Partis de St. John's, Terre-Neuve, et lançant notre camion tout-terrain Mousse, notre famille recomposée entreprend une année sabbatique de 35 000 km à travers les Amériques. Alors que Joannie, Barton et bébé Henri voyagent à temps plein dans le camion, les plus grands nous encouragent depuis la maison et planifient des séjours pour nous rejoindre entre leurs études et leurs carrières.",
    'home.olderKidsTitle': 'Les plus grands enfants qui nous soutiennent et nous visitent',
    'home.olderKidsDesc': 'Les plus grands enfants de notre famille recomposée qui nous encouragent, suivent nos coordonnées GPS en direct et regardent grandir leur petit frère Henri.',

    // Rig Section
    'home.rigTitle': 'Voici Mousse : Notre maison d’expédition 4x4',
    'home.rigDesc': "Un camion 4x4 vert mousse sur mesure conçu pour l'autonomie familiale complète, de la toundra arctique à -40°C aux hauts cols des Andes.",

    // Journal Section
    'home.recentJournals': "Dernières chroniques d'expédition",
    'home.viewAllJournals': 'Voir tous les journaux',
    'home.allCategories': 'Toutes les catégories',

    // Footer
    'footer.disclaimer': "Mousse on the Loose — Expédition tout-terrain panaméricaine de l'Arctique à l'Antarctique.",
    'footer.copyright': '© 2026 Joannie & Barton. Tous droits réservés.',
    'footer.builtWith': 'Créé pour nos proches, nos familles et les passionnés de voyage à travers le monde.',

    // Generic Buttons & Badges
    'btn.back': 'Retour',
    'btn.save': 'Enregistrer',
    'btn.cancel': 'Annuler',
    'btn.close': 'Fermer',
    'btn.comment': 'Commenter',
    'btn.submit': 'Soumettre',
    'btn.explore': 'Explorer',
    'btn.viewOnMap': 'Voir sur la carte',
    'btn.readMore': 'Lire la suite',
    'btn.share': 'Partager',
    'btn.filter': 'Filtrer',
    'btn.langToggle': 'EN',
    'btn.langLabel': 'English',

    // Modals
    'modal.subscribeTitle': 'Rejoignez notre carnet de bord',
    'modal.subscribeDesc': 'Recevez les récits de voyage directement de Joannie & Barton.',
    'modal.authTitle': 'Connexion / Choisir un profil',
    'modal.authDesc': 'Sélectionnez votre profil ou entrez les identifiants administrateur.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('mousse_language');
      return (saved === 'fr' || saved === 'en') ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('mousse_language', lang);
    } catch (e) {
      console.warn('Could not save language preference', e);
    }
  };

  const t = (key: string, fallback?: string): string => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key: string, fallback?: string) => fallback || key
    };
  }
  return context;
};

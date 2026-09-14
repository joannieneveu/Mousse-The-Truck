import React, { useEffect, useRef, useState } from 'react';
import { 
  Waypoint, 
  LiveLocation, 
  JourneyLeg, 
  GoogleMapLayerType 
} from '../types';
import { 
  Compass, 
  MapPin, 
  Layers, 
  Maximize2, 
  Navigation, 
  Baby, 
  Stethoscope, 
  GraduationCap, 
  Users, 
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  Mountain,
  Activity,
  Radio,
  ToggleLeft,
  ToggleRight,
  Satellite,
  Map as MapIcon,
  Play,
  Share2,
  Wifi,
  Heart,
  ChevronRight,
  SlidersHorizontal,
  Info,
  Calendar,
  Plane
} from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import L from 'leaflet';

interface InteractiveMapProps {
  waypoints: Waypoint[];
  liveLocation: LiveLocation;
  isAdmin?: boolean;
  onSelectWaypoint: (waypoint: Waypoint) => void;
  onOpenPinModal?: () => void;
  onOpenNewLog: (coordinates?: { lat: number; lng: number }, locationName?: string) => void;
  onSimulateLeg?: (leg: string) => void;
  onOpenLog?: (logId: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  waypoints,
  liveLocation,
  isAdmin = false,
  onSelectWaypoint,
  onOpenPinModal,
  onOpenNewLog,
  onSimulateLeg,
  onOpenLog,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Google Maps instances
  const googleMapRef = useRef<any>(null);
  const googleMarkersRef = useRef<any[]>([]);
  const googlePolylineRef = useRef<any>(null);
  const googleFlightPolylineRef = useRef<any>(null);

  // Leaflet instances (active default or fallback)
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletTileLayerRef = useRef<L.TileLayer | null>(null);
  const leafletMarkersGroupRef = useRef<L.LayerGroup | null>(null);
  const leafletPolylineGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('leaflet');
  const [currentLayer, setCurrentLayer] = useState<GoogleMapLayerType>('google_hybrid');
  const [selectedLeg, setSelectedLeg] = useState<JourneyLeg>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const [showElevationDrawer, setShowElevationDrawer] = useState<boolean>(false);
  const [showSimulateDrawer, setShowSimulateDrawer] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Google Maps Tile URLs & Providers
  const TILE_URLS: Record<GoogleMapLayerType, { url: string; attribution: string; subdomains?: string }> = {
    google_roadmap: {
      url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps'
    },
    google_satellite: {
      url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps Imagery'
    },
    google_hybrid: {
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps Hybrid'
    },
    google_terrain: {
      url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps Topography'
    },
    carto_voyager: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CARTO &copy; OpenStreetMap'
    },
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap'
    }
  };

  // Filter waypoints based on leg, category, and search query
  const filteredWaypoints = waypoints.filter(wp => {
    const legVal = wp.journeyLeg || wp.leg || 'arctic_dempster';
    const matchLeg = selectedLeg === 'all' || legVal === selectedLeg;
    const matchCategory = selectedCategory === 'all' || (wp.category && wp.category === selectedCategory);
    const matchSearch = searchQuery === '' 
      || wp.name.toLowerCase().includes(searchQuery.toLowerCase())
      || (wp.country && wp.country.toLowerCase().includes(searchQuery.toLowerCase()))
      || ((wp.description || wp.summary || '').toLowerCase().includes(searchQuery.toLowerCase()));
    return matchLeg && matchCategory && matchSearch;
  });

  // Great-circle arc generator for true flight routing
  const getGreatCircleArc = (p1: [number, number], p2: [number, number], numPoints = 25): [number, number][] => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const toDeg = (r: number) => (r * 180) / Math.PI;
    const lat1 = toRad(p1[0]), lon1 = toRad(p1[1]);
    const lat2 = toRad(p2[0]), lon2 = toRad(p2[1]);
    const d = Math.acos(
      Math.min(1, Math.max(-1, Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)))
    );
    if (d < 1e-6) return [p1, p2];
    const sinD = Math.sin(d);
    const points: [number, number][] = [];
    for (let i = 0; i <= numPoints; i++) {
      const f = i / numPoints;
      const A = Math.sin((1 - f) * d) / sinD;
      const B = Math.sin(f * d) / sinD;
      const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
      const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
      const z = A * Math.sin(lat1) + B * Math.sin(lat2);
      const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
      const lon = toDeg(Math.atan2(y, x));
      points.push([lat, lon]);
    }
    return points;
  };

  // Calculate expedition stats
  // Waypoints store cumulative distanceFromStartKm. Returned south to Whitehorse from Tuktoyaktuk at 5,500 km.
  const completedWaypoints = waypoints.filter(w => w.status === 'completed');
  const maxCompletedKm = completedWaypoints.reduce((max, w) => Math.max(max, w.distanceFromStartKm || 0), 0);
  const totalCompletedKm = Math.max(maxCompletedKm, 5500);
  
  const totalPlannedKm = 35000;
  const progressPercent = Math.min(100, Math.round((totalCompletedKm / totalPlannedKm) * 100));

  // Initialize Map Engine (Leaflet / Google Maps)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if a Google Maps API Key is provided
    const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;

    if (apiKey && apiKey !== 'MY_GOOGLE_MAPS_API_KEY' && apiKey.length > 10) {
      // Load Google Maps JS SDK with Advanced Markers
      const loader = new Loader({
        apiKey,
        version: 'weekly',
      });

      (loader as any).importLibrary('maps').then(async (mapsLib: any) => {
        if (!mapContainerRef.current) return;
        const markerLib: any = await (loader as any).importLibrary('marker');
        const MapClass = mapsLib.Map;
        const AdvancedMarkerElement = markerLib.AdvancedMarkerElement;
        const PinElement = markerLib.PinElement;

        const map = new MapClass(mapContainerRef.current, {
          center: { lat: liveLocation.lat, lng: liveLocation.lng },
          zoom: 4,
          mapId: 'DEMO_MAP_ID', // Required for AdvancedMarkerElement
          mapTypeId: currentLayer === 'google_satellite' 
            ? 'satellite' 
            : currentLayer === 'google_terrain' 
            ? 'terrain' 
            : currentLayer === 'google_hybrid'
            ? 'hybrid'
            : 'roadmap',
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          fullscreenControl: false,
        });

        googleMapRef.current = map;
        setMapEngine('google');
        renderGoogleMarkers(map, AdvancedMarkerElement, PinElement);
      }).catch(err => {
        console.warn('Google Maps JS API load fallback to Leaflet:', err);
        initLeafletMap();
      });
    } else {
      initLeafletMap();
    }

    function initLeafletMap() {
      if (!mapContainerRef.current || leafletMapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [liveLocation.lat, liveLocation.lng],
        zoom: 4,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add Tile Layer
      const tileConfig = TILE_URLS[currentLayer];
      const tileLayer = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        subdomains: tileConfig.subdomains || 'abc',
        maxZoom: 18,
      }).addTo(map);

      leafletTileLayerRef.current = tileLayer;
      leafletMapRef.current = map;

      const markersGroup = L.layerGroup().addTo(map);
      const polylineGroup = L.layerGroup().addTo(map);

      leafletMarkersGroupRef.current = markersGroup;
      leafletPolylineGroupRef.current = polylineGroup;

      setMapEngine('leaflet');
      renderLeafletMarkers();
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update Leaflet Tile Layer when currentLayer changes
  useEffect(() => {
    if (mapEngine === 'leaflet' && leafletMapRef.current && leafletTileLayerRef.current) {
      leafletMapRef.current.removeLayer(leafletTileLayerRef.current);
      const tileConfig = TILE_URLS[currentLayer];
      const newLayer = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        subdomains: tileConfig.subdomains || 'abc',
        maxZoom: 18,
      }).addTo(leafletMapRef.current);
      leafletTileLayerRef.current = newLayer;
    } else if (mapEngine === 'google' && googleMapRef.current) {
      if (currentLayer === 'google_satellite') googleMapRef.current.setMapTypeId('satellite');
      else if (currentLayer === 'google_terrain') googleMapRef.current.setMapTypeId('terrain');
      else if (currentLayer === 'google_hybrid') googleMapRef.current.setMapTypeId('hybrid');
      else googleMapRef.current.setMapTypeId('roadmap');
    }
  }, [currentLayer, mapEngine]);

  // Re-render markers when filter changes
  useEffect(() => {
    if (mapEngine === 'leaflet') {
      renderLeafletMarkers();
    }
  }, [filteredWaypoints, liveLocation, selectedWaypoint, mapEngine]);

  // Render Google Markers
  const renderGoogleMarkers = (map: any, AdvancedMarkerElement: any, PinElement: any) => {
    // Clear existing
    googleMarkersRef.current.forEach(m => m.setMap?.(null));
    googleMarkersRef.current = [];

    // Filter overland waypoints so overland highway route does not cross the Atlantic ocean
    const overlandWaypoints = waypoints.filter(
      w => w.category !== 'flight_detour' && w.id !== 'vancouver_flight' && w.id !== 'london_flight'
    );
    const pathCoordinates = overlandWaypoints.map(w => ({ lat: w.lat, lng: w.lng }));

    // Overland Polyline
    if (googlePolylineRef.current) googlePolylineRef.current.setMap(null);
    if ((window as any).google?.maps?.Polyline) {
      googlePolylineRef.current = new (window as any).google.maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: '#F59E0B',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map,
      });
    }

    // Flight Polyline: Whitehorse -> Vancouver -> London (pointed line with different vibrant fuchsia/rose color)
    if (googleFlightPolylineRef.current) googleFlightPolylineRef.current.setMap(null);
    if ((window as any).google?.maps?.Polyline) {
      const lineSymbol = {
        path: (window as any).google?.maps?.SymbolPath?.CIRCLE || 'M 0,-1 0,1',
        fillOpacity: 1,
        strokeOpacity: 1,
        scale: 3.5,
        fillColor: '#D946EF',
        strokeColor: '#D946EF',
        strokeWeight: 1,
      };

      googleFlightPolylineRef.current = new (window as any).google.maps.Polyline({
        path: [
          { lat: 60.7212, lng: -135.0568 },
          { lat: 49.2827, lng: -123.1207 },
          { lat: 51.5074, lng: -0.1278 }
        ],
        geodesic: true,
        strokeOpacity: 0,
        icons: [{
          icon: lineSymbol,
          offset: '0',
          repeat: '14px',
        }],
        map,
      });
    }

    // Waypoints
    filteredWaypoints.forEach(wp => {
      const isFlight = wp.category === 'flight_detour' || wp.id === 'vancouver_flight' || wp.id === 'london_flight';
      const pin = new PinElement({
        background: isFlight ? '#C026D3' : wp.status === 'completed' ? '#10B981' : wp.status === 'in_progress' ? '#F59E0B' : '#06B6D4',
        borderColor: '#0F172A',
        glyphColor: '#FFFFFF',
        glyph: isFlight ? '✈️' : undefined,
        scale: selectedWaypoint?.id === wp.id ? 1.3 : isFlight ? 1.15 : 1.0,
      });

      const marker = new AdvancedMarkerElement({
        map,
        position: { lat: wp.lat, lng: wp.lng },
        title: wp.name,
        content: pin.element,
      });

      marker.addListener('click', () => {
        setSelectedWaypoint(wp);
        onSelectWaypoint(wp);
      });

      googleMarkersRef.current.push(marker);
    });

    // Expedition Location Pin Marker
    const locationPin = document.createElement('div');
    locationPin.innerHTML = `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white font-extrabold text-xs shadow-2xl border-2 border-emerald-400">
          <span>🚐</span>
          <span class="truncate max-w-[120px]">Mousse: ${liveLocation.lastCity}</span>
        </div>
      </div>
    `;
    const liveMarker = new AdvancedMarkerElement({
      map,
      position: { lat: liveLocation.lat, lng: liveLocation.lng },
      title: `Current Location: ${liveLocation.lastCity}`,
      content: locationPin,
    });
    liveMarker.addListener('click', () => {
      if (isAdmin && onOpenPinModal) {
        onOpenPinModal();
      } else {
        handleCenterLiveLocation();
      }
    });
    googleMarkersRef.current.push(liveMarker);
  };

  // Render Leaflet Markers
  const renderLeafletMarkers = () => {
    if (!leafletMapRef.current || !leafletMarkersGroupRef.current || !leafletPolylineGroupRef.current) return;

    leafletMarkersGroupRef.current.clearLayers();
    leafletPolylineGroupRef.current.clearLayers();

    // 1. Overland Route (exclude flight detour pins so Pan-American highway doesn't cross the ocean)
    const overlandWaypoints = waypoints.filter(
      w => w.category !== 'flight_detour' && w.id !== 'vancouver_flight' && w.id !== 'london_flight'
    );
    const allCoords: [number, number][] = overlandWaypoints.map(w => [w.lat, w.lng]);
    const completedCoords: [number, number][] = overlandWaypoints
      .filter(w => w.status === 'completed')
      .map(w => [w.lat, w.lng]);

    // Planned Route (dashed cyan/amber)
    if (allCoords.length > 1) {
      L.polyline(allCoords, {
        color: '#38BDF8',
        weight: 3,
        opacity: 0.6,
        dashArray: '6, 8',
      }).addTo(leafletPolylineGroupRef.current);
    }

    // Completed Route (solid vibrant amber)
    if (completedCoords.length > 1) {
      L.polyline(completedCoords, {
        color: '#F59E0B',
        weight: 4,
        opacity: 0.9,
      }).addTo(leafletPolylineGroupRef.current);
    }

    // 2. Flight Path: Whitehorse -> Vancouver -> London
    // Computed with great-circle arcs for realistic transatlantic flight curvature
    const whitehorseCoord: [number, number] = [60.7212, -135.0568];
    const vancouverCoord: [number, number] = [49.2827, -123.1207];
    const londonCoord: [number, number] = [51.5074, -0.1278];

    const flightArcYxyToYvr = getGreatCircleArc(whitehorseCoord, vancouverCoord, 12);
    const flightArcYvrToLhr = getGreatCircleArc(vancouverCoord, londonCoord, 36);
    const fullFlightCoords = [...flightArcYxyToYvr, ...flightArcYvrToLhr.slice(1)];

    // Underlay subtle glow for flight path
    L.polyline(fullFlightCoords, {
      color: '#F472B6',
      weight: 8,
      opacity: 0.25,
      lineCap: 'round',
    }).addTo(leafletPolylineGroupRef.current);

    // Flight polyline: pointed line (distinct circular dots/points) with different fuchsia color
    const flightPolyline = L.polyline(fullFlightCoords, {
      color: '#D946EF', // Vibrant fuchsia/rose
      weight: 4.5,
      opacity: 1,
      dashArray: '1, 13', // True pointed/dotted line: 1px segment + round cap creates circular points
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(leafletPolylineGroupRef.current);

    flightPolyline.bindTooltip('✈️ Sabbatical Flight: Whitehorse ➔ Vancouver ➔ London', {
      sticky: true,
      className: 'bg-slate-900 text-fuchsia-300 text-xs font-bold px-2.5 py-1 rounded-xl border border-fuchsia-500/50 shadow-xl'
    });

    // Transatlantic flight midway badge marker
    if (flightArcYvrToLhr.length > 15) {
      const midPoint = flightArcYvrToLhr[Math.floor(flightArcYvrToLhr.length / 2)];
      const flightBadgeIcon = L.divIcon({
        className: 'custom-flight-badge',
        html: `
          <div class="cursor-pointer group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/90 border border-fuchsia-400 text-fuchsia-300 font-extrabold text-[10px] shadow-2xl backdrop-blur-md hover:scale-110 transition -translate-x-1/2 -translate-y-1/2">
            <span>✈️</span>
            <span>YVR ➔ LHR Flight Detour</span>
          </div>
        `,
        iconSize: [160, 24],
        iconAnchor: [80, 12],
      });
      const flightBadge = L.marker(midPoint, { icon: flightBadgeIcon, zIndexOffset: 750 })
        .addTo(leafletMarkersGroupRef.current);
      flightBadge.on('click', () => {
        const ldn = waypoints.find(w => w.id === 'london_flight') || waypoints.find(w => w.id === 'vancouver_flight');
        if (ldn) {
          setSelectedWaypoint(ldn);
          onSelectWaypoint(ldn);
        }
      });
    }

    // Add Current Expedition Location Pin
    const pinIcon = L.divIcon({
      className: 'custom-location-pin-marker',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white font-extrabold text-xs shadow-2xl border-2 border-emerald-400 hover:scale-105 transition">
            <span>🚐</span>
            <span class="truncate max-w-[120px]">Mousse: ${liveLocation.lastCity}</span>
          </div>
        </div>
      `,
      iconSize: [140, 32],
      iconAnchor: [70, 16],
    });

    const pinMarker = L.marker([liveLocation.lat, liveLocation.lng], { icon: pinIcon, zIndexOffset: 1000 })
      .addTo(leafletMarkersGroupRef.current);

    pinMarker.on('click', () => {
      if (isAdmin && onOpenPinModal) {
        onOpenPinModal();
      } else {
        handleCenterLiveLocation();
      }
    });

    // Render Waypoint Markers
    filteredWaypoints.forEach((wp) => {
      const isSelected = selectedWaypoint?.id === wp.id;
      const isFlight = wp.category === 'flight_detour' || wp.id === 'vancouver_flight' || wp.id === 'london_flight';
      
      const getCategoryEmoji = (cat?: string) => {
        if (isFlight) return '✈️';
        switch (cat) {
          case 'flight_detour': return '✈️';
          case 'arctic_apex': return '❄️';
          case 'baby_milestone': return '👶';
          case 'physician_resource': return '🩺';
          case 'mba_study_spot': return '🎓';
          case 'family_reunion': return '👨‍👩‍👧‍👦';
          default: return '📍';
        }
      };

      const getStatusColor = (status: string) => {
        if (isFlight) return 'bg-fuchsia-600 text-white border-fuchsia-300 ring-2 ring-fuchsia-400/50';
        switch (status) {
          case 'completed': return 'bg-emerald-500 text-slate-950 border-emerald-300';
          case 'in_progress': return 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/50';
          default: return 'bg-slate-800 text-slate-200 border-slate-600';
        }
      };

      const customIcon = L.divIcon({
        className: 'custom-waypoint-marker',
        html: `
          <div class="group relative cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
            <div class="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-xl border-2 ${getStatusColor(wp.status)}">
              <span>${getCategoryEmoji(wp.category)}</span>
              <span class="max-w-[120px] truncate ${isFlight ? 'inline' : 'hidden sm:inline'}">${wp.name}</span>
            </div>
            ${wp.status === 'in_progress' || isFlight ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-fuchsia-400 rounded-full animate-ping"></span>' : ''}
          </div>
        `,
        iconSize: [120, 26],
        iconAnchor: [60, 13],
      });

      const marker = L.marker([wp.lat, wp.lng], { icon: customIcon })
        .addTo(leafletMarkersGroupRef.current!);

      marker.on('click', () => {
        setSelectedWaypoint(wp);
        onSelectWaypoint(wp);
        leafletMapRef.current?.flyTo([wp.lat, wp.lng], 7, { duration: 1.2 });
      });
    });
  };

  // Fly to Waypoint
  const handleFlyTo = (wp: Waypoint) => {
    setSelectedWaypoint(wp);
    onSelectWaypoint(wp);
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([wp.lat, wp.lng], 8, { duration: 1.2 });
    } else if (googleMapRef.current) {
      googleMapRef.current.panTo({ lat: wp.lat, lng: wp.lng });
      googleMapRef.current.setZoom(8);
    }
  };

  // View entire flight route (Whitehorse ➔ Vancouver ➔ London)
  const handleViewFlightRoute = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyToBounds([[45, -138], [63, 2]], { duration: 1.5, padding: [40, 40] });
    } else if (googleMapRef.current) {
      const bounds = new (window as any).google.maps.LatLngBounds(
        { lat: 45, lng: -138 },
        { lat: 63, lng: 2 }
      );
      googleMapRef.current.fitBounds(bounds);
    }
    const londonWp = waypoints.find(w => w.id === 'london_flight');
    if (londonWp) {
      setSelectedWaypoint(londonWp);
      onSelectWaypoint(londonWp);
    }
  };

  // Center on Live Location
  const handleCenterLiveLocation = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([liveLocation.lat, liveLocation.lng], 7, { duration: 1 });
    } else if (googleMapRef.current) {
      googleMapRef.current.panTo({ lat: liveLocation.lat, lng: liveLocation.lng });
      googleMapRef.current.setZoom(7);
    }
  };

  const isSharing = liveLocation.isSharingLocation ?? liveLocation.isSharing ?? true;

  return (
    <div id="interactive-map-root" className="relative w-full h-[calc(100vh-4.5rem)] min-h-[600px] bg-slate-950 overflow-hidden flex flex-col">
      
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: Search & Filter Capsule */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl pointer-events-auto max-w-xl flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 35,000 km route, hospitals, campsites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Leg Selector */}
          <select
            value={selectedLeg}
            onChange={(e) => setSelectedLeg(e.target.value as JourneyLeg)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">🗺️ All Segments (35,000 km)</option>
            <option value="arctic_dempster">❄️ Arctic & Dempster</option>
            <option value="rockies_pacific">🌲 Rockies & Pacific NW</option>
            <option value="baja_mexico">🌵 Baja & Mexico</option>
            <option value="central_america">🌋 Central America</option>
            <option value="andes_patagonia">🏔️ Andes & Patagonia</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-400 hidden sm:block"
          >
            <option value="all">🏷️ All Tags</option>
            <option value="flight_detour">✈️ European Flight Detour</option>
            <option value="overland_camp">🏕️ Campsites</option>
            <option value="baby_milestone">👶 Baby Henri</option>
            <option value="physician_resource">🩺 Medical Resources</option>
            <option value="mba_study_spot">🎓 MBA Study Hubs</option>
            <option value="family_reunion">👨‍👩‍👧‍👦 Family Reunions</option>
          </select>
        </div>

        {/* Right: Expedition Location Pin Pill & Flight Detour Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          
          {/* Quick View Flight Path Button */}
          <button
            onClick={handleViewFlightRoute}
            className="bg-fuchsia-950/80 hover:bg-fuchsia-900 border border-fuchsia-600/70 text-fuchsia-200 font-bold px-3 py-2 rounded-2xl shadow-xl flex items-center gap-1.5 text-xs transition active:scale-95"
            title="View Whitehorse ➔ Vancouver ➔ London transatlantic flight detour"
          >
            <Plane className="w-3.5 h-3.5 text-fuchsia-400" />
            <span className="hidden sm:inline">Flight to London</span>
          </button>

          {/* Current Location Pin Button */}
          <button
            id="current-location-pin-btn"
            onClick={handleCenterLiveLocation}
            className="bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs transition"
            title="Center map on current pinned location"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-slate-400">Current Pin</div>
              <div className="font-extrabold text-white truncate max-w-[130px]">{liveLocation.lastCity}</div>
            </div>
          </button>

          {/* Admin: Update Pin Button */}
          {isAdmin && onOpenPinModal && (
            <button
              onClick={onOpenPinModal}
              title="Pin where Mousse is currently located"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-2xl shadow-xl transition flex items-center gap-1.5 text-xs active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Update Pin</span>
            </button>
          )}

          {/* Map Layer Selector Button */}
          <div className="relative group">
            <button
              className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-2.5 rounded-2xl shadow-xl text-slate-200 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Layers</span>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl space-y-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Google Map Styles
              </div>
              <button
                onClick={() => setCurrentLayer('google_hybrid')}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between ${
                  currentLayer === 'google_hybrid' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>🌍 Google Hybrid</span>
                {currentLayer === 'google_hybrid' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setCurrentLayer('google_terrain')}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between ${
                  currentLayer === 'google_terrain' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>🏔️ Google Topo / Terrain</span>
                {currentLayer === 'google_terrain' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setCurrentLayer('google_roadmap')}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between ${
                  currentLayer === 'google_roadmap' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>🛣️ Google Roadmap</span>
                {currentLayer === 'google_roadmap' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setCurrentLayer('google_satellite')}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between ${
                  currentLayer === 'google_satellite' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>🛰️ Google High-Res Satellite</span>
                {currentLayer === 'google_satellite' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Map Container */}
      <div 
        ref={mapContainerRef} 
        id="google-maps-interactive-canvas" 
        className="w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Floating Stats & Waypoint Drawer */}
      <div className="absolute bottom-4 left-4 right-4 z-[400] flex flex-col md:flex-row items-end md:items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: Pan-American Expedition Progress Capsule */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-2xl shadow-2xl pointer-events-auto max-w-sm sm:max-w-md w-full text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-white flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              Tuktoyaktuk ➔ Ushuaia
            </span>
            <span className="font-bold text-amber-400">
              {totalCompletedKm.toLocaleString()} / {totalPlannedKm.toLocaleString()} km ({progressPercent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span>Status: <strong className="text-slate-200">{liveLocation.lastCity || 'Arctic Ocean Reached • Tuktoyaktuk'}</strong></span>
            <button
              onClick={() => setShowElevationDrawer(!showElevationDrawer)}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>{showElevationDrawer ? 'Hide Elevation Profile' : 'View Andean Elevation'}</span>
            </button>
          </div>

          {/* Route Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-amber-500 rounded-full inline-block"></span>
              <span>Overland Rig (5,500 km)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 border-b-2 border-dotted border-fuchsia-400 inline-block"></span>
              <span>Pointed Flight (YXY ➔ YVR ➔ LHR)</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons (Admin only) */}
        {isAdmin && (
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => onOpenNewLog(selectedWaypoint ? { lat: selectedWaypoint.lat, lng: selectedWaypoint.lng } : undefined, selectedWaypoint?.name)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-2xl text-xs shadow-xl flex items-center gap-1.5 transition transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Drop Field Dispatch Here</span>
            </button>
          </div>
        )}

      </div>

      {/* Selected Waypoint Modal / Drawer */}
      {selectedWaypoint && (
        <div className="absolute top-20 right-4 z-[450] max-w-sm sm:max-w-md w-full bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-3xl p-5 shadow-2xl text-slate-200 space-y-4 animate-in slide-in-from-right duration-200">
          
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                <span>📍 {selectedWaypoint.country}</span>
                <span>•</span>
                <span className={selectedWaypoint.status === 'completed' ? 'text-emerald-400' : 'text-cyan-400'}>
                  {selectedWaypoint.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white mt-0.5">
                {selectedWaypoint.name}
              </h3>
            </div>

            <button
              onClick={() => setSelectedWaypoint(null)}
              className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>

          {/* Waypoint thumbnail if available */}
          {(selectedWaypoint.coverImage || selectedWaypoint.thumbnail) && (
            <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-slate-950">
              <img
                src={selectedWaypoint.coverImage || selectedWaypoint.thumbnail}
                alt={selectedWaypoint.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 text-white backdrop-blur-sm">
                Elev: {selectedWaypoint.elevationM || 100}m
              </div>
            </div>
          )}

          {/* Sabbatical flight detour banner if selected waypoint is a flight waypoint */}
          {(selectedWaypoint.category === 'flight_detour' || selectedWaypoint.id === 'vancouver_flight' || selectedWaypoint.id === 'london_flight') && (
            <div className="bg-fuchsia-950/40 border border-fuchsia-700/60 rounded-2xl p-3 text-fuchsia-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-fuchsia-300">
                <Plane className="w-4 h-4 text-fuchsia-400" />
                <span>European Sabbatical Detour</span>
              </div>
              <p className="text-[11px] text-fuchsia-200/90 leading-snug">
                Flight detour: Whitehorse ➔ Vancouver (YVR) ➔ London (UK). A temporary European break during the sabbatical before resuming the Pan-American highway!
              </p>
            </div>
          )}

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {selectedWaypoint.description || selectedWaypoint.summary}
          </p>

          {/* Highlights & Clinical / Baby Notes */}
          <div className="space-y-1.5 text-[11px]">
            {(selectedWaypoint.henriNote || selectedWaypoint.babyHenriNote) && (
              <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-2 text-amber-200 flex items-center gap-1.5">
                <Baby className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{selectedWaypoint.henriNote || selectedWaypoint.babyHenriNote}</span>
              </div>
            )}
            {(selectedWaypoint.medicalTip || selectedWaypoint.medicalReflection) && (
              <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-2 text-emerald-200 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{selectedWaypoint.medicalTip || selectedWaypoint.medicalReflection}</span>
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFlyTo(selectedWaypoint)}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Center</span>
              </button>

              {selectedWaypoint.relatedLogId && onOpenLog && (
                <button
                  onClick={() => onOpenLog(selectedWaypoint.relatedLogId!)}
                  className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 text-xs"
                >
                  <span>📖 Read Log</span>
                </button>
              )}
            </div>

            {isAdmin && (
              <button
                onClick={() => onOpenNewLog({ lat: selectedWaypoint.lat, lng: selectedWaypoint.lng }, selectedWaypoint.name)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-xl transition"
              >
                Write Dispatch
              </button>
            )}
          </div>

        </div>
      )}

      {/* Elevation Profile Drawer */}
      {showElevationDrawer && (
        <div className="absolute bottom-20 left-4 right-4 z-[450] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-3xl p-5 shadow-2xl text-slate-200 space-y-3 max-w-4xl mx-auto animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Mountain className="w-4 h-4 text-cyan-400" />
              <h4 className="font-extrabold text-sm text-white">
                Pan-American Elevation & Topography Profile (0m ➔ 4,818m)
              </h4>
            </div>
            <button
              onClick={() => setShowElevationDrawer(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[11px]">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="text-slate-400">Arctic (Tuktoyaktuk)</div>
              <div className="font-bold text-cyan-400">5 m</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="text-slate-400">Canadian Rockies</div>
              <div className="font-bold text-amber-400">1,627 m</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="text-slate-400">Colorado Passes</div>
              <div className="font-bold text-emerald-400">3,450 m</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="text-slate-400">Central America</div>
              <div className="font-bold text-amber-400">1,200 m</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="text-slate-400">Andean Altiplano</div>
              <div className="font-bold text-rose-400">4,818 m</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="text-slate-400">Ushuaia Apex</div>
              <div className="font-bold text-cyan-400">6 m</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

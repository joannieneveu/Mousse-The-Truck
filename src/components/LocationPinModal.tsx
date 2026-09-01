import React, { useState } from 'react';
import { LiveLocation } from '../types';
import { 
  MapPin, 
  Sparkles, 
  Navigation, 
  Check, 
  AlertCircle,
  Truck,
  Compass,
  RefreshCw,
  Send
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LocationPinModalProps {
  currentLocation: LiveLocation;
  onUpdateLocation: (newLocation: Partial<LiveLocation>) => Promise<void>;
  onClose: () => void;
}

interface LocationPreset {
  name: string;
  country: string;
  lat: number;
  lng: number;
  leg: string;
}

const ROUTE_PRESETS: LocationPreset[] = [
  { name: 'Lethbridge, Alberta', country: 'Canada', lat: 49.6956, lng: -112.8451, leg: 'arctic_yukon' },
  { name: 'Banff National Park, AB', country: 'Canada', lat: 51.1784, lng: -115.5708, leg: 'arctic_yukon' },
  { name: 'Jasper National Park, AB', country: 'Canada', lat: 52.8737, lng: -118.0814, leg: 'arctic_yukon' },
  { name: 'Dawson Creek, BC (Mile 0)', country: 'Canada', lat: 55.7596, lng: -120.2377, leg: 'arctic_yukon' },
  { name: 'Liard River Hot Springs, BC', country: 'Canada', lat: 59.4260, lng: -126.1000, leg: 'arctic_yukon' },
  { name: 'Whitehorse, Yukon', country: 'Canada', lat: 60.7212, lng: -135.0568, leg: 'arctic_yukon' },
  { name: 'Dawson City, Yukon', country: 'Canada', lat: 64.0601, lng: -139.4320, leg: 'arctic_yukon' },
  { name: 'Arctic Circle (Dempster Hwy)', country: 'Canada', lat: 66.5650, lng: -136.3000, leg: 'arctic_yukon' },
  { name: 'Inuvik, NWT', country: 'Canada', lat: 68.3607, lng: -133.7230, leg: 'arctic_yukon' },
  { name: 'Tuktoyaktuk (Arctic Ocean), NWT', country: 'Canada', lat: 69.4454, lng: -133.0342, leg: 'arctic_yukon' },
  { name: 'Whistler & Sea-to-Sky, BC', country: 'Canada', lat: 50.1163, lng: -122.9574, leg: 'pacific_nw' },
  { name: 'Baja California Sur, Mexico', country: 'Mexico', lat: 27.2833, lng: -112.8667, leg: 'mexico_baja' },
  { name: 'Antigua, Guatemala', country: 'Guatemala', lat: 14.5586, lng: -90.7295, leg: 'central_america' },
  { name: 'Medellín, Colombia', country: 'Colombia', lat: 6.2442, lng: -75.5812, leg: 'andes_colombia' },
  { name: 'Cusco & Sacred Valley, Peru', country: 'Peru', lat: -13.5319, lng: -71.9675, leg: 'andes_colombia' },
  { name: 'Salar de Uyuni, Bolivia', country: 'Bolivia', lat: -20.1338, lng: -67.4891, leg: 'patagonia' },
  { name: 'Ushuaia, Tierra del Fuego', country: 'Argentina', lat: -54.8019, lng: -68.3030, leg: 'patagonia' },
];

export const LocationPinModal: React.FC<LocationPinModalProps> = ({
  currentLocation,
  onUpdateLocation,
  onClose
}) => {
  const { language } = useLanguage();
  const isFr = language === 'fr';

  const [cityName, setCityName] = useState<string>(currentLocation.lastCity || 'Lethbridge, Alberta');
  const [latitude, setLatitude] = useState<number>(currentLocation.lat || 49.6956);
  const [longitude, setLongitude] = useState<number>(currentLocation.lng || -112.8451);
  const [statusNote, setStatusNote] = useState<string>(currentLocation.statusMessage || '');
  const [nextStop, setNextStop] = useState<string>(currentLocation.nextMilestone || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  const handleSelectPreset = (preset: LocationPreset) => {
    setCityName(preset.name);
    setLatitude(preset.lat);
    setLongitude(preset.lng);
  };

  const handleDetectDeviceLocation = () => {
    if (!navigator.geolocation) {
      alert(isFr ? "La géolocalisation n'est pas supportée par ce navigateur." : 'Geolocation is not supported by your browser.');
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(5)));
        setLongitude(Number(pos.coords.longitude.toFixed(5)));
        setIsDetecting(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim()) return;

    setIsSaving(true);
    try {
      await onUpdateLocation({
        lastCity: cityName.trim(),
        lat: Number(latitude),
        lng: Number(longitude),
        statusMessage: statusNote.trim() || undefined,
        nextMilestone: nextStop.trim() || undefined,
        timestamp: new Date().toISOString()
      });

      setSavedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200 font-sans">
      <div className="bg-[#FAF8F5] border border-stone-300 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8 text-stone-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isFr ? "Épingler l'emplacement de l'expédition" : 'Pin Expedition Location'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {isFr ? 'Mettre à jour où se trouve Mousse sur la carte' : "Update where Mousse is on the website & map"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 flex items-center justify-center text-xs transition"
          >
            ✕
          </button>
        </div>

        {/* Narrative / Context */}
        <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-3.5 text-xs text-blue-950 flex items-start gap-2.5">
          <Truck className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
          <div className="leading-relaxed space-y-1">
            <p>
              {isFr
                ? "Envoyez une épingle pour indiquer votre position actuelle. Cette position sera affichée dans l'en-tête du site et sur la carte de l'itinéraire."
                : "Send a pin to share where you are right now. This updates the top header badge and moves Mousse's current pin on the interactive route map."}
            </p>
            <p className="text-[11px] text-blue-800 font-medium">
              {isFr
                ? "Astuce : La publication d'un journal de voyage met également à jour automatiquement votre épingle."
                : "Tip: Posting a new journal entry will also automatically pin your new location."}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Quick Route Presets */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center justify-between">
              <span>{isFr ? 'Raccourcis d’étapes sur l’itinéraire' : 'Quick Route Stops & Presets'}</span>
              <span className="text-[10px] text-stone-400 font-normal">{isFr ? 'Cliquez pour sélectionner' : 'Click to select'}</span>
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-stone-100/80 rounded-xl border border-stone-200 scrollbar-thin">
              {ROUTE_PRESETS.map((preset) => {
                const isSelected = cityName === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                      isSelected
                        ? 'bg-blue-900 text-white font-bold shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {isFr ? 'Nom du lieu / Ville / Étape' : 'Location / City / Landmark Name'}
            </label>
            <input
              type="text"
              required
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="e.g. Dawson City, Yukon"
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* Coordinates (Latitude & Longitude) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isFr ? 'Latitude' : 'Latitude'}
              </label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-blue-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isFr ? 'Longitude' : 'Longitude'}
              </label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-blue-900"
              />
            </div>
          </div>

          {/* Detect Device GPS Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleDetectDeviceLocation}
              disabled={isDetecting}
              className="text-[11px] text-blue-900 hover:text-blue-950 font-semibold flex items-center gap-1.5 transition"
            >
              {isDetecting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-900" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-blue-900" />
              )}
              <span>{isFr ? "Utiliser les coordonnées actuelles de l'appareil" : 'Grab current device GPS once'}</span>
            </button>
          </div>

          {/* Optional Status Note */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {isFr ? 'Note de statut (Optionnelle)' : 'Status Note / Activity (Optional)'}
            </label>
            <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g. Setting camp near the river, Starlink online for MBA coursework"
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* Optional Next Stop */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {isFr ? 'Prochaine étape prévue (Optionnelle)' : 'Next Planned Stop (Optional)'}
            </label>
            <input
              type="text"
              value={nextStop}
              onChange={(e) => setNextStop(e.target.value)}
              placeholder="e.g. Tuktoyaktuk Arctic Ocean"
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200 text-xs font-medium transition"
            >
              {isFr ? 'Annuler' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-900 hover:bg-blue-950 text-white font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{isFr ? 'Enregistrement...' : 'Saving Pin...'}</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isFr ? 'Épinglé avec succès !' : 'Pinned Successfully!'}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isFr ? "Mettre à jour l'emplacement" : 'Save & Pin Location'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

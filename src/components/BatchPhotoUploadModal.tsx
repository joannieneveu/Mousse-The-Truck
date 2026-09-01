import React, { useState } from 'react';
import { 
  ProcessedPhoto 
} from '../utils/photoDropHelper';
import { 
  JourneyLeg, 
  LiveLocation, 
  UserProfile, 
  MediaItem 
} from '../types';
import { 
  Upload, 
  X, 
  Trash2, 
  Plus, 
  MapPin, 
  Tag, 
  Calendar, 
  Compass, 
  Check, 
  Film, 
  Image as ImageIcon, 
  Sparkles,
  BookOpen,
  Layers,
  ArrowRight
} from 'lucide-react';

interface BatchPhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPhotos: ProcessedPhoto[];
  onUploadBatch: (items: Partial<MediaItem>[]) => Promise<void>;
  onCreateJournalWithPhotos?: (photos: ProcessedPhoto[]) => void;
  liveLocation?: LiveLocation;
  currentUser?: UserProfile | null;
}

export const BatchPhotoUploadModal: React.FC<BatchPhotoUploadModalProps> = ({
  isOpen,
  onClose,
  initialPhotos,
  onUploadBatch,
  onCreateJournalWithPhotos,
  liveLocation,
  currentUser
}) => {
  const [photos, setPhotos] = useState<ProcessedPhoto[]>(initialPhotos);
  const [locationName, setLocationName] = useState<string>(liveLocation?.lastCity || 'Lethbridge & Heading North');
  const [journeyLeg, setJourneyLeg] = useState<JourneyLeg>('arctic_yukon');
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
  
  // Tag pills
  const [selectedTags, setSelectedTags] = useState<string[]>(['Henri', 'Mousse on the Loose']);
  const [customTagInput, setCustomTagInput] = useState<string>('');
  
  // Custom metadata for each photo
  const [photoMeta, setPhotoMeta] = useState<Record<string, { title: string; caption: string; featured: boolean }>>(() => {
    const map: Record<string, { title: string; caption: string; featured: boolean }> = {};
    initialPhotos.forEach((p, idx) => {
      map[p.id] = {
        title: p.cleanTitle,
        caption: '',
        featured: idx === 0
      };
    });
    return map;
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync photos if initialPhotos changes and modal opened
  React.useEffect(() => {
    setPhotos(initialPhotos);
    const map: Record<string, { title: string; caption: string; featured: boolean }> = {};
    initialPhotos.forEach((p, idx) => {
      map[p.id] = {
        title: p.cleanTitle,
        caption: '',
        featured: idx === 0
      };
    });
    setPhotoMeta(map);
  }, [initialPhotos]);

  if (!isOpen || photos.length === 0) return null;

  const handleUpdateTitle = (id: string, newTitle: string) => {
    setPhotoMeta(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { title: '', caption: '', featured: false }),
        title: newTitle
      }
    }));
  };

  const handleUpdateCaption = (id: string, newCaption: string) => {
    setPhotoMeta(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { title: '', caption: '', featured: false }),
        caption: newCaption
      }
    }));
  };

  const handleToggleFeatured = (id: string) => {
    setPhotoMeta(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { title: '', caption: '', featured: false }),
        featured: !prev[id]?.featured
      }
    }));
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      const t = customTagInput.trim();
      if (!selectedTags.includes(t)) {
        setSelectedTags(prev => [...prev, t]);
      }
      setCustomTagInput('');
    }
  };

  const handleSubmitAll = async () => {
    if (photos.length === 0) return;
    setIsSubmitting(true);

    try {
      const itemsToUpload: Partial<MediaItem>[] = photos.map(photo => {
        const meta = photoMeta[photo.id] || { title: photo.cleanTitle, caption: '', featured: false };
        return {
          title: meta.title.trim() || photo.cleanTitle,
          type: photo.type,
          url: photo.dataUrl,
          thumbnailUrl: photo.dataUrl,
          caption: meta.caption.trim(),
          locationName: locationName.trim(),
          coordinates: liveLocation ? { lat: liveLocation.lat, lng: liveLocation.lng } : undefined,
          date: date.trim(),
          tags: selectedTags.length > 0 ? selectedTags : ['Expedition Photo'],
          author: currentUser ? currentUser.name : 'Joannie & Barton',
          featured: meta.featured,
          journeyLeg
        };
      });

      await onUploadBatch(itemsToUpload);
      onClose();
    } catch (err) {
      console.error('Failed to upload batch photos:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const AVAILABLE_PRESET_TAGS = [
    'Henri', 
    'Sabbatical', 
    'Landscapes', 
    'Campsites', 
    'Overland Rig', 
    'Wildlife', 
    'MBA On The Road', 
    'Visits Along The Way', 
    'Arctic & Yukon'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F5] border border-stone-200 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-xl text-stone-900">
                  Ready to Upload {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  From Computer / iPhoto
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Review titles, locations, and tags before adding to the live expedition gallery.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Global Metadata Settings */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-900" />
              <span>Expedition Metadata (Applied to this batch)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Location Taken
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Lethbridge, AB"
                    className="w-full pl-8.5 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Journey Leg
                </label>
                <select
                  value={journeyLeg}
                  onChange={(e) => setJourneyLeg(e.target.value as JourneyLeg)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-blue-900"
                >
                  <option value="arctic_yukon">Leg 1: Arctic & Yukon</option>
                  <option value="arctic_dempster">Leg 2: Dempster Highway & Arctic Ocean</option>
                  <option value="rockies_pacific">Leg 3: Canadian Rockies & Pacific Coast</option>
                  <option value="us_southwest">Leg 4: US Pacific Coast & Southwest</option>
                  <option value="baja_mexico">Leg 5: Baja Peninsula & Mainland Mexico</option>
                  <option value="central_america">Leg 6: Central America</option>
                  <option value="andes_south_america">Leg 7: Andes & South America</option>
                  <option value="patagonia_tierradelfuego">Leg 8: Patagonia & Tierra del Fuego</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-8.5 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-blue-900"
                  />
                </div>
              </div>
            </div>

            {/* Tag Selection */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1 text-xs">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5 items-center">
                {AVAILABLE_PRESET_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        isSelected
                          ? 'bg-blue-900 text-white shadow-2xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{tag}
                    </button>
                  );
                })}
                <input
                  type="text"
                  placeholder="+ Add custom tag..."
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                  className="px-2.5 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Photo Cards Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span className="font-semibold text-stone-800">
                Dropped Photo Details ({photos.length} items)
              </span>
              <span>Click ⭐ on any image to mark as featured</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {photos.map((photo, idx) => {
                const meta = photoMeta[photo.id] || { title: photo.cleanTitle, caption: '', featured: idx === 0 };
                return (
                  <div 
                    key={photo.id}
                    className="bg-white border border-stone-200 rounded-2xl p-3 flex gap-3.5 items-start shadow-2xs group relative"
                  >
                    {/* Thumbnail */}
                    <div className="w-28 h-28 rounded-xl overflow-hidden bg-stone-900 shrink-0 relative">
                      {photo.type === 'video' ? (
                        <video src={photo.dataUrl} className="w-full h-full object-cover" />
                      ) : (
                        <img 
                          src={photo.dataUrl} 
                          alt={meta.title} 
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                        {photo.type === 'video' ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] flex items-center gap-0.5">
                            <Film className="w-2.5 h-2.5" /> Video
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] flex items-center gap-0.5">
                            <ImageIcon className="w-2.5 h-2.5" /> Photo
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px]">
                        {photo.formattedSize}
                      </div>
                    </div>

                    {/* Metadata Inputs */}
                    <div className="flex-1 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-1">
                        <input
                          type="text"
                          value={meta.title}
                          onChange={(e) => handleUpdateTitle(photo.id, e.target.value)}
                          placeholder="Photo title..."
                          className="font-semibold text-stone-900 bg-stone-50 hover:bg-white focus:bg-white border border-transparent focus:border-blue-900 rounded-lg px-2 py-1 w-full text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="text-stone-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition shrink-0"
                          title="Remove photo from upload"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={meta.caption}
                        onChange={(e) => handleUpdateCaption(photo.id, e.target.value)}
                        placeholder="Add a quick story or note for this photo..."
                        className="w-full bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-800 resize-none focus:outline-none focus:border-blue-900"
                      />

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(photo.id)}
                          className={`text-[11px] font-medium flex items-center gap-1 px-2 py-0.5 rounded-md border transition ${
                            meta.featured
                              ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold'
                              : 'text-stone-500 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          ⭐ {meta.featured ? 'Featured Photo' : 'Mark as Featured'}
                        </button>

                        <span className="text-[10px] text-stone-400">
                          {photo.lastModifiedDate}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-stone-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
          <div className="text-xs text-stone-500 flex items-center gap-2">
            <span>Ready to publish <strong>{photos.length} captures</strong></span>
            {currentUser?.isAdmin && (
              <span className="text-emerald-700 font-semibold">• Logged in as Admin</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition"
            >
              Cancel
            </button>

            {onCreateJournalWithPhotos && (
              <button
                type="button"
                onClick={() => {
                  onCreateJournalWithPhotos(photos);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-800" />
                <span>Create Journal With These</span>
              </button>
            )}

            <button
              type="button"
              disabled={isSubmitting || photos.length === 0}
              onClick={handleSubmitAll}
              className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isSubmitting ? 'Uploading...' : `Upload ${photos.length} Photo${photos.length > 1 ? 's' : ''} to Gallery`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

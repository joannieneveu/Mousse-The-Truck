import React, { useState } from 'react';
import { 
  Truck, 
  Zap, 
  Baby, 
  Wifi, 
  Coffee, 
  Thermometer, 
  Upload, 
  Camera, 
  Check, 
  Image as ImageIcon, 
  Plus,
  ExternalLink,
  Layers,
  Sparkles,
  Heart
} from 'lucide-react';
import { RigPhoto, RigSpecCategory } from '../types';
import { RIG_SPECS_DATA } from '../data/initialData';

interface RigSpecsProps {
  rigPhotos: RigPhoto[];
  onUploadRigPhoto: (photo: { title: string; caption: string; url: string; category: RigPhoto['category'] }) => Promise<void>;
  isAdmin?: boolean;
}

export const RigSpecs: React.FC<RigSpecsProps> = ({
  rigPhotos,
  onUploadRigPhoto,
  isAdmin = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSpecCategory, setActiveSpecCategory] = useState<string>('chassis_drivetrain');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadCaption, setUploadCaption] = useState<string>('');
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [uploadPhotoCategory, setUploadPhotoCategory] = useState<RigPhoto['category']>('exterior');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<RigPhoto | null>(null);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Truck': return <Truck className="w-5 h-5 text-blue-900" />;
      case 'Zap': return <Zap className="w-5 h-5 text-blue-700" />;
      case 'Baby': return <Baby className="w-5 h-5 text-rose-600" />;
      case 'Wifi': return <Wifi className="w-5 h-5 text-sky-700" />;
      case 'Coffee': return <Coffee className="w-5 h-5 text-slate-800" />;
      case 'Thermometer': return <Thermometer className="w-5 h-5 text-emerald-700" />;
      default: return <Truck className="w-5 h-5 text-stone-700" />;
    }
  };

  const filteredPhotos = selectedCategory === 'all' 
    ? rigPhotos 
    : rigPhotos.filter(p => p.category === selectedCategory);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim()) return;

    setIsSubmitting(true);
    try {
      await onUploadRigPhoto({
        title: uploadTitle.trim() || 'Expedition Rig Photo',
        caption: uploadCaption.trim(),
        url: uploadUrl.trim(),
        category: uploadPhotoCategory
      });
      setUploadTitle('');
      setUploadCaption('');
      setUploadUrl('');
      setIsUploadOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const samplePresets = [
    {
      title: '2026 Ford F550 Expedition Rig (Mousse)',
      url: '/Mousse1.jpeg',
      caption: '2026 Ford F550 XLT Crew Cab, 6.7L Turbo Diesel with Kelderman Air Ride suspension.',
      category: 'exterior' as const
    },
    {
      title: 'Henri’s Removable Modular Countertop Cot',
      url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80',
      caption: 'Custom made removable modular cot sitting on the counter top next to the dinette.',
      category: 'henri_cot' as const
    },
    {
      title: 'Starlink & Weboost Expedition Workstation',
      url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
      caption: 'High-speed Starlink Satellite & Weboost Drive Reach Overland for remote Executive MBA studies.',
      category: 'workstation' as const
    }
  ];

  return (
    <div id="rig-specs-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-300">
      
      {/* Header Banner - Celebrating Mousse & "Mousse on the Loose" */}
      <div className="relative rounded-3xl overflow-hidden border border-stone-200 bg-[#FAF8F5] text-stone-900 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="relative z-10 max-w-5xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/10 text-emerald-950 border border-emerald-900/15">
              <Truck className="w-3.5 h-3.5 text-emerald-800" />
              <span>The Rig: Mousse</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-900 text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Slogan: “Mousse on the Loose”</span>
            </div>
            <span className="text-xs font-medium text-stone-500">2026 Ford F550 XLT Crew Cab • 6.7L Turbo Diesel</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-snug">
              Meet Mousse: 2026 Ford F550 Custom 4x4 Expedition Rig
            </h1>
            <p className="text-sm sm:text-base text-stone-600 mt-2 leading-relaxed">
              Picked up in Lethbridge, AB on August 27th, 2026, Mousse features a <strong>G3 4-season floor plan</strong>, 15 kWh EcoFlow lithium power architecture, 1100W solar array, full Kelderman Air Ride suspension, and custom living quarters for Joannie, Barton, and baby Henri.
            </p>
          </div>

          {/* The Story Behind the Name "Mousse" */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Heart className="w-4 h-4 text-emerald-700" />
              <span>Why We Named Her “Mousse” (The Triple Wink)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-stone-150 space-y-1">
                <span className="font-bold text-emerald-900 block">1. The Color (Moss / Mousse)</span>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Her rich moss-green expedition wrap blends seamlessly with boreal forests and sub-arctic tundra.
                </p>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-stone-150 space-y-1">
                <span className="font-bold text-blue-950 block">2. Newfoundland Moose</span>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  A playful nod to our Newfoundland home base and the iconic wilderness emblem of the island.
                </p>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-stone-150 space-y-1">
                <span className="font-bold text-indigo-950 block">3. French “Petit Mousse”</span>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  In French, <span className="italic">mousse</span> means cabin boy or young child—our little Henri exploring the world!
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-200">
            <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs">
              <div className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Off-Grid Power</div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">15 kWh EcoFlow + 1100W Solar</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs">
              <div className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Water Capacity</div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">285.7L Fresh + 20G Winter Tank</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs">
              <div className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Henri's Nursery</div>
              <div className="font-bold text-blue-950 text-xs sm:text-sm mt-0.5">Custom Removable Cot</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs">
              <div className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Connectivity</div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">Starlink + Weboost Booster</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Specs Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-900" />
              Comprehensive Technical Systems
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 font-sans">
              Explore the engineering and systems keeping Dr. Joannie, Dr. Barton, and baby Henri safe across extreme latitudes.
            </p>
          </div>
        </div>

        {/* Spec Category Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {RIG_SPECS_DATA.map((cat) => {
            const isActive = activeSpecCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveSpecCategory(cat.id)}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 shadow-sm ${
                  isActive
                    ? 'bg-blue-900 text-white border-blue-950 ring-2 ring-blue-900/20'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div className={`p-2 rounded-xl w-fit ${isActive ? 'bg-white/20 text-white' : 'bg-stone-100'}`}>
                  {getCategoryIcon(cat.iconName)}
                </div>
                <div className="text-xs font-semibold leading-snug line-clamp-2">
                  {cat.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Spec Details Card */}
        {(() => {
          const cat = RIG_SPECS_DATA.find(c => c.id === activeSpecCategory) || RIG_SPECS_DATA[0];
          return (
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="p-3 bg-stone-100 rounded-2xl">
                  {getCategoryIcon(cat.iconName)}
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-stone-900">{cat.title}</h3>
                  <p className="text-xs text-stone-500 font-sans mt-0.5">{cat.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.specs.map((spec, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 space-y-1.5"
                  >
                    <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider font-sans">
                      {spec.label}
                    </div>
                    <div className="text-sm font-bold text-stone-900 font-serif">
                      {spec.value}
                    </div>
                    {spec.details && (
                      <div className="text-xs text-stone-600 font-sans">
                        {spec.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Rig Photo Gallery Section */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <Camera className="w-6 h-6 text-blue-900" />
              Rig Photo Gallery
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 font-sans">
              Photographs of our overland setup, nursery cot, solar roof, and living quarters.
            </p>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-blue-900 hover:bg-blue-950 text-white px-5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm transition self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Rig Photo</span>
          </button>
        </div>

        {/* Photo Category Filter Pills */}
        <div className="flex flex-wrap gap-2 text-xs font-sans">
          {[
            { id: 'all', label: 'All Photos' },
            { id: 'exterior', label: 'Exterior & Drivetrain' },
            { id: 'interior', label: 'Interior Living' },
            { id: 'henri_cot', label: 'Henri’s Nursery Setup' },
            { id: 'solar_power', label: 'Solar & Power' },
            { id: 'kitchen', label: 'Galley & Water' },
            { id: 'workstation', label: 'MBA Workstation' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                selectedCategory === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhotoModal(photo)}
              className="bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-video overflow-hidden bg-stone-100">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-sm text-[10px] font-semibold text-white uppercase tracking-wider">
                  {photo.category.replace('_', ' ')}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-base leading-snug group-hover:text-blue-900 transition">
                  {photo.title}
                </h3>
                {photo.caption && (
                  <p className="text-xs text-stone-600 font-sans leading-relaxed">
                    {photo.caption}
                  </p>
                )}
                <div className="text-[10px] text-stone-400 font-mono pt-1">
                  Added: {photo.uploadedAt}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Rig Photo Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-stone-300 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-stone-800 space-y-5 my-8">
            
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-900 text-white">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">Upload Rig Photo</h3>
                  <p className="text-xs text-stone-500">Add a photo of the vehicle, nursery setup, or workstation.</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Rear Bed & Baby Henri Cot"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Photo Category *
                </label>
                <select
                  value={uploadPhotoCategory}
                  onChange={(e) => setUploadPhotoCategory(e.target.value as any)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
                >
                  <option value="exterior">Exterior & Suspension</option>
                  <option value="interior">Interior Living</option>
                  <option value="henri_cot">Henri’s Travel Cot / Nursery</option>
                  <option value="solar_power">Solar & Electrical</option>
                  <option value="kitchen">Galley & Water</option>
                  <option value="workstation">MBA Workstation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  placeholder="https://... (or select a preset below)"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              {/* Sample Presets */}
              <div className="space-y-1.5 bg-stone-100/70 p-3 rounded-2xl border border-stone-200">
                <div className="text-[11px] font-semibold text-stone-600">Quick Presets:</div>
                <div className="flex flex-wrap gap-1.5">
                  {samplePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setUploadTitle(preset.title);
                        setUploadUrl(preset.url);
                        setUploadCaption(preset.caption);
                        setUploadPhotoCategory(preset.category);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-[11px] text-stone-700 transition"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description / Caption
                </label>
                <textarea
                  rows={3}
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="Notes about this component or setup..."
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !uploadUrl.trim()}
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Uploading...' : 'Save Rig Photo'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {selectedPhotoModal && (
        <div 
          onClick={() => setSelectedPhotoModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm cursor-pointer animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] border border-stone-200 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-4 p-6"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-900">
              <img
                src={selectedPhotoModal.url}
                alt={selectedPhotoModal.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-xl text-stone-900">{selectedPhotoModal.title}</h3>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-200 text-stone-700 uppercase">
                  {selectedPhotoModal.category.replace('_', ' ')}
                </span>
              </div>
              {selectedPhotoModal.caption && (
                <p className="text-xs text-stone-600 font-sans">{selectedPhotoModal.caption}</p>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

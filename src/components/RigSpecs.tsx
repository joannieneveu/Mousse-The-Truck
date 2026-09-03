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
  Heart,
  Edit3,
  Trash2,
  FolderOpen,
  X
} from 'lucide-react';
import { RigPhoto, RigSpecCategory } from '../types';
import { RIG_SPECS_DATA } from '../data/initialData';
import { readFileAsOptimizedDataUrl, cleanFileNameToTitle } from '../utils/photoDropHelper';

interface RigSpecsProps {
  rigPhotos: RigPhoto[];
  onUploadRigPhoto: (photo: { title: string; caption: string; url: string; category: RigPhoto['category'] }) => Promise<void>;
  onUpdateRigPhoto?: (photoId: string, updatedData: Partial<RigPhoto>) => Promise<void>;
  onDeleteRigPhoto?: (photoId: string) => Promise<void>;
  isAdmin?: boolean;
}

export const RigSpecs: React.FC<RigSpecsProps> = ({
  rigPhotos,
  onUploadRigPhoto,
  onUpdateRigPhoto,
  onDeleteRigPhoto,
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

  // Edit photo modal state for Admin
  const [editingPhoto, setEditingPhoto] = useState<RigPhoto | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCaption, setEditCaption] = useState<string>('');
  const [editCategory, setEditCategory] = useState<RigPhoto['category']>('exterior');
  const [editUrl, setEditUrl] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  const openEditModal = (photo: RigPhoto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPhoto(photo);
    setEditTitle(photo.title);
    setEditCaption(photo.caption || '');
    setEditCategory(photo.category);
    setEditUrl(photo.url);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    setIsSavingEdit(true);
    try {
      const updatedData: Partial<RigPhoto> = {
        title: editTitle.trim() || 'Expedition Rig Photo',
        caption: editCaption.trim(),
        category: editCategory,
        url: editUrl.trim() || editingPhoto.url
      };

      if (onUpdateRigPhoto) {
        await onUpdateRigPhoto(editingPhoto.id, updatedData);
      }

      if (selectedPhotoModal && selectedPhotoModal.id === editingPhoto.id) {
        setSelectedPhotoModal({
          ...selectedPhotoModal,
          ...updatedData
        });
      }

      setEditingPhoto(null);
    } catch (err) {
      console.error('Failed to save rig photo edit:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeletePhoto = async (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onDeleteRigPhoto) return;
    if (window.confirm('Are you sure you want to delete this photo from the rig gallery?')) {
      await onDeleteRigPhoto(photoId);
      if (selectedPhotoModal?.id === photoId) setSelectedPhotoModal(null);
      if (editingPhoto?.id === photoId) setEditingPhoto(null);
    }
  };

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

  const [isRigDragging, setIsRigDragging] = useState<boolean>(false);

  const handleRigFileSelect = async (file: File, isForEdit = false) => {
    try {
      const dataUrl = await readFileAsOptimizedDataUrl(file);
      if (isForEdit) {
        setEditUrl(dataUrl);
      } else {
        setUploadUrl(dataUrl);
        if (!uploadTitle) {
          setUploadTitle(cleanFileNameToTitle(file.name));
        }
      }
    } catch (err) {
      console.error('Error processing rig photo file:', err);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim()) return;

    setIsSubmitting(true);
    try {
      let finalUrl = uploadUrl.trim();
      if (uploadUrl.startsWith('data:')) {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              dataUrl: uploadUrl, 
              title: uploadTitle || 'Rig Photo' 
            })
          });
          const data = await res.json();
          if (data.success && data.url) {
            finalUrl = data.url;
          }
        } catch (e) {
          // fallback
        }
      }

      await onUploadRigPhoto({
        title: uploadTitle.trim() || 'Expedition Rig Photo',
        caption: uploadCaption.trim(),
        url: finalUrl,
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
      title: '1100W High-Efficiency Solar Panel Array',
      url: '/solar panel.jpeg',
      caption: '1100W roof solar panel array delivering off-grid clean energy to the EcoFlow power kit.',
      category: 'solar_power' as const
    },
    {
      title: 'Mousse Interior Living Quarters',
      url: '/interior1.jpeg',
      caption: 'Custom 4-season habitat interior layout, dinette area, and optimized storage.',
      category: 'interior' as const
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
              Explore the engineering and systems keeping Joannie, Barton, and baby Henri safe across extreme latitudes.
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

          {/* Upload Button (Admin Only) */}
          {isAdmin && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-blue-900 hover:bg-blue-950 text-white px-5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm transition self-start sm:self-auto"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Rig Photo</span>
            </button>
          )}
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
              className="bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer flex flex-col justify-between relative"
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
                
                {/* Admin Quick Action Button on Photo */}
                {isAdmin && (
                  <button
                    onClick={(e) => openEditModal(photo, e)}
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500/90 hover:bg-amber-600 text-white backdrop-blur-sm text-[11px] font-semibold flex items-center gap-1 shadow-sm transition"
                    title="Edit caption and details"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif font-bold text-stone-900 text-base leading-snug group-hover:text-blue-900 transition flex-1">
                    {photo.title}
                  </h3>
                </div>
                {photo.caption && (
                  <p className="text-xs text-stone-600 font-sans leading-relaxed">
                    {photo.caption}
                  </p>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[10px] text-stone-400 font-mono">
                  <span>Added: {photo.uploadedAt}</span>
                  {isAdmin && (
                    <button
                      onClick={(e) => openEditModal(photo, e)}
                      className="text-blue-900 hover:text-blue-950 font-sans font-semibold text-[11px] flex items-center gap-1 hover:underline"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit Caption
                    </button>
                  )}
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

              {/* File Dropzone or choose file */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Photo File (Drag & Drop or Choose)
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsRigDragging(true);
                  }}
                  onDragLeave={() => setIsRigDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsRigDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleRigFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition ${
                    isRigDragging 
                      ? 'border-blue-900 bg-blue-50/80' 
                      : 'border-stone-300 bg-white hover:border-stone-400'
                  }`}
                >
                  {uploadUrl ? (
                    <div className="space-y-2">
                      <div className="relative inline-block max-h-40 rounded-xl overflow-hidden border border-stone-200 shadow-xs">
                        <img 
                          src={uploadUrl} 
                          alt="Rig Preview" 
                          className="max-h-36 w-auto object-contain mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadUrl('')}
                          className="absolute top-1.5 right-1.5 p-1 bg-stone-900/80 hover:bg-rose-600 text-white rounded-full transition"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Photo loaded
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 py-2">
                      <div className="w-9 h-9 mx-auto rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <div className="text-stone-700 text-xs">
                        <span className="font-semibold">Drag & drop photo here</span> or{' '}
                        <label className="text-blue-900 hover:text-blue-950 font-bold underline cursor-pointer">
                          browse from computer
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleRigFileSelect(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Or Image Web URL / Path
                </label>
                <input
                  type="text"
                  value={uploadUrl.startsWith('data:') ? '[Selected from computer]' : uploadUrl}
                  onChange={(e) => {
                    if (!uploadUrl.startsWith('data:')) {
                      setUploadUrl(e.target.value);
                    }
                  }}
                  placeholder="/interior1.jpeg or https://..."
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-blue-900"
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

      {/* Admin Edit Rig Photo Modal */}
      {editingPhoto && (
        <div 
          onClick={() => setEditingPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] border border-stone-300 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-stone-800 space-y-5 my-8"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-white">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">Edit Caption & Rig Photo</h3>
                  <p className="text-xs text-stone-500">Administrator controls for Mousse rig specifications.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPhoto(null)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-sans">
              {/* Image Preview */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-200 border border-stone-300">
                <img
                  src={editUrl || editingPhoto.url}
                  alt={editTitle}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Caption under Picture *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="Enter the descriptive caption for this photograph..."
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-blue-900 text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
                  >
                    <option value="exterior">Exterior & Suspension</option>
                    <option value="interior">Interior Living</option>
                    <option value="henri_cot">Henri’s Nursery</option>
                    <option value="solar_power">Solar & Electrical</option>
                    <option value="kitchen">Galley & Water</option>
                    <option value="workstation">MBA Workstation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Image File / URL
                  </label>
                  <input
                    type="text"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                {onDeleteRigPhoto ? (
                  <button
                    type="button"
                    onClick={(e) => handleDeletePhoto(editingPhoto.id, e)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Photo</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPhoto(null)}
                    className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSavingEdit ? 'Saving...' : 'Save Caption'}</span>
                  </button>
                </div>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-serif font-bold text-xl text-stone-900">{selectedPhotoModal.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-200 text-stone-700 uppercase">
                    {selectedPhotoModal.category.replace('_', ' ')}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={(e) => openEditModal(selectedPhotoModal, e)}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 transition shadow-xs"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Caption</span>
                    </button>
                  )}
                </div>
              </div>
              {selectedPhotoModal.caption && (
                <p className="text-sm text-stone-700 font-sans leading-relaxed bg-white p-3.5 rounded-2xl border border-stone-200">
                  {selectedPhotoModal.caption}
                </p>
              )}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-stone-200">
              <span className="text-xs text-stone-500">Added: {selectedPhotoModal.uploadedAt}</span>
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-xl transition"
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

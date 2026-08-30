import React, { useState } from 'react';
import { 
  Users, 
  Heart, 
  Baby, 
  GraduationCap, 
  Compass, 
  Truck, 
  MapPin,
  Calendar,
  Sparkles,
  Award,
  Home,
  Camera,
  Upload,
  Check,
  Instagram,
  ArrowUpRight
} from 'lucide-react';
import { INITIAL_FAMILY_MEMBERS } from '../data/initialData';
import { FamilyMember } from '../types';

export const FamilyProfile: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_FAMILY_MEMBERS);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [familyHeroPhoto, setFamilyHeroPhoto] = useState<string>(() => {
    try {
      return localStorage.getItem('mousse_family_hero_photo') || '/Family.jpeg';
    } catch {
      return '/Family.jpeg';
    }
  });
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [isEditingHeroPhoto, setIsEditingHeroPhoto] = useState<boolean>(false);

  const onTripMembers = members.filter(m => m.onTripWithUs);
  const atHomeMembers = members.filter(m => !m.onTripWithUs);

  const handleUpdateAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !newPhotoUrl.trim()) return;

    setMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, avatar: newPhotoUrl.trim() } : m));
    setEditingMember(null);
    setNewPhotoUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'member' | 'hero') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (target === 'hero') {
          setFamilyHeroPhoto(dataUrl);
          try {
            localStorage.setItem('mousse_family_hero_photo', dataUrl);
          } catch {
            // ignore storage quota errors if large
          }
          setIsEditingHeroPhoto(false);
        } else if (editingMember) {
          setMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, avatar: dataUrl } : m));
          setEditingMember(null);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div id="family-profile-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in duration-300">
      
      {/* Editorial Overview Card with Family Photo */}
      <div className="relative rounded-3xl overflow-hidden border border-stone-200 bg-[#FAF8F5] text-stone-900 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          
          <div className="p-6 sm:p-10 lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/10 text-emerald-950 border border-emerald-900/15">
              <Users className="w-3.5 h-3.5 text-emerald-900" />
              <span>Mousse on the Loose • Arctic to Antarctica</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-snug">
              Joannie, Barton, Baby Henri & The Americas Expedition
            </h1>

            <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-normal">
              We are Joannie and Barton, a Newfoundland-based blended family, travelling with our newest addition, Henri. In August 2026, we set off in our custom moss-green overland truck, Mousse, on Mousse on the Loose: a year-long, 35,000 km journey from the Arctic to Antarctica, alongside remote Executive MBA studies. Our older children will join us for stretches of the adventure between university, work and lives of their own.
            </p>

            {/* Harmonious Navy & Warm Beige Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-200">
              <div className="bg-white/90 border border-stone-200 rounded-2xl p-3 shadow-xs">
                <div className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Home Base</div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">Newfoundland, Canada</div>
              </div>
              <div className="bg-white/90 border border-stone-200 rounded-2xl p-3 shadow-xs">
                <div className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider">The Rig (Mousse)</div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">Lethbridge (Aug 27)</div>
              </div>
              <div className="bg-white/90 border border-stone-200 rounded-2xl p-3 shadow-xs">
                <div className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Infant Explorer</div>
                <div className="font-bold text-blue-950 text-xs sm:text-sm mt-0.5">Henri (Born June 2026)</div>
              </div>
              <div className="bg-white/90 border border-stone-200 rounded-2xl p-3 shadow-xs">
                <div className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Studies On Road</div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">Executive MBAs (Remote)</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-6 flex flex-col justify-center">
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-md group bg-stone-100">
              <img
                src={familyHeroPhoto}
                alt="Joannie, Barton, and baby Henri on the Newfoundland pebble beach"
                className="w-full h-80 object-cover group-hover:scale-105 transition duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">Expedition Family Portrait</span>
                    <div className="text-white text-sm font-bold">Joannie, Barton & Baby Henri</div>
                    <div className="text-stone-300 text-[11px]">Newfoundland pebble coast, August 2026</div>
                  </div>
                  <button
                    onClick={() => setIsEditingHeroPhoto(true)}
                    className="px-2.5 py-1.5 bg-white/20 backdrop-blur-md hover:bg-blue-900 text-white rounded-xl text-xs flex items-center gap-1 shadow transition"
                    title="Change or upload family photo"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Change Photo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* The Sabbatical Crew on the Road */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-900" />
            On the Road: The Full-Time Expedition Trio
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Joannie, Barton, and baby Henri traveling full-time in our custom 4x4 overland truck.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {onTripMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-900/30 shadow-xs"
                    />
                    <button
                      onClick={() => { setEditingMember(member); setNewPhotoUrl(''); }}
                      title="Update photo"
                      className="absolute -bottom-1 -right-1 p-1.5 bg-blue-950 hover:bg-blue-900 text-white rounded-lg opacity-85 hover:opacity-100 transition shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                    <div className="text-xs font-semibold text-blue-900">{member.relation}</div>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {member.bio}
                </p>

                {member.detailNote && (
                  <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-2.5 text-[11px] text-stone-700">
                    <span className="font-semibold text-slate-900">Status: </span>
                    {member.detailNote}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => { setEditingMember(member); setNewPhotoUrl(''); }}
                  className="text-blue-900 hover:text-blue-950 font-semibold flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>Update Picture</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Family at Home (No photos per user instructions) */}
      <div className="space-y-6 pt-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Home className="w-6 h-6 text-stone-700" />
            Our Family at Home
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            The older kids in our blended family cheering us on, tracking our live coordinates, and following little brother Henri.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {atHomeMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-3 flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {/* Monogram avatar badge instead of photo */}
                  <div className="w-12 h-12 rounded-2xl bg-blue-950 text-white flex items-center justify-center font-bold text-base shadow-xs border border-blue-900">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                    <div className="text-xs text-stone-500">{member.relation}</div>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {member.bio}
                </p>
              </div>

              {member.detailNote && (
                <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-2 text-[11px] text-stone-700 font-medium">
                  {member.detailNote}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Instagram Follow Card */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-stone-50 border border-orange-200/90 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-orange-800 font-bold text-base">
            <Instagram className="w-5 h-5 text-orange-700" />
            <span>Follow the Truck on Instagram</span>
          </div>
          <p className="text-xs text-stone-600 max-w-xl leading-relaxed">
            Follow our daily reels, camp setups, baby Henri milestones, and behind-the-scenes overland stories as we make our way from the Arctic to Ushuaia.
          </p>
        </div>

        <a
          href="https://www.instagram.com/moussethetruck/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-orange-700 hover:bg-orange-800 text-white font-semibold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition shrink-0"
        >
          <span>@moussethetruck</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      {/* Photo update modal for Joannie, Barton & Henri */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-stone-300 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Update Profile Picture for {editingMember.name}
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              {/* Option A: Select file from device */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2">
                <label className="block font-semibold text-stone-800">
                  Select Real Photo from Device
                </label>
                <p className="text-[11px] text-stone-500">
                  Choose your exact original photo file (JPG, PNG). It will load directly without AI alterations.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'member')}
                  className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-950 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 text-stone-400 text-center">
                <div className="h-[1px] bg-stone-300 flex-1"></div>
                <span>OR PASTE URL</span>
                <div className="h-[1px] bg-stone-300 flex-1"></div>
              </div>

              {/* Option B: Enter URL */}
              <form onSubmit={handleUpdateAvatar} className="space-y-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Image Web Link / URL
                  </label>
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="https://... or photo link"
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-blue-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 rounded-xl bg-stone-200 text-stone-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newPhotoUrl.trim()}
                    className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold disabled:opacity-50"
                  >
                    Save Photo URL
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Hero Photo update modal */}
      {isEditingHeroPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-stone-300 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Upload Real Family Photo
              </h3>
              <button
                onClick={() => setIsEditingHeroPhoto(false)}
                className="w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2">
                <label className="block font-semibold text-stone-800">
                  Select Family Photo File from Your Device
                </label>
                <p className="text-[11px] text-stone-500">
                  Select your original family photo. It will display in full clarity without any alterations.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'hero')}
                  className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-950 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingHeroPhoto(false)}
                  className="px-4 py-2 rounded-xl bg-stone-200 text-stone-700 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

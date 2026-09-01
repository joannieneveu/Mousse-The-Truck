import React, { useState, useRef } from 'react';
import { 
  TravelLog, 
  JournalCategory, 
  JourneyLeg, 
  LiveLocation 
} from '../types';
import { 
  BookOpen, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Highlighter, 
  Palette, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Minus, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  MapPin, 
  Compass, 
  Baby, 
  GraduationCap, 
  Users, 
  Eye, 
  Edit3, 
  Check, 
  Image as ImageIcon, 
  Trash2, 
  Plus, 
  Columns,
  Type,
  FolderOpen
} from 'lucide-react';
import { RichTextRenderer } from '../utils/richTextRenderer';
import { extractPhotosFromDropEvent, extractPhotosFromFileInput, ProcessedPhoto } from '../utils/photoDropHelper';

interface JournalEditorModalProps {
  initialLog?: TravelLog | null; // If provided, we are editing; if null, creating
  isOpen: boolean;
  onClose: () => void;
  onSave: (logData: Partial<TravelLog> & { addLocationPing?: boolean; updateLiveCity?: boolean; region?: string }) => Promise<void>;
  liveLocation?: LiveLocation;
  authorName?: string;
}

const COLOR_PALETTE = [
  { name: 'Default Dark', color: '#1C1917', bg: 'bg-stone-900' },
  { name: 'Arctic Navy', color: '#1E3A8A', bg: 'bg-blue-900' },
  { name: 'Forest Green', color: '#166534', bg: 'bg-emerald-800' },
  { name: 'Golden Amber', color: '#B45309', bg: 'bg-amber-700' },
  { name: 'Crimson Rose', color: '#BE123C', bg: 'bg-rose-700' },
  { name: 'Plum Purple', color: '#6B21A8', bg: 'bg-purple-800' },
  { name: 'Terracotta', color: '#C2410C', bg: 'bg-orange-700' },
  { name: 'Cool Slate', color: '#475569', bg: 'bg-slate-600' }
];

const HIGHLIGHT_PALETTE = [
  { name: 'Soft Yellow', color: '#FEF08A', textColor: '#854D0E', label: 'Yellow' },
  { name: 'Sage Green', color: '#BBF7D0', textColor: '#166534', label: 'Green' },
  { name: 'Sky Blue', color: '#BAE6FD', textColor: '#075985', label: 'Blue' },
  { name: 'Rose Pink', color: '#FECDD3', textColor: '#9F1239', label: 'Pink' },
  { name: 'Warm Peach', color: '#FED7AA', textColor: '#9A3412', label: 'Peach' }
];

export const JournalEditorModal: React.FC<JournalEditorModalProps> = ({
  initialLog,
  isOpen,
  onClose,
  onSave,
  liveLocation,
  authorName = 'Joannie & Barton'
}) => {
  const isEditing = Boolean(initialLog);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // View state: 'write' | 'preview' | 'split'
  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'split'>('write');

  // Form Fields
  const [title, setTitle] = useState<string>(initialLog?.title || '');
  const [date, setDate] = useState<string>(initialLog?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
  const [locationName, setLocationName] = useState<string>(initialLog?.locationName || liveLocation?.lastCity || 'Lethbridge & Heading North');
  const [country, setCountry] = useState<string>(initialLog?.country || 'Canada');
  const [category, setCategory] = useState<JournalCategory>(initialLog?.category || 'adventures_mba');
  const [status, setStatus] = useState<'draft' | 'published'>(initialLog?.status || 'published');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono' | 'handwriting'>(initialLog?.fontFamily || 'serif');
  const [content, setContent] = useState<string>(initialLog?.content || '');
  const [coverImage, setCoverImage] = useState<string>(initialLog?.coverImage || '/hot spring.jpeg');
  const [activity, setActivity] = useState<string>(initialLog?.metrics?.activityType || '');
  
  // Specific Highlights
  const [henriHighlight, setHenriHighlight] = useState<string>(initialLog?.henriHighlight || '');
  const [mbaHighlight, setMbaHighlight] = useState<string>(initialLog?.mbaHighlight || '');
  const [visitorHighlight, setVisitorHighlight] = useState<string>(initialLog?.visitorHighlight || '');
  const [henriAge, setHenriAge] = useState<string>(initialLog?.metrics?.henriAge || '2.5 months');

  // Gallery items
  const [gallery, setGallery] = useState<{ url: string; caption: string; type: 'image' | 'video' }[]>(
    initialLog?.gallery || []
  );
  const [newGalleryUrl, setNewGalleryUrl] = useState<string>('');
  const [newGalleryCaption, setNewGalleryCaption] = useState<string>('');

  // Map Ping State
  const [addLocationPing, setAddLocationPing] = useState<boolean>(!isEditing);
  const [latitude, setLatitude] = useState<number>(initialLog?.coordinates?.lat || liveLocation?.lat || 60.7212);
  const [longitude, setLongitude] = useState<number>(initialLog?.coordinates?.lng || liveLocation?.lng || -135.0568);
  const [journeyLeg, setJourneyLeg] = useState<JourneyLeg>(initialLog?.journeyLeg || 'arctic_yukon');
  const [updateLiveCity, setUpdateLiveCity] = useState<boolean>(!isEditing);

  // Google Location Insights
  const [isPullingInsights, setIsPullingInsights] = useState<boolean>(false);
  const [insightsError, setInsightsError] = useState<string>('');
  const [population, setPopulation] = useState<string>(initialLog?.locationInsights?.population || '');
  const [interestingFacts, setInterestingFacts] = useState<string[]>(initialLog?.locationInsights?.interestingFacts || []);
  const [culturalContext, setCulturalContext] = useState<string>(initialLog?.locationInsights?.culturalContext || '');
  const [activityTips, setActivityTips] = useState<string>(initialLog?.locationInsights?.activityTips || '');
  const [newFactInput, setNewFactInput] = useState<string>('');

  // Formatting Palette dropdown states
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState<boolean>(false);
  const [customColor, setCustomColor] = useState<string>('#1E3A8A');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // --- TEXT SELECTION & FORMATTING HELPERS ---
  const applyTextWrap = (before: string, after: string = before, placeholder: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;

    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newContent);

    // Reset selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 10);
  };

  const applyLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Find the start of the line
    const lastNewline = content.lastIndexOf('\n', start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const newContent = content.substring(0, lineStart) + prefix + content.substring(lineStart);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 10);
  };

  const handleApplyColor = (colorHex: string) => {
    applyTextWrap(`<span style="color: ${colorHex}">`, '</span>', 'colored text');
    setShowColorPicker(false);
  };

  const handleApplyHighlight = (bgColor: string, textColor: string) => {
    applyTextWrap(
      `<mark style="background-color: ${bgColor}; color: ${textColor}; padding: 2px 6px; border-radius: 4px">`,
      '</mark>',
      'highlighted text'
    );
    setShowHighlightPicker(false);
  };

  // Google / Gemini Location Insights Fetcher
  const handlePullLocationInsights = async () => {
    if (!locationName.trim()) {
      setInsightsError('Please provide a location name first.');
      return;
    }
    setInsightsError('');
    setIsPullingInsights(true);

    try {
      const res = await fetch('/api/gemini/location-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: locationName.trim(),
          country: country.trim() || 'Canada',
          activity: activity.trim() || undefined
        })
      });

      const data = await res.json();
      if (data.insights) {
        if (data.insights.population) setPopulation(data.insights.population);
        if (Array.isArray(data.insights.interestingFacts)) setInterestingFacts(data.insights.interestingFacts);
        if (data.insights.culturalContext) setCulturalContext(data.insights.culturalContext);
        if (data.insights.activityTips) setActivityTips(data.insights.activityTips);
      }
    } catch (err) {
      console.error('Failed to pull insights:', err);
      setInsightsError('Could not fetch location info automatically. You can still type details manually.');
    } finally {
      setIsPullingInsights(false);
    }
  };

  const handleAddFact = () => {
    if (newFactInput.trim()) {
      setInterestingFacts(prev => [...prev, newFactInput.trim()]);
      setNewFactInput('');
    }
  };

  const handleRemoveFact = (index: number) => {
    setInterestingFacts(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddGalleryPhoto = () => {
    if (newGalleryUrl.trim()) {
      setGallery(prev => [
        ...prev,
        {
          url: newGalleryUrl.trim(),
          caption: newGalleryCaption.trim() || 'Expedition photo',
          type: 'image'
        }
      ]);
      setNewGalleryUrl('');
      setNewGalleryCaption('');
    }
  };

  // Cover Photo Drag state
  const [isDraggingCover, setIsDraggingCover] = useState<boolean>(false);
  // Gallery Photo Drag state
  const [isDraggingGallery, setIsDraggingGallery] = useState<boolean>(false);

  const handleRemoveGalleryPhoto = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const photos = await extractPhotosFromFileInput(e);
    if (photos.length > 0) {
      setCoverImage(photos[0].dataUrl);
    }
  };

  const handleCoverDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(false);
    const photos = await extractPhotosFromDropEvent(e);
    if (photos.length > 0) {
      setCoverImage(photos[0].dataUrl);
    }
  };

  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const photos = await extractPhotosFromFileInput(e);
    if (photos.length > 0) {
      const newItems = photos.map(p => ({
        url: p.dataUrl,
        caption: p.cleanTitle,
        type: p.type
      }));
      setGallery(prev => [...prev, ...newItems]);
    }
  };

  const handleGalleryDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(false);
    const photos = await extractPhotosFromDropEvent(e);
    if (photos.length > 0) {
      const newItems = photos.map(p => ({
        url: p.dataUrl,
        caption: p.cleanTitle,
        type: p.type
      }));
      setGallery(prev => [...prev, ...newItems]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);

    const logPayload: Partial<TravelLog> & { addLocationPing?: boolean; updateLiveCity?: boolean; region?: string } = {
      title: title.trim(),
      date: date.trim(),
      locationName: locationName.trim(),
      country: country.trim(),
      coordinates: { lat: latitude, lng: longitude },
      category,
      journeyLeg,
      status,
      fontFamily,
      content,
      coverImage: coverImage.trim() || '/departure.jpeg',
      gallery,
      readingTime: `${Math.max(2, Math.ceil(content.split(/\s+/).length / 180))} min read`,
      excerpt: content.substring(0, 160).replace(/[#*`_>]/g, '') + '...',
      metrics: {
        elevationM: liveLocation?.altitudeM || 600,
        tempC: liveLocation?.weather?.tempC || 18,
        henriAge,
        activityType: activity
      },
      locationInsights: (population || culturalContext || interestingFacts.length > 0) ? {
        population,
        culturalContext,
        interestingFacts,
        activityTips
      } : undefined,
      henriHighlight: category === 'henri_milestones' ? henriHighlight : undefined,
      mbaHighlight: category === 'adventures_mba' ? mbaHighlight : undefined,
      visitorHighlight: category === 'visits_along_the_way' ? visitorHighlight : undefined,
      addLocationPing,
      updateLiveCity,
      region: country
    };

    try {
      await onSave(logPayload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-stone-300 rounded-3xl max-w-5xl w-full p-5 sm:p-7 shadow-2xl text-stone-800 space-y-6 my-6 font-sans max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
                <span>{isEditing ? 'Edit Journal Entry' : 'Write Expedition Journal Entry'}</span>
                {isEditing && (
                  <span className="text-xs font-mono font-normal text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Editing Mode
                  </span>
                )}
              </h2>
              <p className="text-xs text-stone-500">
                Author: {authorName} • Custom Typography & Rich Text Formatting
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 flex items-center justify-center text-sm font-semibold transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs overflow-y-auto pr-1 flex-1">
          
          {/* Top Status & Controls */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                <span>Publication Status</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  status === 'published' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  {status === 'published' ? 'LIVE TO PUBLIC' : 'PRIVATE DRAFT'}
                </span>
              </div>
              <p className="text-[11px] text-amber-900 mt-0.5">
                {status === 'published' 
                  ? 'This story is visible to all followers, family and friends.' 
                  : 'Saved privately for Joannie & Barton only until ready to publish.'}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white border border-amber-200 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  status === 'draft' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => setStatus('published')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  status === 'published' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                Publish Live
              </button>
            </div>
          </div>

          {/* Stream Category Selection */}
          <div>
            <label className="block font-bold text-stone-800 mb-1.5">
              Expedition Stream Category *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className={`p-3 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                category === 'adventures_mba' 
                  ? 'bg-blue-50 border-blue-900 ring-2 ring-blue-900 text-blue-950 shadow-xs' 
                  : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
              }`}>
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <GraduationCap className="w-4 h-4 text-blue-900" />
                  <span>Adventures & MBA</span>
                </div>
                <p className="text-[11px] text-stone-500">Sabbatical expedition stories, truck operations & MBA coursework</p>
                <input 
                  type="radio" 
                  name="journal_cat" 
                  value="adventures_mba" 
                  checked={category === 'adventures_mba'} 
                  onChange={() => setCategory('adventures_mba')} 
                  className="sr-only" 
                />
              </label>

              <label className={`p-3 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                category === 'henri_milestones' 
                  ? 'bg-rose-50 border-rose-700 ring-2 ring-rose-700 text-rose-950 shadow-xs' 
                  : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
              }`}>
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Baby className="w-4 h-4 text-rose-700" />
                  <span>Henri’s Milestones</span>
                </div>
                <p className="text-[11px] text-stone-500">First swims, developmental milestones & baby memories</p>
                <input 
                  type="radio" 
                  name="journal_cat" 
                  value="henri_milestones" 
                  checked={category === 'henri_milestones'} 
                  onChange={() => setCategory('henri_milestones')} 
                  className="sr-only" 
                />
              </label>

              <label className={`p-3 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${
                category === 'visits_along_the_way' 
                  ? 'bg-emerald-50 border-emerald-700 ring-2 ring-emerald-700 text-emerald-950 shadow-xs' 
                  : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
              }`}>
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>Visits Along The Way</span>
                </div>
                <p className="text-[11px] text-stone-500">Reconnecting with family, medical colleagues & northern friends</p>
                <input 
                  type="radio" 
                  name="journal_cat" 
                  value="visits_along_the_way" 
                  checked={category === 'visits_along_the_way'} 
                  onChange={() => setCategory('visits_along_the_way')} 
                  className="sr-only" 
                />
              </label>
            </div>
          </div>

          {/* Title, Date, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">
                Journal Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. From Family Roots to Laundromat Fiascos..."
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-900 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Date *
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. August 31, 2026"
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-900 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">
                Location Name *
              </label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Whitehorse & En Route to Pelly Crossing, Yukon"
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-900 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Canada"
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-900 text-xs"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RICH TEXT FORMATTING TOOLBAR & CONTENT EDITOR */}
          {/* ========================================================================= */}
          <div className="bg-white border border-stone-300 rounded-2xl overflow-hidden shadow-xs space-y-0">
            
            {/* Top Editor Bar: View mode tabs & Font Selector */}
            <div className="bg-stone-100 border-b border-stone-200 p-2.5 flex flex-wrap items-center justify-between gap-2">
              
              {/* Font Family Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-stone-600" />
                  Font Style:
                </span>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as any)}
                  className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-blue-900"
                >
                  <option value="serif">Classic Editorial Serif (Playfair / Merriweather)</option>
                  <option value="sans">Modern Clean Sans-Serif (Plus Jakarta / Inter)</option>
                  <option value="mono">Vintage Typewriter / Monospace</option>
                  <option value="handwriting">Casual Journal Script</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-stone-200 p-0.5 rounded-xl text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                    activeTab === 'write' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                    activeTab === 'preview' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Live Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('split')}
                  className={`hidden md:flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                    activeTab === 'split' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Columns className="w-3 h-3" />
                  <span>Split View</span>
                </button>
              </div>
            </div>

            {/* FORMATTING TOOLBAR */}
            <div className="bg-stone-50 border-b border-stone-200 p-2 flex flex-wrap items-center gap-1.5 text-stone-700">
              
              {/* Bold, Italic, Underline, Strike */}
              <div className="flex items-center bg-white border border-stone-300 rounded-lg p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => applyTextWrap('**', '**', 'bold text')}
                  className="p-1.5 hover:bg-stone-100 rounded text-stone-800 hover:text-black transition"
                  title="Bold (**text**)"
                >
                  <Bold className="w-3.5 h-3.5 font-bold" />
                </button>
                <button
                  type="button"
                  onClick={() => applyTextWrap('*', '*', 'italic text')}
                  className="p-1.5 hover:bg-stone-100 rounded text-stone-800 hover:text-black transition"
                  title="Italic (*text*)"
                >
                  <Italic className="w-3.5 h-3.5 italic" />
                </button>
                <button
                  type="button"
                  onClick={() => applyTextWrap('<u>', '</u>', 'underlined text')}
                  className="p-1.5 hover:bg-stone-100 rounded text-stone-800 hover:text-black transition"
                  title="Underline (<u>text</u>)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyTextWrap('~~', '~~', 'strikethrough text')}
                  className="p-1.5 hover:bg-stone-100 rounded text-stone-800 hover:text-black transition"
                  title="Strikethrough (~~text~~)"
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Headings */}
              <div className="flex items-center bg-white border border-stone-300 rounded-lg p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => applyLinePrefix('## ')}
                  className="px-2 py-1 hover:bg-stone-100 rounded text-[11px] font-bold text-stone-800"
                  title="Major Heading (## Heading)"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => applyLinePrefix('### ')}
                  className="px-2 py-1 hover:bg-stone-100 rounded text-[11px] font-bold text-stone-800"
                  title="Section Subheading (### Subheading)"
                >
                  H3
                </button>
              </div>

              {/* Text Color Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowColorPicker(!showColorPicker);
                    setShowHighlightPicker(false);
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-medium hover:bg-stone-100 transition"
                  title="Text Color"
                >
                  <Palette className="w-3.5 h-3.5 text-blue-900" />
                  <span>Color</span>
                </button>

                {showColorPicker && (
                  <div className="absolute top-full mt-1 left-0 z-30 bg-white border border-stone-300 rounded-2xl p-3 shadow-xl w-60 space-y-2.5 animate-in fade-in">
                    <div className="text-[11px] font-bold text-stone-700">Choose Text Color:</div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => handleApplyColor(c.color)}
                          className="flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-stone-100 transition"
                          title={c.name}
                        >
                          <div className={`w-5 h-5 rounded-full ${c.bg} shadow-xs`} />
                          <span className="text-[9px] text-stone-600 truncate max-w-full">{c.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-stone-200 flex items-center gap-2">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-7 h-7 rounded border border-stone-300 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyColor(customColor)}
                        className="flex-1 px-2 py-1 bg-blue-900 text-white rounded-lg text-[10px] font-bold"
                      >
                        Apply Custom Color
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Highlight Background */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowHighlightPicker(!showHighlightPicker);
                    setShowColorPicker(false);
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-white border border-stone-300 rounded-lg text-xs font-medium hover:bg-stone-100 transition"
                  title="Highlight Text Background"
                >
                  <Highlighter className="w-3.5 h-3.5 text-amber-600" />
                  <span>Highlight</span>
                </button>

                {showHighlightPicker && (
                  <div className="absolute top-full mt-1 left-0 z-30 bg-white border border-stone-300 rounded-2xl p-3 shadow-xl w-56 space-y-2 animate-in fade-in">
                    <div className="text-[11px] font-bold text-stone-700">Highlight Background:</div>
                    <div className="space-y-1">
                      {HIGHLIGHT_PALETTE.map((h) => (
                        <button
                          key={h.color}
                          type="button"
                          onClick={() => handleApplyHighlight(h.color, h.textColor)}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-stone-50 border border-stone-200 text-[11px] font-semibold"
                          style={{ backgroundColor: h.color, color: h.textColor }}
                        >
                          <span>{h.name}</span>
                          <span>Aa</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Lists & Quotes */}
              <div className="flex items-center bg-white border border-stone-300 rounded-lg p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => applyLinePrefix('- ')}
                  className="p-1.5 hover:bg-stone-100 rounded text-stone-800 hover:text-black transition"
                  title="Bullet List (- item)"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyLinePrefix('1. ')}
                  className="p-1.5 hover:bg-stone-100 rounded text-stone-800 hover:text-black transition"
                  title="Numbered List (1. item)"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyLinePrefix('> ')}
                  className="p-1.5 hover:bg-stone-100 rounded text-stone-800 hover:text-black transition"
                  title="Quote Block (> quote)"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyLinePrefix('\n---\n\n')}
                  className="p-1.5 hover:bg-stone-100 rounded text-stone-800 hover:text-black transition"
                  title="Horizontal Divider Line (---)"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[10px] text-stone-400 ml-auto hidden sm:block">
                Supports Bold, Italic, Color tags & Markdown
              </div>
            </div>

            {/* CONTENT AREA: WRITE / PREVIEW / SPLIT */}
            <div className="p-3">
              {activeTab === 'write' && (
                <div>
                  <textarea
                    ref={textareaRef}
                    rows={12}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your reflections, stories, road memories, or notes..."
                    className={`w-full bg-transparent border-0 focus:outline-none p-2 text-stone-900 text-sm leading-relaxed ${
                      fontFamily === 'sans' ? 'font-sans' :
                      fontFamily === 'mono' ? 'font-mono' :
                      fontFamily === 'handwriting' ? 'font-serif italic' :
                      'font-serif'
                    }`}
                  />
                  <div className="flex justify-between items-center text-[10px] text-stone-500 pt-2 border-t border-stone-100">
                    <span>{content.split(/\s+/).filter(Boolean).length} words • {content.length} characters</span>
                    <span>Tip: Switch to "Live Preview" above to see the styled typography and colors</span>
                  </div>
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-stone-200 min-h-[300px]">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Live Typography & Formatting Preview:</div>
                  <h1 className="text-2xl font-serif font-bold text-stone-900 mb-4">{title || 'Untitled Journal Entry'}</h1>
                  <RichTextRenderer content={content} fontFamily={fontFamily} />
                </div>
              )}

              {activeTab === 'split' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-r border-stone-200 pr-3">
                    <div className="text-[10px] font-bold text-stone-500 uppercase mb-1">Editor:</div>
                    <textarea
                      ref={textareaRef}
                      rows={12}
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full bg-transparent border-0 focus:outline-none p-1 text-stone-900 font-serif text-sm leading-relaxed"
                    />
                  </div>
                  <div className="pl-1 overflow-y-auto max-h-[350px]">
                    <div className="text-[10px] font-bold text-stone-500 uppercase mb-1">Formatted Preview:</div>
                    <RichTextRenderer content={content} fontFamily={fontFamily} />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Activity description */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Activity Done at this Location (Optional)
            </label>
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="e.g. Soaking in natural mineral hot springs, 10km trail run, Starlink setup"
              className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-900 text-xs"
            />
          </div>

          {/* Cover Photo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-stone-700">
                Cover Photo
              </label>
              <span className="text-[11px] text-stone-500 font-sans">
                Drag from iPhoto / folder or browse files
              </span>
            </div>

            {/* Drag & Drop Cover Photo Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingCover(true);
              }}
              onDragLeave={() => setIsDraggingCover(false)}
              onDrop={handleCoverDrop}
              className={`border-2 border-dashed rounded-2xl p-4 transition text-center ${
                isDraggingCover 
                  ? 'border-blue-900 bg-blue-50/80 scale-101 shadow-md' 
                  : 'border-stone-300 bg-stone-50 hover:bg-stone-100/70'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-800">
                      {isDraggingCover ? '✨ Drop photo to set as Cover!' : 'Drag & Drop Cover Photo Here'}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Direct from iPhoto, Apple Photos, or computer files
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="cursor-pointer px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition shrink-0">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Browse Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-200/80 flex items-center gap-2">
                <span className="text-[11px] text-stone-400 shrink-0">Or URL:</span>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="/hot spring.jpeg or https://..."
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-stone-900 text-xs focus:outline-none focus:border-blue-900"
                />
              </div>
            </div>

            {coverImage && (
              <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-xs text-white text-[10px] rounded-md font-semibold">
                  Cover Photo Preview
                </div>
              </div>
            )}
          </div>

          {/* Specific Highlight based on Category */}
          {category === 'henri_milestones' && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
              <label className="block font-bold text-rose-900 flex items-center gap-1.5">
                <Baby className="w-4 h-4 text-rose-700" />
                <span>Henri’s Specific Milestone on this Entry</span>
              </label>
              <input
                type="text"
                value={henriHighlight}
                onChange={(e) => setHenriHighlight(e.target.value)}
                placeholder="e.g. Henri’s very first swim in Liard Hot Springs in pouring rain"
                className="w-full bg-white border border-rose-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-700 text-xs"
              />
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-rose-800">Henri’s Age at this date:</span>
                <input
                  type="text"
                  value={henriAge}
                  onChange={(e) => setHenriAge(e.target.value)}
                  placeholder="e.g. 2.5 months"
                  className="w-32 bg-white border border-rose-300 rounded-lg px-2 py-1 text-xs"
                />
              </div>
            </div>
          )}

          {category === 'adventures_mba' && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
              <label className="block font-bold text-blue-950 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-900" />
                <span>MBA / Expedition Operations Note</span>
              </label>
              <input
                type="text"
                value={mbaHighlight}
                onChange={(e) => setMbaHighlight(e.target.value)}
                placeholder="e.g. Live operations management: troubleshooting errands, Starlink logistics, and gear prep on the road."
                className="w-full bg-white border border-blue-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-900 text-xs"
              />
            </div>
          )}

          {category === 'visits_along_the_way' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <label className="block font-bold text-emerald-950 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Who We Visited / Reconnected With</span>
              </label>
              <input
                type="text"
                value={visitorHighlight}
                onChange={(e) => setVisitorHighlight(e.target.value)}
                placeholder="e.g. Visited Uncle Eddy & Anne in Red Deer, Thiessen family farm in DeBolt, and friends Nadia & Mark in Edmonton"
                className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs"
              />
            </div>
          )}

          {/* Expedition Gallery Photos */}
          <div className="bg-white border border-stone-300 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-900" />
                <span>Expedition Photo Gallery ({gallery.length} photos)</span>
              </div>
              <span className="text-[11px] text-stone-500">
                Drag multiple photos from iPhoto / desktop folder
              </span>
            </div>

            {/* Multi-Photo Drag and Drop Target for Gallery */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingGallery(true);
              }}
              onDragLeave={() => setIsDraggingGallery(false)}
              onDrop={handleGalleryDrop}
              className={`border-2 border-dashed rounded-2xl p-4 text-center transition ${
                isDraggingGallery 
                  ? 'border-emerald-700 bg-emerald-50/80 scale-101 shadow-md' 
                  : 'border-stone-300 bg-stone-50 hover:bg-stone-100/70'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-800">
                      {isDraggingGallery ? '✨ Release to add photos to gallery!' : 'Drag & Drop Gallery Photos Here'}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Supports dropping multiple photos at once from Apple Photos or folders
                    </div>
                  </div>
                </div>

                <label className="cursor-pointer px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition shrink-0">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Choose Multiple Photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleGalleryFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* List existing gallery photos */}
            {gallery.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {gallery.map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 p-2.5 border border-stone-200 rounded-xl bg-stone-50 shadow-2xs">
                    <img src={item.url} alt="Gallery item" className="w-16 h-16 object-cover rounded-lg shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <input
                        type="text"
                        value={item.caption}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGallery(prev => prev.map((g, i) => i === idx ? { ...g, caption: val } : g));
                        }}
                        placeholder="Photo caption..."
                        className="w-full bg-white border border-stone-200 rounded-md px-2 py-0.5 text-xs text-stone-900"
                      />
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-stone-400 capitalize">{item.type || 'Photo'}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryPhoto(idx)}
                          className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add single photo via URL */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
              <div className="text-[11px] font-bold text-stone-700">Or Paste Image URL:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  placeholder="https://... or /photo.jpeg"
                  className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newGalleryCaption}
                    onChange={(e) => setNewGalleryCaption(e.target.value)}
                    placeholder="Caption (e.g. Henri swimming in Liard Hot Springs)"
                    className="flex-1 bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryPhoto}
                    disabled={!newGalleryUrl.trim()}
                    className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-semibold shrink-0 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map Coordinates */}
          <div className="bg-white border border-stone-300 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="flex items-center gap-2 font-bold text-stone-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addLocationPing}
                  onChange={(e) => setAddLocationPing(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900 border-stone-300"
                />
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Update Interactive Map Waypoint for this location</span>
                </span>
              </label>

              {addLocationPing && (
                <button
                  type="button"
                  onClick={() => {
                    if (liveLocation) {
                      setLatitude(liveLocation.lat);
                      setLongitude(liveLocation.lng);
                    }
                  }}
                  className="text-[11px] text-blue-900 hover:text-blue-950 font-semibold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Use Live GPS Coordinates</span>
                </button>
              )}
            </div>

            {addLocationPing && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-200">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Expedition Leg</label>
                  <select
                    value={journeyLeg}
                    onChange={(e) => setJourneyLeg(e.target.value as JourneyLeg)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs font-medium"
                  >
                    <option value="arctic_yukon">❄️ Arctic & Yukon</option>
                    <option value="arctic_dempster">❄️ Dempster Highway</option>
                    <option value="rockies_pacific">🌲 Rockies & Pacific NW</option>
                    <option value="baja_mexico">🌵 Baja & Mexico</option>
                    <option value="central_america">🌋 Central America</option>
                    <option value="andes_patagonia">🏔️ Andes & Patagonia</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* GOOGLE / GEMINI LOCATION INSIGHTS */}
          <div className="bg-blue-50/70 border border-blue-200/90 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-blue-950 text-xs">
                  <Sparkles className="w-4 h-4 text-blue-800" />
                  <span>Google Location & Activity Insights</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Pull population, cultural background, and interesting local facts about {locationName || 'this location'}.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePullLocationInsights}
                disabled={isPullingInsights || !locationName.trim()}
                className="px-4 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition shrink-0 disabled:opacity-50"
              >
                {isPullingInsights ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Fetching info...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Pull Google Insights</span>
                  </>
                )}
              </button>
            </div>

            {insightsError && (
              <p className="text-[11px] text-rose-600 font-medium">{insightsError}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-200/60">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
                  Population Size
                </label>
                <input
                  type="text"
                  value={population}
                  onChange={(e) => setPopulation(e.target.value)}
                  placeholder="e.g. 28,000 residents"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">
                  Cultural Context / Territory
                </label>
                <input
                  type="text"
                  value={culturalContext}
                  onChange={(e) => setCulturalContext(e.target.value)}
                  placeholder="e.g. Traditional territory of Kwanlin Dün First Nation"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs"
                />
              </div>
            </div>

            {/* Interesting Facts */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-stone-700">
                Interesting Facts about this Place
              </label>
              {interestingFacts.map((fact, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white border border-stone-200 px-3 py-1.5 rounded-xl text-xs text-stone-800">
                  <span className="text-blue-900 font-bold">•</span>
                  <span className="flex-1">{fact}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFact(idx)}
                    className="text-stone-400 hover:text-rose-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newFactInput}
                  onChange={(e) => setNewFactInput(e.target.value)}
                  placeholder="Add an interesting fact..."
                  className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-stone-900 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddFact}
                  className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold"
                >
                  Add Fact
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Save & Update Journal Entry' : (status === 'published' ? 'Publish Journal Entry' : 'Save as Private Draft')}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

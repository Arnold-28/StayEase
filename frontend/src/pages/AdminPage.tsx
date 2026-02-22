import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, ImagePlus, X, Save,
  MapPin, Users, Bed, Bath, Phone, User, IndianRupee,
  ChevronDown, ChevronUp, Eye, Lock, AlertCircle,
} from 'lucide-react';
import { usePropertyStore } from '../store/propertyStore';
import type { GalleryItem } from '../components/GallerySection';

/* ── Admin password ── */
const ADMIN_PASSWORD = '6366348462';

/* ── Helpers ── */
const readFileAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const emptyForm = (): GalleryItem & { _id: string } => ({
  _id: crypto.randomUUID?.() ?? String(Date.now()),
  mainImage: '',
  images: [],
  title: '',
  description: '',
  location: '',
  guests: 12,
  bedrooms: 4,
  bathrooms: 4,
  price: 999,
  priceNote: 'For discounts, contact the host directly. Payment is done by negotiation.',
  hostName: 'Sudheeksh Kharvi',
  hostPhone: '8431956616',
  longDescription: '',
  stayDetails: [],
  meals: [],
  activities: [],
  nearbyPlaces: [],
  amenities: [],
} as GalleryItem & { _id: string });

/* ── Reusable input classes ── */
const inputCls =
  'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-[#E50914]/60 focus:ring-1 focus:ring-[#E50914]/30 transition-all text-sm';
const labelCls = 'block text-xs font-medium text-white/50 mb-1.5';
const btnCls =
  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all';

/* ────────────────────────────────────────────── */
/*  Tag-list editor (for activities, amenities…)  */
/* ────────────────────────────────────────────── */
const TagEditor: React.FC<{
  label: string;
  placeholder: string;
  value: string[];
  onChange: (v: string[]) => void;
}> = ({ label, placeholder, value, onChange }) => {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput('');
    }
  };
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          className={inputCls}
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button type="button" onClick={add} className={`${btnCls} bg-[#E50914]/20 text-[#E50914] hover:bg-[#E50914]/30`}>
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-white/10 text-white/70 text-xs px-2.5 py-1 rounded-full">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="hover:text-[#E50914]">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────── */
/*  Meal section editor                           */
/* ────────────────────────────────────────────── */
const MealEditor: React.FC<{
  meals: { title: string; items: string[] }[];
  onChange: (m: { title: string; items: string[] }[]) => void;
}> = ({ meals, onChange }) => {
  const [newTitle, setNewTitle] = useState('');
  const addMeal = () => {
    if (newTitle.trim()) {
      onChange([...meals, { title: newTitle.trim(), items: [] }]);
      setNewTitle('');
    }
  };
  const updateItems = (idx: number, items: string[]) => {
    const updated = [...meals];
    updated[idx] = { ...updated[idx], items };
    onChange(updated);
  };
  const removeMeal = (idx: number) => onChange(meals.filter((_, i) => i !== idx));

  return (
    <div>
      <label className={labelCls}>Meals</label>
      {meals.map((meal, idx) => (
        <div key={idx} className="mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/80">{meal.title}</span>
            <button type="button" onClick={() => removeMeal(idx)} className="text-white/30 hover:text-[#E50914]">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <TagEditor label="" placeholder="Add meal item…" value={meal.items} onChange={(items) => updateItems(idx, items)} />
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <input
          className={inputCls}
          placeholder="Meal section name (e.g. Breakfast, Dinner)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMeal(); } }}
        />
        <button type="button" onClick={addMeal} className={`${btnCls} bg-[#E50914]/20 text-[#E50914] hover:bg-[#E50914]/30 whitespace-nowrap`}>
          <Plus className="w-3.5 h-3.5" /> Add Meal
        </button>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────── */
/*  Image uploader                                */
/* ────────────────────────────────────────────── */
const ImageUploader: React.FC<{
  label: string;
  images: string[];
  onChange: (imgs: string[]) => void;
  max?: number;
  single?: boolean;
}> = ({ label, images, onChange, max = 4, single = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const newImages: string[] = [];
    for (let i = 0; i < files.length && (single ? newImages.length < 1 : images.length + newImages.length < max); i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await readFileAsDataURL(file);
      newImages.push(dataUrl);
    }
    if (single) {
      onChange(newImages);
    } else {
      onChange([...images, ...newImages].slice(0, max));
    }
  };

  return (
    <div>
      <label className={labelCls}>{label} {!single && `(${images.length}/${max})`}</label>
      <div className="flex flex-wrap gap-3 mb-2">
        {images.map((src, i) => (
          <div key={i} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-white/10">
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        ))}
        {(single ? images.length < 1 : images.length < max) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-white/20 hover:border-[#E50914]/50 flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <ImagePlus className="w-5 h-5 text-white/30" />
            <span className="text-[10px] text-white/30">Upload</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={!single}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
};

/* ════════════════════════════════════════════════ */
/*  PASSWORD GATE                                    */
/* ════════════════════════════════════════════════ */
const AdminGate: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true');
      onSuccess();
    } else {
      setError('Incorrect password. Access denied.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl w-full max-w-sm p-8"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#E50914]/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-[#E50914]" />
          </div>
          <h2 className="text-xl font-bold text-white">Admin Access</h2>
          <p className="text-white/40 text-sm mt-1">Enter the admin password to continue</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-[#E50914]/10 border border-[#E50914]/20 rounded-lg flex items-center gap-2 text-[#E50914] text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-white/30" />
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter admin password"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-[#E50914]/60 focus:ring-1 focus:ring-[#E50914]/30 transition-all text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#E50914] hover:bg-[#b8070f] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            Access Admin Panel
          </button>
        </form>

        <Link to="/" className="block text-center mt-4 text-xs text-white/30 hover:text-white/60 transition-colors">
          &larr; Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

/* ════════════════════════════════════════════════ */
/*  ADMIN PAGE                                      */
/* ════════════════════════════════════════════════ */
export const AdminPage: React.FC = () => {
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem('admin_auth') === 'true');
  const { customTiles, addTile, removeTile, loadTiles } = usePropertyStore();
  const [form, setForm] = useState(emptyForm());
  const [mainImageArr, setMainImageArr] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [saved, setSaved] = useState('');
  const [expandedTile, setExpandedTile] = useState<number | null>(null);

  useEffect(() => { loadTiles(); }, []);

  if (!isAuthed) return <AdminGate onSuccess={() => setIsAuthed(true)} />;

  const updateField = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.title.trim()) { alert('Title is required'); return; }
    if (mainImageArr.length === 0) { alert('Please upload a main image'); return; }

    const tile: GalleryItem = {
      ...form,
      mainImage: mainImageArr[0],
      images: galleryImages,
    };
    // Remove internal _id before saving
    delete (tile as unknown as Record<string, unknown>)._id;

    addTile(tile);
    setForm(emptyForm());
    setMainImageArr([]);
    setGalleryImages([]);
    setSaved('Homestay tile created successfully!');
    setTimeout(() => setSaved(''), 3000);
  };

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Top bar */}
      <div className="bg-[#0a0a0a] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-white/40">Create & manage homestay tiles</p>
            </div>
          </div>
          <Link to="/" className="text-2xl font-black text-[#E50914]">STAYEASE</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        {/* Success toast */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {saved}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Existing custom tiles ── */}
        {customTiles.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-white mb-4">
              Your Custom Tiles ({customTiles.length})
            </h2>
            <div className="space-y-3">
              {customTiles.map((tile, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedTile(expandedTile === idx ? null : idx)}
                  >
                    {tile.mainImage && (
                      <img src={tile.mainImage} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">{tile.title}</h3>
                      <p className="text-xs text-white/40 truncate">{tile.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                        {tile.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{tile.location}</span>}
                        {tile.price && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />₹{tile.price}/night</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); if (confirm('Delete this tile?')) removeTile(idx); }}
                        className="p-2 text-white/30 hover:text-[#E50914] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedTile === idx ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedTile === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-white/5 pt-3">
                          {/* Preview gallery */}
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {tile.mainImage && <img src={tile.mainImage} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border-2 border-[#E50914]/50" />}
                            {tile.images.map((img, i) => (
                              <img key={i} src={img} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                            ))}
                          </div>
                          {tile.longDescription && <p className="text-xs text-white/50 mt-2 line-clamp-3">{tile.longDescription}</p>}
                          <div className="flex flex-wrap gap-4 mt-3 text-xs text-white/40">
                            {tile.guests && <span><Users className="w-3 h-3 inline mr-1" />{tile.guests} guests</span>}
                            {tile.bedrooms && <span><Bed className="w-3 h-3 inline mr-1" />{tile.bedrooms} beds</span>}
                            {tile.bathrooms && <span><Bath className="w-3 h-3 inline mr-1" />{tile.bathrooms} baths</span>}
                            {tile.hostName && <span><User className="w-3 h-3 inline mr-1" />{tile.hostName}</span>}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Create new tile form ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E50914]/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#E50914]" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-white">Create New Homestay Tile</h2>
                <p className="text-xs text-white/40">Add a new property to the gallery</p>
              </div>
            </div>
            {showForm ? <ChevronUp className="w-5 h-5 text-white/30" /> : <ChevronDown className="w-5 h-5 text-white/30" />}
          </button>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-8 space-y-6 border-t border-white/5 pt-6">

                  {/* ── Section: Basic info ── */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className={labelCls}>Title *</label>
                        <input className={inputCls} placeholder="Nature View Homestay" value={form.title}
                          onChange={(e) => updateField('title', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelCls}>Short Description</label>
                        <input className={inputCls} placeholder="In the midst of nature — Chikmagalur, Karnataka" value={form.description}
                          onChange={(e) => updateField('description', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelCls}>Long Description</label>
                        <textarea className={inputCls + ' min-h-[80px] resize-y'} placeholder="Detailed description of the homestay…"
                          value={form.longDescription || ''}
                          onChange={(e) => updateField('longDescription', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                          <input className={inputCls + ' !pl-10'} placeholder="Chikmagalur, Karnataka, India" value={form.location || ''}
                            onChange={(e) => updateField('location', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Section: Images ── */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Images</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ImageUploader label="Main Image *" images={mainImageArr} onChange={setMainImageArr} max={1} single />
                      <ImageUploader label="Gallery Images" images={galleryImages} onChange={setGalleryImages} max={4} />
                    </div>
                  </div>

                  {/* ── Section: Property details ── */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Property Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className={labelCls}>Guests</label>
                        <div className="relative">
                          <Users className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                          <input type="number" min={1} className={inputCls + ' !pl-10'} value={form.guests || ''}
                            onChange={(e) => updateField('guests', Number(e.target.value))} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Bedrooms</label>
                        <div className="relative">
                          <Bed className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                          <input type="number" min={1} className={inputCls + ' !pl-10'} value={form.bedrooms || ''}
                            onChange={(e) => updateField('bedrooms', Number(e.target.value))} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Bathrooms</label>
                        <div className="relative">
                          <Bath className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                          <input type="number" min={1} className={inputCls + ' !pl-10'} value={form.bathrooms || ''}
                            onChange={(e) => updateField('bathrooms', Number(e.target.value))} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Price (₹/night)</label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                          <input type="number" min={0} className={inputCls + ' !pl-10'} value={form.price || ''}
                            onChange={(e) => updateField('price', Number(e.target.value))} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className={labelCls}>Price Note</label>
                      <input className={inputCls} placeholder="For discounts, contact the host…" value={form.priceNote || ''}
                        onChange={(e) => updateField('priceNote', e.target.value)} />
                    </div>
                  </div>

                  {/* ── Section: Host info ── */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Host Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Host Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                          <input className={inputCls + ' !pl-10'} placeholder="Sudheeksh Kharvi" value={form.hostName || ''}
                            onChange={(e) => updateField('hostName', e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Host Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                          <input className={inputCls + ' !pl-10'} placeholder="8431956616" value={form.hostPhone || ''}
                            onChange={(e) => updateField('hostPhone', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Section: Stay details ── */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Stay Details & Amenities</h3>
                    <div className="space-y-5">
                      <TagEditor
                        label="Stay Details (room types, facilities)"
                        placeholder="e.g. Premium Classic Rooms (without AC)"
                        value={form.stayDetails || []}
                        onChange={(v) => updateField('stayDetails', v)}
                      />
                      <TagEditor
                        label="Amenities"
                        placeholder="e.g. Free parking, Kitchen, WiFi"
                        value={form.amenities || []}
                        onChange={(v) => updateField('amenities', v)}
                      />
                      <TagEditor
                        label="Activities"
                        placeholder="e.g. Carrom, Chess, Campfire"
                        value={form.activities || []}
                        onChange={(v) => updateField('activities', v)}
                      />
                      <TagEditor
                        label="Nearby Places"
                        placeholder="e.g. Mullayanagiri Hills"
                        value={form.nearbyPlaces || []}
                        onChange={(v) => updateField('nearbyPlaces', v)}
                      />
                    </div>
                  </div>

                  {/* ── Section: Meals ── */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Meals</h3>
                    <MealEditor meals={form.meals || []} onChange={(m) => updateField('meals', m)} />
                  </div>

                  {/* ── Submit ── */}
                  <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      className="flex items-center gap-2 btn-netflix !rounded-lg !px-8 !py-3 text-sm"
                    >
                      <Save className="w-4 h-4" />
                      Create Homestay Tile
                    </motion.button>
                    <Link to="/" className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
                      <Eye className="w-4 h-4" /> View on Homepage
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

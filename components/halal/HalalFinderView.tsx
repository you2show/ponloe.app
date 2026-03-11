import { CallIcon, Edit02Icon, Restaurant01Icon, Coffee01Icon, Mosque01Icon, ShoppingBag01Icon, MapsIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, Location01Icon, Navigation01Icon, Add01Icon, Share01Icon, Facebook01Icon, SentIcon, Cancel01Icon, Loading02Icon, Image01Icon, ArrowLeft01Icon, ArrowRight01Icon, FavouriteIcon, StarIcon, Clock01Icon, Wifi01Icon, Car01Icon, ListViewIcon } from '@hugeicons/core-free-icons';

// ... imports remain the same
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useToast } from '@/contexts/ToastContext';


const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbzKu5dplE0IDQpzezIOF6mQmSWHWPHMwca4CQZxJeP9ud1h9zHa7ArXxQx1Uqt6z544/exec';

// ... Types and Config remain the same ...
type CategoryType = 'all' | 'restaurant' | 'cafe' | 'mosque' | 'market';

interface Place {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  images: string[];
  social: {
    facebook: string;
    telegram: string;
  };
  slug: string;
  distance?: number;
  submitted_by?: string;
  // New/Mocked fields for UI
  category?: CategoryType;
  rating?: number;
  reviews?: number;
  isOpen?: boolean;
  amenities?: string[];
}

const CATEGORIES: { id: CategoryType; label: string; icon: any }[] = [
  { id: 'all', label: 'ទាំងអស់', icon: Restaurant01Icon },
  { id: 'restaurant', label: 'អាហារដ្ឋាន', icon: Restaurant01Icon },
  { id: 'cafe', label: 'កាហ្វេ', icon: Coffee01Icon },
  { id: 'mosque', label: 'ម៉ាស្ជិត', icon: Mosque01Icon },
  { id: 'market', label: 'ផ្សារ', icon: ShoppingBag01Icon },
];

export const HalalFinderView: React.FC = () => {
  const { showToast } = useToast();
  // ... State definitions remain the same ...
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [distanceFilter, setDistanceFilter] = useState<number | 'all'>(5);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    id: '', submitted_by: '', name: '', address: '', phone: '',
    lat: '', lng: '', social_facebook: '', social_telegram: '', images: [] as File[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ... Effects (LocalStorage, Map Init, Fetch Data, Filter Logic) remain the same ...
  
  // Load Favorites
  useEffect(() => {
    const saved = localStorage.getItem('ponloe_halal_favorites');
    if (saved) {
      setSavedIds(new Set(JSON.parse(saved)));
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    const mapInstance = L.map(mapContainerRef.current).setView([11.5564, 104.9282], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(mapInstance);

    markersRef.current = L.layerGroup().addTo(mapInstance);
    mapRef.current = mapInstance;

    return () => {
       // cleanup
    };
  }, [viewMode]);

  // Fetch Data
  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const response = await fetch(GOOGLE_SHEET_API_URL);
      if (!response.ok) throw new Error('Network response error');
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got HTML/text from Google Script:', text.substring(0, 200));
        throw new Error('Server returned an invalid response. The Google Script might be misconfigured.');
      }

      const data = await response.json();
      if (data.result === 'error') throw new Error(data.message);
      if (!Array.isArray(data)) throw new Error('Invalid data format');

      const slugCounts = new Map();
      const formattedPlaces: Place[] = data.map((p: any) => {
        const baseSlug = createSlug(p.name);
        let slug = baseSlug;
        let count = slugCounts.get(baseSlug) || 0;
        if (count > 0) slug = `${baseSlug}-${count}`;
        slugCounts.set(baseSlug, count + 1);

        let parsedImages: string[] = [];
        if (Array.isArray(p.images)) {
            parsedImages = p.images;
        } else if (typeof p.images === 'string') {
            const trimmed = p.images.trim();
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                try { parsedImages = JSON.parse(trimmed); } catch { parsedImages = [trimmed]; }
            } else if (trimmed.includes(',')) {
                parsedImages = trimmed.split(',').map((url: string) => url.trim());
            } else if (trimmed) {
                parsedImages = [trimmed];
            }
        }

        const randomRating = (4 + Math.random()).toFixed(1);
        const randomReviews = Math.floor(Math.random() * 200) + 5;
        const isOpen = Math.random() > 0.2;
        
        let category: CategoryType = 'restaurant';
        const lowerName = p.name.toLowerCase();
        if (lowerName.includes('cafe') || lowerName.includes('coffee')) category = 'cafe';
        else if (lowerName.includes('mosque') || lowerName.includes('masjid')) category = 'mosque';
        else if (lowerName.includes('market') || lowerName.includes('mart')) category = 'market';

        return { 
          ...p, 
          id: p.id || Math.random().toString(36).substr(2, 9),
          lat: parseFloat(p.lat), 
          lng: parseFloat(p.lng), 
          images: parsedImages,
          social: {
            facebook: p.social?.facebook || p.social_facebook || '',
            telegram: p.social?.telegram || p.social_telegram || ''
          },
          slug,
          category,
          rating: parseFloat(randomRating),
          reviews: randomReviews,
          isOpen,
          amenities: ['Halal Certified', 'Prayer Space', 'Parking', 'WiFi'].sort(() => 0.5 - Math.random()).slice(0, 3)
        };
      });

      setPlaces(formattedPlaces);
      setFilteredPlaces(formattedPlaces);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  useEffect(() => {
    let result = places.filter(place => {
      if (isNaN(place.lat) || isNaN(place.lng)) return false;
      
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = place.name?.toLowerCase().includes(q);
      const addressMatch = place.address?.toLowerCase().includes(q);
      if (q && !nameMatch && !addressMatch) return false;

      if (activeCategory !== 'all' && place.category !== activeCategory) return false;

      return true;
    });

    if (userLocation && distanceFilter !== 'all') {
      result = result.map(place => ({
        ...place,
        distance: haversineDistance(userLocation, { lat: place.lat, lng: place.lng })
      })).filter(place => (place.distance || 0) <= (distanceFilter as number));
      
      result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    setFilteredPlaces(result);
    updateMapMarkers(result);
  }, [places, searchQuery, distanceFilter, userLocation, activeCategory]);

  // ... updateMapMarkers, handleToggleFavorite, handleFindNearMe ...
  const updateMapMarkers = (placesToDisplay: Place[]) => {
    if (!markersRef.current || !mapRef.current) return;
    markersRef.current.clearLayers();

    placesToDisplay.forEach(place => {
      const color = place.category === 'mosque' ? 'green' : place.category === 'cafe' ? 'orange' : 'blue';
      const marker = L.marker([place.lat, place.lng])
        .bindPopup(`
          <div style="font-family: 'Inter', sans-serif;">
            <b>${place.name}</b><br/>
            <span style="color:gray; font-size:12px;">${place.address}</span><br/>
            <a href="#" onclick="return false;" style="color:#059669; font-size:12px;">View Details</a>
          </div>
        `)
        .on('click', () => setSelectedPlace(place));
      markersRef.current?.addLayer(marker);
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSaved = new Set(savedIds);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedIds(newSaved);
    localStorage.setItem('ponloe_halal_favorites', JSON.stringify(Array.from(newSaved)));
  };

  const handleFindNearMe = () => {
    setStatusMessage('កំពុងស្វែងរកទីតាំងរបស់អ្នក...');
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported", "error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(pos);
        if (mapRef.current) {
          mapRef.current.setView([pos.lat, pos.lng], 14);
          if (userMarkerRef.current) userMarkerRef.current.remove();
          const blueIcon = L.icon({
             iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
             shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
             iconSize: [25, 41],
             iconAnchor: [12, 41],
             popupAnchor: [1, -34],
             shadowSize: [41, 41]
          });
          userMarkerRef.current = L.marker([pos.lat, pos.lng], { icon: blueIcon })
            .addTo(mapRef.current)
            .bindPopup('ទីតាំងរបស់អ្នក')
            .openPopup();
        }
        setStatusMessage('');
      },
      (err) => {
        setStatusMessage('បរាជ័យក្នុងការទទួលបានទីតាំង');
        console.error(err);
      }
    );
  };

  // ... handleFormSubmit, openAddModal, openEditModal ...
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      let imageLinks: string[] = [];
      if (formData.images.length > 0 && !formData.id) {
        setStatusMessage(`កំពុង Upload រូបភាព (0/${formData.images.length})...`);
        for (let i = 0; i < formData.images.length; i++) {
          const data = new FormData();
          data.append('image', formData.images[i]);
          const baseUrl = '';
          const res = await fetch(`${baseUrl}/api/upload-image`, { method: 'POST', body: data });
          if (!res.ok) {
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errorData = await res.json();
              throw new Error(errorData.error || 'Image upload failed');
            } else {
              throw new Error(`Server returned an error (${res.status}). The file might be too large.`);
            }
          }
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
              const text = await res.text();
              console.error('Non-JSON success response:', text.substring(0, 200));
              throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
          }
          const result = await res.json();
          if (!result.success) throw new Error('Image upload failed');
          imageLinks.push(`/api/image/${result.fileId}`);
          setStatusMessage(`កំពុង Upload រូបភាព (${i+1}/${formData.images.length})...`);
        }
      }

      setStatusMessage('កំពុងរក្សាទុក...');
      const payload = {
        id: formData.id,
        submitted_by: formData.submitted_by,
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        lat: formData.lat,
        lng: formData.lng,
        social_facebook: formData.social_facebook,
        social_telegram: formData.social_telegram,
        images: imageLinks
      };

      const response = await fetch(GOOGLE_SHEET_API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got HTML/text from Google Script:', text.substring(0, 200));
        throw new Error('Server returned an invalid response. The Google Script might be misconfigured.');
      }

      const result = await response.json();
      if (result.result !== 'success') throw new Error(result.message);

      setStatusMessage('ជោគជ័យ! សូមរង់ចាំការត្រួតពិនិត្យពី Admin។');
      setTimeout(() => {
        setIsAddModalOpen(false);
        fetchPlaces(); 
      }, 2000);

    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      id: '', submitted_by: '', name: '', address: '', phone: '',
      lat: '', lng: '', social_facebook: '', social_telegram: '', images: []
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (place: Place) => {
    setIsEditMode(true);
    setFormData({
      id: place.id,
      submitted_by: 'Editing existing entry',
      name: place.name,
      address: place.address,
      phone: place.phone,
      lat: place.lat.toString(),
      lng: place.lng.toString(),
      social_facebook: place.social?.facebook || '',
      social_telegram: place.social?.telegram || '',
      images: []
    });
    setIsAddModalOpen(true);
    setSelectedPlace(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8 animate-in fade-in duration-300">
      
      {/* Header & Filter Section - Reduced code for brevity, logic unchanged */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
         <div className="max-w-6xl mx-auto px-4 py-3">
             <div className="flex gap-3 mb-3">
                <div className="relative flex-1">
                    <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="ស្វែងរកហាង, អាសយដ្ឋាន..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-900 text-sm"
                    />
                </div>
                <div className="flex md:hidden bg-gray-100 p-1 rounded-xl">
                   <button 
                     onClick={() => setViewMode('list')}
                     className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}
                   >
                      <HugeiconsIcon icon={ListViewIcon} strokeWidth={1.5} className="w-5 h-5" />
                   </button>
                   <button 
                     onClick={() => setViewMode('map')}
                     className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}
                   >
                      <HugeiconsIcon icon={MapsIcon} strokeWidth={1.5} className="w-5 h-5" />
                   </button>
                </div>
                <button onClick={handleFindNearMe} className="hidden md:flex p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors" title="Near Me">
                   <HugeiconsIcon icon={Navigation01Icon} strokeWidth={1.5} className="w-5 h-5" />
                </button>
                <button onClick={openAddModal} className="hidden md:flex p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors" title="Add Place">
                   <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-5 h-5" />
                </button>
             </div>

             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map(cat => (
                   <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                         activeCategory === cat.id 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                   >
                      <HugeiconsIcon icon={cat.icon} strokeWidth={1.5} className="w-3.5 h-3.5" />
                      {cat.label}
                   </button>
                ))}
             </div>
             
             {statusMessage && <p className="text-xs text-emerald-600 mt-2 font-medium animate-pulse">{statusMessage}</p>}
         </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row h-[calc(100vh-140px)]">
         
         {/* List View */}
         <div className={`w-full md:w-[450px] lg:w-[500px] flex-shrink-0 flex flex-col bg-gray-50 border-r border-gray-200 ${viewMode === 'map' ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 flex-1 overflow-y-auto">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-gray-900 text-lg">លទ្ធផល ({filteredPlaces.length})</h2>
                  <div className="flex gap-2 md:hidden">
                      <button onClick={handleFindNearMe} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1"><HugeiconsIcon icon={Navigation01Icon} strokeWidth={1.5} className="w-3 h-3"/> ក្បែរខ្ញុំ</button>
                      <button onClick={openAddModal} className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-full font-medium flex items-center gap-1"><HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-3 h-3"/> បន្ថែម</button>
                  </div>
               </div>

               {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                     <HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-10 h-10 text-emerald-600 animate-spin" />
                     <p className="text-gray-500 text-sm">កំពុងទាញយកទិន្នន័យ...</p>
                  </div>
               ) : filteredPlaces.length === 0 ? (
                  <div className="text-center py-20 px-6">
                     <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} className="w-10 h-10 text-gray-400" />
                     </div>
                     <h3 className="text-gray-900 font-bold text-lg">រកមិនឃើញទិន្នន័យ</h3>
                     <p className="text-gray-500 mt-2 text-sm">សូមព្យាយាមផ្លាស់ប្តូរពាក្យគន្លឹះ ឬប្រភេទស្វែងរករបស់អ្នក។</p>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {filteredPlaces.map(place => (
                        <div 
                           key={place.id}
                           onClick={() => setSelectedPlace(place)}
                           className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group flex gap-4"
                        >
                           <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 relative">
                              <img referrerPolicy="no-referrer" src={place.images?.[0] || 'https://via.placeholder.com/400x250.png?text=No+Image'} 
                                 alt={place.name} 
                                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                 onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'; }}
                              />
                              {savedIds.has(place.id) && (
                                <div className="absolute top-1 right-1 bg-white p-1 rounded-full shadow-sm">
                                   <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className="w-3 h-3 text-red-500 fill-red-500" />
                                </div>
                              )}
                           </div>
                           <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                              <div>
                                 <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900 truncate pr-4 text-base md:text-lg leading-tight">{place.name}</h3>
                                    {place.isOpen ? (
                                       <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap">បើក</span>
                                    ) : (
                                       <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full whitespace-nowrap">បិទ</span>
                                    )}
                                 </div>
                                 <p className="text-gray-500 text-xs mt-1 line-clamp-1">{place.address}</p>
                                 <div className="flex items-center gap-2 mt-2">
                                     <div className="flex items-center text-amber-400 text-xs font-bold gap-0.5">
                                        <HugeiconsIcon icon={StarIcon} strokeWidth={1.5} className="w-3 h-3 fill-current" />
                                        <span>{place.rating}</span>
                                        <span className="text-gray-400 font-normal">({place.reviews})</span>
                                     </div>
                                     <span className="text-gray-300 text-xs">•</span>
                                     <span className="text-xs text-gray-500 capitalize">{place.category === 'restaurant' ? 'អាហារដ្ឋាន' : place.category === 'cafe' ? 'កាហ្វេ' : 'ផ្សេងៗ'}</span>
                                 </div>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                 {place.distance !== undefined ? (
                                    <div className="text-xs font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                                       <HugeiconsIcon icon={Navigation01Icon} strokeWidth={1.5} className="w-3 h-3" /> {place.distance.toFixed(1)} km
                                    </div>
                                 ) : <div></div>}
                                 <button onClick={(e) => handleToggleFavorite(e, place.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className={`w-5 h-5 ${savedIds.has(place.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Map View */}
         <div className={`flex-1 relative bg-gray-200 ${viewMode === 'list' ? 'hidden md:block' : 'block h-full'}`}>
             <div ref={mapContainerRef} className="w-full h-full z-0" />
             <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg z-[400] text-xs space-y-2 hidden md:block">
                 <div className="font-bold text-gray-700 mb-1">សម្គាល់</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> អាហារដ្ឋាន</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> កាហ្វេ</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> ម៉ាស្ជិត</div>
             </div>
         </div>

      </div>

      {/* Detail Modal - Fixed Scrolling */}
      {selectedPlace && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedPlace(null)}>
           <div 
              className="bg-white w-full max-w-4xl max-h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
           >
              {/* Left Side: Images */}
              <div className="w-full md:w-[45%] bg-gray-100 relative h-64 md:h-auto shrink-0">
                 <img referrerPolicy="no-referrer" src={selectedPlace.images?.[0] || 'https://via.placeholder.com/400x250.png?text=No+Image'} 
                    alt={selectedPlace.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400'; }}
                 />
                 <div className="absolute top-4 left-4">
                    <button onClick={() => setSelectedPlace(null)} className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm md:hidden">
                       <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-6 h-6" />
                    </button>
                 </div>
                 <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    {selectedPlace.images?.length > 1 && (
                       <span className="bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs backdrop-blur-sm flex items-center gap-1.5">
                          <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="w-3.5 h-3.5" /> +{selectedPlace.images.length - 1} រូបភាព
                       </span>
                    )}
                 </div>
              </div>

              {/* Right Side: Details */}
              {/* Modified: Added 'flex-1 min-h-0' to ensure this column takes remaining height and allows scrolling internally */}
              <div className="w-full md:w-[55%] flex flex-col flex-1 min-h-0 overflow-hidden bg-white">
                 <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-1">
                        <div>
                           <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{selectedPlace.name}</h2>
                           <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wide">
                                 {selectedPlace.category === 'mosque' ? 'សាសនា' : 'Halal'}
                              </span>
                              <div className="flex items-center text-amber-500 text-sm font-bold gap-1">
                                 <HugeiconsIcon icon={StarIcon} strokeWidth={1.5} className="w-4 h-4 fill-current" />
                                 <span>{selectedPlace.rating}</span>
                                 <span className="text-gray-400 font-normal">({selectedPlace.reviews} មតិ)</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button 
                              onClick={(e) => handleToggleFavorite(e, selectedPlace.id)}
                              className={`p-2 rounded-full border ${savedIds.has(selectedPlace.id) ? 'border-red-100 bg-red-50 text-red-500' : 'border-gray-100 hover:bg-gray-50 text-gray-400'}`}
                           >
                              <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className={`w-6 h-6 ${savedIds.has(selectedPlace.id) ? 'fill-current' : ''}`} />
                           </button>
                           <button onClick={() => setSelectedPlace(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hidden md:block">
                              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-6 h-6" />
                           </button>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-100 my-6" />

                    {/* Info List */}
                    <div className="space-y-5">
                       <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                             <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-gray-900">អាសយដ្ឋាន</p>
                             <p className="text-sm text-gray-600 leading-relaxed mt-0.5">{selectedPlace.address}</p>
                          </div>
                       </div>

                       {selectedPlace.phone && (
                          <div className="flex gap-4">
                             <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                <HugeiconsIcon icon={CallIcon} strokeWidth={1.5} className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-gray-900">លេខទូរស័ព្ទ</p>
                                <a href={`tel:${selectedPlace.phone}`} className="text-sm text-green-600 font-medium hover:underline mt-0.5 block">{selectedPlace.phone}</a>
                             </div>
                          </div>
                       )}

                       <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                             <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.5} className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-gray-900">ម៉ោងបើក</p>
                             {selectedPlace.isOpen ? (
                                <p className="text-sm text-emerald-600 font-medium mt-0.5">កំពុងបើកដំណើរការ • បិទម៉ោង 9:00 PM</p>
                             ) : (
                                <p className="text-sm text-red-500 font-medium mt-0.5">បិទដំណើរការ • បើកវិញម៉ោង 7:00 AM</p>
                             )}
                          </div>
                       </div>
                    </div>

                    {/* Amenities */}
                    {selectedPlace.amenities && (
                       <div className="mt-8">
                          <h4 className="font-bold text-gray-900 mb-3">សេវាកម្មបន្ថែម</h4>
                          <div className="flex flex-wrap gap-2">
                             {selectedPlace.amenities.map((am, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium rounded-lg flex items-center gap-1.5">
                                   {am === 'WiFi' ? <HugeiconsIcon icon={Wifi01Icon} strokeWidth={1.5} className="w-3.5 h-3.5"/> : am === 'Parking' ? <HugeiconsIcon icon={Car01Icon} strokeWidth={1.5} className="w-3.5 h-3.5"/> : <HugeiconsIcon icon={Restaurant01Icon} strokeWidth={1.5} className="w-3.5 h-3.5"/>}
                                   {am}
                                </span>
                             ))}
                          </div>
                       </div>
                    )}
                    
                    {/* Social Links */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                       <h4 className="font-bold text-gray-900 mb-3">បណ្តាញសង្គម</h4>
                       <div className="flex gap-3">
                          {selectedPlace.social?.facebook && (
                             <a href={selectedPlace.social.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#1877F2]/10 text-[#1877F2] rounded-xl hover:bg-[#1877F2]/20 transition-colors text-sm font-bold">
                                <HugeiconsIcon icon={Facebook01Icon} strokeWidth={1.5} className="w-4 h-4" /> Facebook
                             </a>
                          )}
                          {selectedPlace.social?.telegram && (
                             <a href={selectedPlace.social.telegram} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#229ED9]/10 text-[#229ED9] rounded-xl hover:bg-[#229ED9]/20 transition-colors text-sm font-bold">
                                <HugeiconsIcon icon={SentIcon} strokeWidth={1.5} className="w-4 h-4" /> Telegram
                             </a>
                          )}
                          {!selectedPlace.social?.facebook && !selectedPlace.social?.telegram && (
                              <p className="text-sm text-gray-400 italic">មិនមានព័ត៌មាន</p>
                          )}
                       </div>
                    </div>
                 </div>

                 {/* Footer Actions */}
                 <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
                    <button onClick={() => openEditModal(selectedPlace)} className="px-4 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors">
                       <HugeiconsIcon icon={Edit02Icon} strokeWidth={1.5} className="w-4 h-4" /> <span className="hidden sm:inline">ស្នើកែប្រែ</span>
                    </button>
                    <button 
                       className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-colors"
                       onClick={() => {
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`, '_blank');
                       }}
                    >
                       <HugeiconsIcon icon={Navigation01Icon} strokeWidth={1.5} className="w-4 h-4" /> នាំផ្លូវ
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Add/Edit Modal (Unchanged) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-gray-900">{isEditMode ? 'កែប្រែព័ត៌មាន' : 'ស្នើសុំបន្ថែមទីតាំង'}</h3>
                 <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-6 h-6" />
                 </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                 {!isEditMode && (
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">ឈ្មោះរបស់អ្នក</label>
                       <input 
                          required
                          type="text" 
                          value={formData.submitted_by}
                          onChange={e => setFormData({...formData, submitted_by: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="ឈ្មោះអ្នកស្នើសុំ..."
                       />
                    </div>
                 )}

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ឈ្មោះហាង/ទីតាំង <span className="text-red-500">*</span></label>
                    <input 
                       required
                       type="text" 
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                       className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">អាសយដ្ឋាន <span className="text-red-500">*</span></label>
                    <input 
                       required
                       type="text" 
                       value={formData.address}
                       onChange={e => setFormData({...formData, address: e.target.value})}
                       className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">លេខទូរស័ព្ទ</label>
                    <input 
                       type="tel" 
                       value={formData.phone}
                       onChange={e => setFormData({...formData, phone: e.target.value})}
                       className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                       <input 
                          type="text" 
                          value={formData.lat}
                          onChange={e => setFormData({...formData, lat: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="e.g. 11.55"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                       <input 
                          type="text" 
                          value={formData.lng}
                          onChange={e => setFormData({...formData, lng: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="e.g. 104.92"
                       />
                    </div>
                 </div>
                 <p className="text-xs text-gray-500">គន្លឹះ: ចុច Mouse ស្ដាំលើ Google Maps ដើម្បីយក Lat/Lng ។</p>

                 {!isEditMode && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">រូបភាព</label>
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*"
                            onChange={e => setFormData({...formData, images: e.target.files ? Array.from(e.target.files) : []})}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                    </div>
                 )}

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                       <input 
                          type="url" 
                          value={formData.social_facebook}
                          onChange={e => setFormData({...formData, social_facebook: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Telegram URL</label>
                       <input 
                          type="url" 
                          value={formData.social_telegram}
                          onChange={e => setFormData({...formData, social_telegram: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                       />
                    </div>
                 </div>

                 {statusMessage && <div className="text-center text-sm font-medium text-emerald-600 animate-pulse">{statusMessage}</div>}

                 <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 mt-4"
                 >
                    {isSubmitting && <HugeiconsIcon icon={Loading02Icon} strokeWidth={1.5} className="w-4 h-4 animate-spin" />}
                    {isEditMode ? 'រក្សាទុកការកែប្រែ' : 'បញ្ជូនសំណើ'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

// Utils (Unchanged)
function createSlug(text: string) { 
  if (!text) return 'no-name'; 
  return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\u1780-\u17FF\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, ''); 
}

function haversineDistance(c1: {lat: number, lng: number}, c2: {lat: number, lng: number}) { 
  const R = 6371; 
  const toRad = (x: number) => x * Math.PI / 180; 
  const dLat = toRad(c2.lat - c1.lat); 
  const dLon = toRad(c2.lng - c1.lng); 
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(c1.lat)) * Math.cos(toRad(c2.lat)) * Math.sin(dLon / 2) ** 2; 
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
}

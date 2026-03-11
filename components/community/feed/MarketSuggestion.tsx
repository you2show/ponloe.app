import { HugeiconsIcon } from '@hugeicons/react';
import { Store01Icon, Location01Icon, Cancel01Icon, ArrowLeft01Icon, ArrowRight01Icon, Share01Icon, FavouriteIcon, MessageMultiple01Icon, Tick01Icon } from '@hugeicons/core-free-icons';

import React, { useState, useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';

interface MarketItem {
  id: string;
  title: string;
  description?: string;
  price: string;
  image: string;
  images?: string[];
  location: string;
  condition?: string;
  seller?: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
}

export const MarketSuggestion: React.FC = () => {
  const { theme } = useTheme();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketItems();
  }, []);

  const fetchMarketItems = async () => {
    setLoading(true);
    if (!supabase) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('market_items')
        .select(`
          id,
          title,
          description,
          price,
          media_urls,
          location,
          condition,
          profiles:user_id (
            full_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;

      if (data && data.length > 0) {
        setItems(data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          image: item.media_urls?.[0] || '',
          images: item.media_urls || [],
          location: item.location || 'Cambodia',
          condition: item.condition,
          seller: {
            name: item.profiles?.full_name || 'Unknown',
            avatar: item.profiles?.avatar_url || '',
            isVerified: item.profiles?.is_verified || false,
          },
        })));
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching market items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (item: MarketItem) => {
    setSelectedItem(item);
    setPreviewImageIndex(0);
  };

  const conditionLabel = (cond?: string) => {
    switch (cond) {
      case 'new': return 'ថ្មី';
      case 'used': return 'មួយទឹក';
      case 'like_new': return 'ដូចថ្មី';
      default: return 'ថ្មី';
    }
  };

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-4 mb-4`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Store01Icon} strokeWidth={1.5} className="w-5 h-5 text-emerald-600" />
            <h3 className={`font-bold font-khmer ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>ផ្សារហាឡាល់</h3>
          </div>
          <span className="text-xs text-blue-600 font-bold cursor-pointer hover:underline font-khmer">មើលទាំងអស់</span>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map(i => (
              <div key={i} className={`border rounded-lg overflow-hidden ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`}>
                <div className={`aspect-[4/3] animate-pulse ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
                <div className="p-2 space-y-2">
                  <div className={`h-4 animate-pulse rounded w-3/4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
                  <div className={`h-3 animate-pulse rounded w-1/2 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.slice(0, 2).map(item => (
              <div 
                key={item.id} 
                className={`border rounded-lg overflow-hidden group cursor-pointer hover:shadow-md transition-shadow ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-gray-100 bg-white'}`}
                onClick={() => openDetail(item)}
              >
                <div className="aspect-[4/3] bg-gray-100 relative">
                  <img src={item.image || undefined} className="w-full h-full object-cover" alt={item.title} referrerPolicy="no-referrer" />
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-xs font-bold text-gray-900 shadow-sm">
                    {item.price}
                  </div>
                  {item.condition && (
                    <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                      {conditionLabel(item.condition)}
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <h4 className={`font-bold text-sm truncate font-khmer ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>{item.title}</h4>
                  <div className={`flex items-center gap-1 text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                    <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-3 h-3" /> {item.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
            {/* Image Gallery */}
            <div className="relative aspect-square bg-gray-100">
              <img 
                src={(selectedItem.images || [selectedItem.image])[previewImageIndex] || undefined}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-5 h-5" />
              </button>

              {/* Image Counter */}
              {selectedItem.images && selectedItem.images.length > 1 && (
                <>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                    {previewImageIndex + 1} / {selectedItem.images.length}
                  </div>
                  {previewImageIndex > 0 && (
                    <button 
                      onClick={() => setPreviewImageIndex(prev => prev - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm"
                    >
                      <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                  )}
                  {previewImageIndex < selectedItem.images.length - 1 && (
                    <button 
                      onClick={() => setPreviewImageIndex(prev => prev + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm"
                    >
                      <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                  )}
                </>
              )}

              {/* Thumbnail Strip */}
              {selectedItem.images && selectedItem.images.length > 1 && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {selectedItem.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPreviewImageIndex(idx)}
                      className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === previewImageIndex ? 'border-white scale-110' : 'border-white/30 opacity-70'
                      }`}
                    >
                      <img src={img || undefined} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}

              {/* Condition Badge */}
              {selectedItem.condition && (
                <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                  {conditionLabel(selectedItem.condition)}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 font-khmer">{selectedItem.title}</h2>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{selectedItem.price}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    <HugeiconsIcon icon={FavouriteIcon} strokeWidth={1.5} className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    <HugeiconsIcon icon={Share01Icon} strokeWidth={1.5} className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="w-4 h-4" />
                <span className="font-khmer">{selectedItem.location}</span>
              </div>

              {/* Description */}
              {selectedItem.description && (
                <div className="mb-4">
                  <h4 className="font-bold text-gray-900 text-sm mb-1 font-khmer">ការពិពណ៌នា</h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-khmer">{selectedItem.description}</p>
                </div>
              )}

              {/* Seller Info */}
              {selectedItem.seller && (
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedItem.seller.avatar || `https://ui-avatars.com/api/?name=${selectedItem.seller.name}&background=random`}
                      alt={selectedItem.seller.name}
                      className="w-10 h-10 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm text-gray-900">{selectedItem.seller.name}</span>
                        {selectedItem.seller.isVerified && (
                          <div className="bg-blue-500 p-0.5 rounded-full">
                            <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.5} className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">អ្នកលក់</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Button */}
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold font-khmer flex items-center justify-center gap-2 transition-colors">
                <HugeiconsIcon icon={MessageMultiple01Icon} strokeWidth={1.5} className="w-5 h-5" />
                ទាក់ទងអ្នកលក់
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

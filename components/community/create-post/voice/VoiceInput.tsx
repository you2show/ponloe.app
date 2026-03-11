import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Delete02Icon, RefreshIcon, PlayIcon, PauseIcon } from '@hugeicons/core-free-icons';
import { WaveformPlayer } from '../../shared/WaveformPlayer';
import { useToast } from '@/contexts/ToastContext';

import imageCompression from 'browser-image-compression';

interface TrackItem {
  id: string;
  fileId: string;
  url: string;
  duration: number;
  title: string;
  cover?: string;
  waveform?: number[];
}

interface VoiceInputProps {
  onCancel: () => void;
  onSave?: (data: any) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onCancel, onSave }) => {
  const { showToast } = useToast();
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  
  const [title, setTitle] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [activeTrackIdForCover, setActiveTrackIdForCover] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update parent when metadata or tracks change
  useEffect(() => {
      if (onSave) {
          if (tracks.length > 0) {
              // Sanitize tracks to ensure no DOM elements are passed
              const sanitizedTracks = tracks.map(t => ({
                  id: t.id,
                  fileId: t.fileId,
                  url: t.url,
                  duration: t.duration,
                  title: t.title,
                  cover: t.cover,
                  waveform: t.waveform
              }));

              onSave({
                  type: 'playlist',
                  title: title || 'Playlist ថ្មី',
                  speakerName: speakerName || 'មិនស្គាល់',
                  tracks: sanitizedTracks
              });
          } else {
              onSave(null);
          }
      }
  }, [title, speakerName, tracks]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && activeTrackIdForCover) {
          setIsUploading(true);
          
          let fileToUpload = file;
          if (file.type.startsWith('image/')) {
            try {
              const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true
              };
              fileToUpload = await imageCompression(file, options);
            } catch (error) {
              console.error('Error compressing cover image:', error);
            }
          }
          
          const formData = new FormData();
          formData.append('image', fileToUpload);
          
          try {
              const baseUrl = '';
              const response = await fetch(`${baseUrl}/api/upload-image`, { method: 'POST', body: formData });
              if (!response.ok) {
                  const contentType = response.headers.get('content-type');
                  if (contentType && contentType.includes('application/json')) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Failed to upload cover');
                  } else {
                      throw new Error(`Server returned an error (${response.status}). The file might be too large.`);
                  }
              }
              const contentType = response.headers.get('content-type');
              if (!contentType || !contentType.includes('application/json')) {
                  const text = await response.text();
                  console.error('Non-JSON success response:', text.substring(0, 200));
                  throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
              }
              const data = await response.json();
              if (data.success) {
                  const url = `/api/image/${data.fileId}`;
                  setTracks(prev => prev.map(t => t.id === activeTrackIdForCover ? { ...t, cover: url } : t));
              } else {
                  showToast('បរាជ័យក្នុងការបញ្ចូលរូបគម្រប', 'error');
              }
          } catch (error) {
              console.error(error);
              showToast('មានបញ្ហាក្នុងការបញ្ចូលរូបគម្រប', 'error');
          } finally {
              setIsUploading(false);
              setActiveTrackIdForCover(null);
          }
      }
      if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const extractWaveform = async (file: File): Promise<number[]> => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const rawData = audioBuffer.getChannelData(0);
      const samples = 40;
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData = [];
      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum = sum + Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }
      const multiplier = Math.pow(Math.max(...filteredData), -1);
      return filteredData.map(n => n * multiplier);
    } catch (error) {
      console.error("Error extracting waveform:", error);
      // Fallback random waveform
      return Array.from({ length: 40 }, () => Math.random() * 0.8 + 0.2);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setIsUploading(true);
      const newTracks: TrackItem[] = [];
      
      try {
          for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const url = URL.createObjectURL(file);
              
              // Get duration
              const duration = await new Promise<number>((resolve) => {
                  const audio = new Audio(url);
                  audio.onloadedmetadata = () => resolve(audio.duration);
                  audio.onerror = () => resolve(0);
              });

              // Extract waveform
              const waveform = await extractWaveform(file);
              
              // Upload audio
              const formData = new FormData();
              formData.append('audio', file);
              formData.append('type', 'voice');
              const baseUrl = '';
              const response = await fetch(`${baseUrl}/api/upload`, { method: 'POST', body: formData });
              if (!response.ok) {
                  const contentType = response.headers.get('content-type');
                  if (contentType && contentType.includes('application/json')) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Failed to upload audio');
                  } else {
                      throw new Error(`Server returned an error (${response.status}). The file might be too large.`);
                  }
              }
              const contentType = response.headers.get('content-type');
              if (!contentType || !contentType.includes('application/json')) {
                  const text = await response.text();
                  console.error('Non-JSON success response:', text.substring(0, 200));
                  throw new Error(`Server returned an invalid response. Content-Type: ${contentType}`);
              }
              const data = await response.json();

              if (!data.success) {
                  throw new Error('Failed to upload audio');
              }

              // Use filename without extension as title
              const fileName = file.name.replace(/\.[^/.]+$/, "");

              newTracks.push({
                  id: Date.now().toString() + i,
                  fileId: data.fileId,
                  url: `/api/audio/${data.fileId}`,
                  duration,
                  title: fileName,
                  waveform
              });
          }

          setTracks(prev => [...prev, ...newTracks]);
      } catch (error) {
          console.error(error);
          showToast('មានបញ្ហាក្នុងការបញ្ចូលសំឡេង', 'error');
      } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const removeTrack = (id: string) => {
      setTracks(prev => prev.filter(t => t.id !== id));
  };

  const handleUrlAdd = async () => {
      if (!audioUrl) return;
      setIsUploading(true);
      try {
          const duration = await new Promise<number>((resolve) => {
              const audio = new Audio(audioUrl);
              
              // Timeout after 5 seconds
              const timeout = setTimeout(() => {
                  resolve(0);
              }, 5000);

              audio.onloadedmetadata = () => {
                  clearTimeout(timeout);
                  resolve(audio.duration);
              };
              audio.onerror = () => {
                  clearTimeout(timeout);
                  resolve(0);
              };
          });
          
          const newTrack: TrackItem = {
              id: Date.now().toString(),
              fileId: 'url-' + Date.now(),
              url: audioUrl, // Use original URL, proxy will be handled in display if needed
              duration,
              title: 'សំឡេងពី Link',
              waveform: Array.from({ length: 40 }, () => Math.random() * 0.8 + 0.2)
          };
          setTracks(prev => [...prev, newTrack]);
          setAudioUrl('');
      } catch (error) {
          showToast('មិនអាចប្រើ Link នេះបានទេ', 'error');
      } finally {
          setIsUploading(false);
      }
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full relative">
        {/* Hidden Inputs */}
        <input 
            type="file" 
            accept="audio/*" 
            multiple 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
        />
        <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={coverInputRef}
            onChange={handleCoverUpload}
        />

        {/* Metadata Form (Visible if tracks exist) */}
        {tracks.length > 0 && (
            <div className="w-full bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex gap-4 mb-4 z-10 animate-in slide-in-from-top-2">
                {/* Text Inputs */}
                <div className="flex-1 space-y-3">
                    <input 
                        type="text" 
                        placeholder="ចំណងជើង Playlist" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-rose-200 outline-none focus:ring-2 focus:ring-rose-500 text-sm bg-white font-khmer" 
                    />
                    <input 
                        type="text" 
                        placeholder="ឈ្មោះម្ចាស់សំឡេង" 
                        value={speakerName}
                        onChange={(e) => setSpeakerName(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-rose-200 outline-none focus:ring-2 focus:ring-rose-500 text-sm bg-white font-khmer" 
                    />
                </div>
            </div>
        )}

        {/* Tracks List */}
        {tracks.length > 0 && (
            <div className="w-full space-y-2 mb-6 z-10">
                {tracks.map((track, index) => {
                    return (
                        <div key={track.id} className="bg-white p-3 rounded-xl border border-rose-100 flex items-center gap-3 shadow-sm animate-in slide-in-from-bottom-2">
                            {/* Track Cover Upload */}
                            <div 
                                onClick={() => {
                                    setActiveTrackIdForCover(track.id);
                                    coverInputRef.current?.click();
                                }}
                                className="w-12 h-12 bg-rose-50 border border-dashed border-rose-200 rounded-lg flex flex-col items-center justify-center text-rose-400 cursor-pointer hover:bg-rose-100 hover:border-rose-300 transition-colors shrink-0 overflow-hidden relative group"
                            >
                                {track.cover ? (
                                    <>
                                        <img referrerPolicy="no-referrer" src={track.cover || undefined} alt="Cover" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <HugeiconsIcon icon={RefreshIcon} strokeWidth={1.5} className="w-4 h-4 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-4 h-4" />
                                        <span className="text-[8px] font-bold text-center mt-0.5">Cover</span>
                                    </>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col justify-center min-w-0">
                                <input 
                                    type="text"
                                    value={track.title}
                                    onChange={(e) => setTracks(prev => prev.map(t => t.id === track.id ? {...t, title: e.target.value} : t))}
                                    className="text-sm font-bold text-gray-800 font-khmer truncate mb-1 bg-transparent border-b border-transparent hover:border-rose-200 focus:border-rose-500 outline-none"
                                />
                                <WaveformPlayer 
                                    url={track.url} 
                                    waveform={track.waveform}
                                />
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-xs font-bold text-gray-500 font-mono">{formatTime(track.duration)}</span>
                                <button 
                                    onClick={() => removeTrack(track.id)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}

        {/* Upload Button */}
        <div className="flex flex-col gap-3 relative z-10">
            <div className="flex gap-2">
                <input 
                    type="text"
                    placeholder="Past link URL audio..."
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    className="flex-1 p-2.5 rounded-lg border border-rose-200 outline-none focus:ring-2 focus:ring-rose-500 text-sm bg-white"
                />
                <button 
                    onClick={handleUrlAdd}
                    disabled={isUploading || !audioUrl}
                    className="px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                >
                    Add
                </button>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUploading ? (
                        <span className="animate-pulse">កំពុងបញ្ចូល...</span>
                    ) : (
                        <>
                            <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-5 h-5" /> 
                            {tracks.length > 0 ? 'បន្ថែមសំឡេងទៀត' : 'ជ្រើសរើសឯកសារសំឡេង'}
                        </>
                    )}
                </button>
                <button 
                    onClick={onCancel}
                    className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm transition-colors"
                >
                    បោះបង់
                </button>
            </div>
        </div>
    </div>
  );
};

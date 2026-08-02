import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { X, Image as ImageIcon, Video, File as FileIcon, Upload, Link as LinkIcon, Sparkles } from 'lucide-react';
import './Admin.css';

// IndexedDB Helper for persistent local video & image blob storage
const DB_NAME = 'ScrollzLocalMediaDB';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'name' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function saveLocalBlob(name, blob) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ name, blob, created_at: Date.now() });
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (e) {
    console.warn('saveLocalBlob failed:', e);
    return false;
  }
}

async function getAllLocalBlobs() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    console.warn('getAllLocalBlobs failed:', e);
    return [];
  }
}

// Timeout helper to avoid waiting for hanging/failing network requests
const withTimeout = (promise, ms = 1200) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Network timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

export default function MediaLibraryModal({ onClose, onSelect }) {
  const [activeTab, setActiveTab] = useState('link'); // 'link' | 'upload' | 'library'
  const [videoUrl, setVideoUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch persistent local blobs from IndexedDB
      const localBlobs = await getAllLocalBlobs();
      const localFiles = localBlobs.map(b => ({
        name: b.name,
        url: URL.createObjectURL(b.blob),
        isLocal: true,
        created_at: new Date(b.created_at || Date.now()).toISOString()
      }));

      // 2. Try fetching remote files from Supabase Storage with 1.2s timeout
      let remoteFiles = [];
      try {
        const { data, error } = await withTimeout(supabase.storage.from('media').list(''), 1200);
        if (!error && data) {
          remoteFiles = data
            .filter(f => f.name !== '.emptyFolderPlaceholder')
            .map(f => {
              const { data: pubData } = supabase.storage.from('media').getPublicUrl(f.name);
              return {
                name: f.name,
                url: `${pubData.publicUrl}?v=${Date.now()}`,
                isRemote: true,
                created_at: f.created_at || new Date().toISOString()
              };
            });
        }
      } catch (err) {
        console.warn('Supabase storage fetch skipped/timed out:', err.message);
      }

      // Combine local blobs first, then remote files
      const combined = [...localFiles, ...remoteFiles].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setFiles(combined);
    } catch (err) {
      console.warn('Media fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUrl = (url) => {
    if (!url || !url.trim()) {
      alert('Please enter or paste a valid video or image URL');
      return;
    }
    onSelect(url.trim());
  };

  const handleSelectMediaItem = (item) => {
    onSelect(item.url);
  };

  const uploadFile = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 10)}_${Date.now()}.${fileExt}`;

      // Always save to local IndexedDB first so it's 100% available offline/locally
      await saveLocalBlob(file.name, file);
      const objectUrl = URL.createObjectURL(file);

      // Try uploading to Supabase Storage in background with 1.2s timeout
      try {
        const { data, error: uploadError } = await withTimeout(
          supabase.storage.from('media').upload(fileName, file, { cacheControl: '3600', upsert: true }),
          1200
        );
        if (!uploadError && data) {
          const { data: pubData } = supabase.storage.from('media').getPublicUrl(fileName);
          const publicUrl = `${pubData.publicUrl}?v=${Date.now()}`;
          onSelect(publicUrl);
          return;
        }
      } catch (stErr) {
        console.warn('Supabase storage upload skipped/timed out:', stErr.message);
      }

      // Fallback to local Object URL
      onSelect(objectUrl);
    } catch (err) {
      console.error('Upload error:', err);
      const file = event.target.files ? event.target.files[0] : null;
      if (file) {
        const objectUrl = URL.createObjectURL(file);
        onSelect(objectUrl);
      } else {
        alert('Error uploading video file: ' + err.message);
      }
    } finally {
      setUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.85)', zIndex: 9999, 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(6px)', fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: '#111116', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px',
        width: '90%', maxWidth: '750px', maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7)', overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#16161c' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#7932ec" /> Replace Video / Media
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #222', background: '#0e0e12', padding: '0 16px' }}>
          <button onClick={() => setActiveTab('link')} style={{
            background: 'none', border: 'none', borderBottom: activeTab === 'link' ? '2px solid #7932ec' : '2px solid transparent',
            color: activeTab === 'link' ? '#fff' : '#888', padding: '12px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <LinkIcon size={15} /> Paste Video Link (YouTube / Instagram)
          </button>

          <button onClick={() => setActiveTab('upload')} style={{
            background: 'none', border: 'none', borderBottom: activeTab === 'upload' ? '2px solid #7932ec' : '2px solid transparent',
            color: activeTab === 'upload' ? '#fff' : '#888', padding: '12px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Upload size={15} /> Upload Video File
          </button>

          <button onClick={() => setActiveTab('library')} style={{
            background: 'none', border: 'none', borderBottom: activeTab === 'library' ? '2px solid #7932ec' : '2px solid transparent',
            color: activeTab === 'library' ? '#fff' : '#888', padding: '12px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <ImageIcon size={15} /> Storage Library
          </button>
        </div>

        {/* Tab Body Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, color: '#fff' }}>

          {/* TAB 1: PASTE VIDEO LINK (YouTube / Instagram / Direct MP4) */}
          {activeTab === 'link' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#ccc', marginBottom: '8px' }}>
                  Paste YouTube or Instagram Video Link:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                    style={{
                      flex: 1, background: '#08080a', border: '1px solid #333', borderRadius: '8px',
                      padding: '12px 14px', color: '#fff', fontSize: '14px', outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => handleSelectUrl(videoUrl)}
                    style={{
                      background: 'linear-gradient(135deg, #7932ec, #23005c)', border: 'none', color: '#fff',
                      padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                      boxShadow: '0 0 15px rgba(121,50,236,0.4)', whiteSpace: 'nowrap'
                    }}
                  >
                    Use Video Link
                  </button>
                </div>
              </div>

              <div style={{ background: '#0a0a0e', border: '1px solid #222', borderRadius: '8px', padding: '14px', fontSize: '12px', color: '#aaa' }}>
                <span style={{ color: '#7932ec', fontWeight: 700 }}>Supported Formats:</span>
                <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px', lineHeight: 1.6 }}>
                  <li><strong>YouTube Video / Short / Embed Link</strong> (`youtube.com/watch?v=...`, `youtu.be/...`, `youtube.com/shorts/...`)</li>
                  <li><strong>Instagram Reel / Post Link</strong> (`instagram.com/reel/...`, `instagram.com/p/...`)</li>
                  <li><strong>Direct MP4 / WebM Video URL</strong> (`https://domain.com/video.mp4`)</li>
                  <li><strong>Image URL</strong> (`https://domain.com/image.png`)</li>
                </ul>
              </div>

              {/* Sample Quick Links */}
              <div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Quick Sample Videos for Instant Testing:</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => { handleSelectUrl('https://framerusercontent.com/assets/X3H7H2QZN3YVznG5VHcgCqImgg.mp4'); }} style={{
                    background: '#1c1c24', border: '1px solid #333', color: '#ddd', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                  }}>📹 Sample Short Video</button>

                  <button onClick={() => { handleSelectUrl('https://framerusercontent.com/assets/X7mDMoy670X5uCTztvfLrcYhXE.mp4'); }} style={{
                    background: '#1c1c24', border: '1px solid #333', color: '#ddd', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                  }}>🏋️ Sample Fitness Video</button>

                  <button onClick={() => { handleSelectUrl('https://framerusercontent.com/assets/Rxn2rYDo8j18aGGQnD79Gr3Nezg.mp4'); }} style={{
                    background: '#1c1c24', border: '1px solid #333', color: '#ddd', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                  }}>🎙️ Sample Creator Video</button>

                  <button onClick={() => { handleSelectUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'); }} style={{
                    background: '#1c1c24', border: '1px solid #333', color: '#ddd', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                  }}>▶️ Sample YouTube Video</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD VIDEO FILE */}
          {activeTab === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', border: '2px dashed #333', borderRadius: '12px', background: '#0a0a0e' }}>
              <Video size={48} color="#7932ec" style={{ marginBottom: '16px' }} />
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#fff' }}>Upload Video or Image File</h4>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#888', textAlign: 'center' }}>
                Select an MP4, WebM, MOV video or PNG, JPG, WebP image file from your computer.
              </p>
              
              <label style={{ 
                background: 'linear-gradient(135deg, #7932ec, #23005c)', color: '#fff', padding: '10px 24px', borderRadius: '8px', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700,
                boxShadow: '0 0 15px rgba(121,50,236,0.4)', opacity: uploading ? 0.7 : 1
              }}>
                <Upload size={16} />
                {uploading ? 'Uploading & Processing...' : 'Choose File from Computer'}
                <input type="file" style={{ display: 'none' }} onChange={uploadFile} disabled={uploading} accept="video/*,image/*" />
              </label>
            </div>
          )}

          {/* TAB 3: STORAGE LIBRARY */}
          {activeTab === 'library' && (
            <div>
              {loading ? (
                <div style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Loading media files...</div>
              ) : files.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', padding: '40px' }}>No media uploaded yet. Use the Upload tab or paste a link.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                  {files.map((file, idx) => {
                    const isVideo = file.url.match(/\.(mp4|mov|webm)/i) || file.url.includes('video') || file.url.startsWith('blob:');
                    return (
                      <div 
                        key={file.name + idx} 
                        onClick={() => handleSelectMediaItem(file)}
                        style={{ 
                          background: '#0a0a0e', border: '1px solid #222', borderRadius: '8px', overflow: 'hidden', 
                          cursor: 'pointer', transition: '0.2s', position: 'relative'
                        }}
                        onMouseOver={e => e.currentTarget.style.borderColor = '#7932ec'}
                        onMouseOut={e => e.currentTarget.style.borderColor = '#222'}
                      >
                        <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                          {isVideo ? (
                            <video src={file.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <img src={file.url} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>
                        <div style={{ padding: '8px', fontSize: '11px', color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {file.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { X, Image as ImageIcon, Video, File as FileIcon, Upload } from 'lucide-react';
import './Admin.css';

export default function MediaLibraryModal({ isOpen = true, onClose, onSelect, onSelectMedia }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [linkInput, setLinkInput] = useState('');

  const selectHandler = onSelect || onSelectMedia;

  useEffect(() => {
    if (isOpen !== false) {
      fetchMedia();
    }
  }, [isOpen]);

  if (isOpen === false) return null;

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage.from('media').list('');
      if (error) throw error;
      
      const validFiles = data
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
      setFiles(validFiles);
    } catch (err) {
      console.error('Fetch media error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (fileName) => {
    const { data } = supabase.storage.from('media').getPublicUrl(fileName);
    const cacheBusterUrl = `${data.publicUrl}?v=${Date.now()}`;
    if (selectHandler) {
      selectHandler(cacheBusterUrl);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleEmbedSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanUrl = linkInput.trim();
    if (!cleanUrl) return;
    if (selectHandler) {
      selectHandler(cleanUrl);
    }
    if (onClose) {
      onClose();
    }
  };

  const uploadFile = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

      let { error: uploadError } = await supabase.storage.from('media').upload(fileName, file);
      if (uploadError) throw uploadError;

      handleSelect(fileName);
    } catch (err) {
      alert('Error uploading file: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        background: 'rgba(0,0,0,0.85)', zIndex: 999999, 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111', border: '1px solid #333', borderRadius: '12px',
          width: '80%', maxWidth: '900px', maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
        }}
      >
        <div style={{ padding: '20px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>Select Media</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <label style={{ 
                background: '#9333ea', color: '#fff', padding: '6px 14px', borderRadius: '6px', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
                fontWeight: 600, opacity: uploading ? 0.7 : 1
              }}>
              <Upload size={14} />
              {uploading ? 'Uploading...' : 'Upload New File'}
              <input type="file" style={{ display: 'none' }} onChange={uploadFile} disabled={uploading} accept="image/*,video/*" />
            </label>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px' }}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Embed Link Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #222', background: '#161616' }}>
          <form onSubmit={handleEmbedSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', padding: '0 12px' }}>
              <span style={{ fontSize: '12px', color: '#a855f7', fontWeight: 600, marginRight: '8px', whiteSpace: 'nowrap' }}>
                🔗 Embed Link:
              </span>
              <input
                type="text"
                placeholder="Paste YouTube (Video/Shorts), Instagram (Reel/Post), or video link..."
                value={linkInput}
                onChange={e => setLinkInput(e.target.value)}
                style={{
                  flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '10px 0',
                  fontSize: '13px', outline: 'none'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!linkInput.trim()}
              style={{
                background: linkInput.trim() ? '#7932ec' : '#333',
                color: linkInput.trim() ? '#fff' : '#777',
                border: 'none', borderRadius: '8px', padding: '10px 18px',
                fontWeight: 600, fontSize: '13px', cursor: linkInput.trim() ? 'pointer' : 'not-allowed',
                transition: '0.2s', whiteSpace: 'nowrap'
              }}
            >
              Embed Link
            </button>
          </form>
          <div style={{ fontSize: '11px', color: '#777', marginTop: '6px' }}>
            💡 Supports YouTube videos & Shorts, Instagram Reels & posts, Vimeo, or direct video/image URLs.
          </div>
        </div>
        
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Loading media...</div>
          ) : files.length === 0 ? (
            <div style={{ color: '#888', textAlign: 'center', padding: '40px' }}>No uploaded files. Paste a YouTube/Instagram link above or upload a file.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
              {files.map(file => {
                const { data } = supabase.storage.from('media').getPublicUrl(file.name);
                const isImage = file.metadata?.mimetype?.startsWith('image/');
                const isVideo = file.metadata?.mimetype?.startsWith('video/');

                return (
                  <div 
                    key={file.id} 
                    onClick={() => handleSelect(file.name)}
                    style={{ 
                      background: '#0a0a0a', border: '1px solid #222', borderRadius: '8px', overflow: 'hidden', 
                      cursor: 'pointer', transition: '0.2s', position: 'relative'
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#9333ea'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#222'}
                  >
                    <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isImage ? (
                        <img src={data.publicUrl} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : isVideo ? (
                        <video src={data.publicUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <FileIcon size={32} color="#888" />
                      )}
                    </div>
                    <div style={{ padding: '8px', fontSize: '11px', color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

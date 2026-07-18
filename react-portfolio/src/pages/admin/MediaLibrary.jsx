import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Upload, Trash2, Copy, File as FileIcon, Image as ImageIcon, Video } from 'lucide-react';
import './Admin.css';

export default function MediaLibrary() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage.from('media').list('');
      
      if (error) throw error;
      
      // Filter out empty folder placeholder if any, sort by creation time (newest first)
      const validFiles = data
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
      setFiles(validFiles);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (event) => {
    try {
      setUploading(true);
      setError(null);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a file to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      // Generate a clean, unique file name to avoid collisions
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      alert('File uploaded successfully!');
      fetchMedia();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const deleteFile = async (fileName) => {
    if (!window.confirm('Are you sure you want to delete this file? Any component using it will break.')) return;
    
    try {
      const { error } = await supabase.storage.from('media').remove([fileName]);
      if (error) throw error;
      fetchMedia();
    } catch (err) {
      setError(err.message);
    }
  };

  const copyUrlToClipboard = (fileName) => {
    const { data } = supabase.storage.from('media').getPublicUrl(fileName);
    const cacheBusterUrl = `${data.publicUrl}?v=${Date.now()}`;
    navigator.clipboard.writeText(cacheBusterUrl);
    alert('Public URL copied to clipboard! You can paste this in your section editors.');
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return <FileIcon size={32} color="#888" />;
    if (mimeType.startsWith('image/')) return <ImageIcon size={32} color="#3b82f6" />;
    if (mimeType.startsWith('video/')) return <Video size={32} color="#9333ea" />;
    return <FileIcon size={32} color="#888" />;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', margin: 0 }}>Media Library</h2>
        
        <div>
          <label 
            style={{ 
              background: '#9333ea', 
              color: '#fff', 
              padding: '10px 16px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 500,
              opacity: uploading ? 0.7 : 1
            }}
          >
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload New File'}
            <input 
              type="file" 
              style={{ display: 'none' }} 
              onChange={uploadFile}
              disabled={uploading}
              accept="image/*,video/*,application/pdf"
            />
          </label>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div style={{ color: '#888' }}>Loading media...</div>
      ) : files.length === 0 ? (
        <div style={{ background: '#111', border: '1px dashed #333', padding: '40px', textAlign: 'center', borderRadius: '8px', color: '#666' }}>
          No files uploaded yet. Click the upload button to add images, videos, or documents.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {files.map((file) => {
            const { data } = supabase.storage.from('media').getPublicUrl(file.name);
            const isImage = file.metadata?.mimetype?.startsWith('image/');
            const isVideo = file.metadata?.mimetype?.startsWith('video/');

            return (
              <div key={file.id} style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '140px', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {isImage ? (
                    <img src={data.publicUrl} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : isVideo ? (
                    <video src={data.publicUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                  ) : (
                    getFileIcon(file.metadata?.mimetype)
                  )}
                  {isVideo && (
                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Video size={10} /> Video
                    </div>
                  )}
                </div>
                
                <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#ccc', wordBreak: 'break-all', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {file.name}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <button 
                      onClick={() => copyUrlToClipboard(file.name)}
                      style={{ flex: 1, background: '#222', border: '1px solid #333', color: '#fff', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.2s' }}
                      title="Copy Public URL"
                      onMouseOver={e => e.currentTarget.style.background = '#333'}
                      onMouseOut={e => e.currentTarget.style.background = '#222'}
                    >
                      <Copy size={14} />
                    </button>
                    <button 
                      onClick={() => deleteFile(file.name)}
                      style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.2s' }}
                      title="Delete File"
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

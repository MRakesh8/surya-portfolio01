import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import MediaLibraryModal from './MediaLibraryModal';
import { Undo, Redo, Save } from 'lucide-react';

export default function DashboardHome() {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [currentEditingElement, setCurrentEditingElement] = useState(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [saving, setSaving] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'REQUEST_MEDIA') {
        setCurrentEditingElement(event.data.elementId);
        setShowMediaModal(true);
      }
      
      if (event.data.type === 'SAVE_CONTENT') {
        saveContentToDatabase(event.data.content, event.data.page);
      }

      if (event.data.type === 'HISTORY_UPDATE') {
        setCanUndo(event.data.canUndo);
        setCanRedo(event.data.canRedo);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleUndo = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'UNDO' }, '*');
    }
  };

  const handleRedo = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'REDO' }, '*');
    }
  };

  const requestSave = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      setSaving(true);
      iframeRef.current.contentWindow.postMessage({ type: 'REQUEST_SAVE' }, '*');
    }
  };

  const saveContentToDatabase = async (htmlContent, pageName) => {
    try {
      setSaving(true);
      const isProjects = pageName === 'projects.html';
      const columnName = isProjects ? 'seo_keywords' : 'site_description';

      const { data: existing } = await supabase.from('site_settings').select('id').limit(1);
      
      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from('site_settings')
          .update({ [columnName]: htmlContent })
          .eq('id', existing[0].id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{ [columnName]: htmlContent }]);
        if (error) throw error;
      }
      
      alert('Changes Saved and Published Successfully!');
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMediaSelect = (mediaUrl) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'MEDIA_SELECTED',
        elementId: currentEditingElement,
        url: mediaUrl
      }, '*');
    }
    setShowMediaModal(false);
    setCurrentEditingElement(null);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 0 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Visual Builder</h2>
          <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '14px' }}>Right-click on any element below to edit it.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleUndo} 
            disabled={!canUndo}
            style={{ 
              background: '#222', border: '1px solid #333', color: canUndo ? '#fff' : '#555', 
              padding: '8px 12px', borderRadius: '6px', cursor: canUndo ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Undo size={16} /> Undo
          </button>
          
          <button 
            onClick={handleRedo} 
            disabled={!canRedo}
            style={{ 
              background: '#222', border: '1px solid #333', color: canRedo ? '#fff' : '#555', 
              padding: '8px 12px', borderRadius: '6px', cursor: canRedo ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Redo size={16} /> Redo
          </button>

          <button 
            onClick={requestSave}
            disabled={saving}
            style={{ 
              background: '#9333ea', border: 'none', color: '#fff', 
              padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
              fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 0 15px rgba(147, 51, 234, 0.4)'
            }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
        <iframe 
          ref={iframeRef}
          src={import.meta.env.DEV ? `http://127.0.0.1:5500/index.html?admin=true&t=${Date.now()}` : `/index.html?admin=true&t=${Date.now()}`}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Visual Builder"
        />
      </div>

      {showMediaModal && (
        <MediaLibraryModal 
          onClose={() => setShowMediaModal(false)} 
          onSelect={handleMediaSelect} 
        />
      )}
    </div>
  );
}

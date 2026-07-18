import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ArrowLeft, Save, Undo, Sparkles, Image as ImageIcon } from 'lucide-react';
import MediaLibraryModal from './MediaLibraryModal';

export default function SectionEditor() {
  const { sectionKey } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [draftContent, setDraftContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [currentMediaField, setCurrentMediaField] = useState(null);

  // Very basic history for undo functionality
  const historyRef = useRef([]);

  useEffect(() => {
    fetchSection();
  }, [sectionKey]);

  const fetchSection = async () => {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('section_key', sectionKey)
        .single();
        
      if (error) throw error;
      setSection(data);
      setDraftContent(data.content_draft || {});
      historyRef.current = [data.content_draft || {}];
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    const newContent = { ...draftContent, [field]: value };
    setDraftContent(newContent);
    // Add to history
    if (historyRef.current[historyRef.current.length - 1] !== newContent) {
      historyRef.current.push(newContent);
      // keep last 20 edits
      if (historyRef.current.length > 20) historyRef.current.shift();
    }
  };

  const handleUndo = () => {
    if (historyRef.current.length > 1) {
      historyRef.current.pop(); // remove current state
      const previousState = historyRef.current[historyRef.current.length - 1];
      setDraftContent({ ...previousState });
    }
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sections')
        .update({ content_draft: draftContent })
        .eq('section_key', sectionKey);
      if (error) throw error;
      alert('Draft saved!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const publishChanges = async () => {
    setSaving(true);
    try {
      // Save to versions table first
      const { data: userSession } = await supabase.auth.getSession();
      await supabase.from('content_versions').insert({
        section_key: sectionKey,
        content: section.content_published,
        created_by: userSession?.session?.user?.id
      });

      // Update both published and draft to match
      const { error } = await supabase
        .from('sections')
        .update({ 
          content_published: draftContent,
          content_draft: draftContent 
        })
        .eq('section_key', sectionKey);
        
      if (error) throw error;
      alert('Changes Published Successfully!');
      setSection({ ...section, content_published: draftContent });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openMediaLibrary = (field) => {
    setCurrentMediaField(field);
    setIsMediaModalOpen(true);
  };

  const handleMediaSelect = (url) => {
    handleFieldChange(currentMediaField, url);
    setIsMediaModalOpen(false);
  };

  if (loading) return <div>Loading editor...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!section) return <div>Section not found.</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/admin/pages')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Editing: {section.title}</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleUndo}
            disabled={historyRef.current.length <= 1}
            style={{ padding: '8px 12px', background: '#222', color: '#fff', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Undo size={14} /> Undo
          </button>
          <button 
            onClick={saveDraft}
            disabled={saving}
            style={{ padding: '8px 16px', background: '#111', color: '#fff', border: '1px solid #9333ea', borderRadius: '6px', cursor: 'pointer' }}
          >
            Save Draft
          </button>
          <button 
            onClick={publishChanges}
            disabled={saving}
            style={{ padding: '8px 16px', background: '#9333ea', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={14} /> {saving ? 'Publishing...' : 'Publish to Live Site'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Editor Form */}
        <div style={{ background: '#111', padding: '24px', borderRadius: '8px', border: '1px solid #222' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid #222', paddingBottom: '10px' }}>Content Fields</h3>
          
          {Object.keys(draftContent).length === 0 ? (
            <p style={{ color: '#888' }}>This section has no editable text fields yet. Add them to the schema!</p>
          ) : (
            Object.keys(draftContent).map(field => (
              <div key={field} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ color: '#ccc', textTransform: 'capitalize' }}>{field.replace('_', ' ')}</label>
                  <button style={{ background: 'rgba(147, 51, 234, 0.1)', color: '#a855f7', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={12} /> AI Rewrite
                  </button>
                </div>
                {typeof draftContent[field] === 'string' && draftContent[field].length > 50 ? (
                  <textarea 
                    value={draftContent[field]}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    style={{ width: '100%', minHeight: '120px', padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px', resize: 'vertical' }}
                  />
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text"
                      value={draftContent[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      style={{ flex: 1, padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
                    />
                    <button 
                      onClick={() => openMediaLibrary(field)}
                      style={{ padding: '0 12px', background: '#222', color: '#fff', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                      title="Select Media"
                    >
                      <ImageIcon size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Live Preview Panel placeholder */}
        <div style={{ background: '#0a0a0a', border: '1px dashed #333', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
          <p>Live Preview Component</p>
          <span style={{ fontSize: '12px' }}>This will render the specific section using the draft data.</span>
        </div>
      </div>
      
      {isMediaModalOpen && (
        <MediaLibraryModal 
          onClose={() => setIsMediaModalOpen(false)} 
          onSelect={handleMediaSelect} 
        />
      )}
    </div>
  );
}


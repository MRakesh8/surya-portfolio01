import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import MediaLibraryModal from './MediaLibraryModal';
import { Save, Sparkles, RotateCcw, RotateCw, History } from 'lucide-react';

/* ─── Context Menu ─── */
function ContextMenu({ menu, onAction, onClose }) {
  if (!menu.visible) return null;
  const btnBase = {
    display:'flex', alignItems:'center', gap:'10px',
    padding:'10px 16px', background:'transparent', border:'none',
    fontSize:'13px', fontWeight:600, cursor:'pointer', borderRadius:'6px',
    width:'100%', textAlign:'left', fontFamily:'Inter,sans-serif',
    transition:'background 0.15s',
  };
  const hoverIn = (e, danger) => e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.15)' : 'rgba(121,50,236,0.2)';
  const hoverOut = (e) => e.currentTarget.style.background = 'transparent';

  const isVideo = menu.isVideo === true || menu.tag === 'VIDEO';
  const isImage = menu.isMedia === true && !isVideo;
  const isMedia = isVideo || isImage;

  const headerLabel = isVideo ? '🎬 Video Element'
    : isImage ? '🖼️ Image Element'
    : `✏️ ${menu.tag || 'Text'} Element`;

  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:99998}} />
      <div style={{
        position:'fixed', top:menu.y, left:menu.x, zIndex:99999,
        background:'rgba(18,18,24,0.96)',
        backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
        border:'1px solid rgba(255,255,255,0.15)',
        borderRadius:'12px', padding:'6px', width:'210px',
        boxShadow:'0 16px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(121,50,236,0.3)',
        color:'#fff', fontFamily:'Inter,sans-serif', animation:'veFadeIn 0.15s ease-out',
      }}>
        {/* Component Header */}
        <div style={{
          padding:'6px 12px 8px', fontSize:'11px', fontWeight:700,
          color:'#7932ec', letterSpacing:'0.6px', textTransform:'uppercase',
          borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'4px',
          display:'flex', alignItems:'center', justifyContent:'space-between'
        }}>
          <span>{headerLabel}</span>
          <span style={{fontSize:'10px',color:'#888',fontWeight:500}}>Double-clicked</span>
        </div>

        {/* Dynamic Actions based on Component Type */}
        {isMedia ? (
          <>
            <button style={{...btnBase, color:'#e0e0e0'}}
              onMouseEnter={hoverIn} onMouseLeave={hoverOut}
              onClick={() => onAction('REPLACE_MEDIA')}>
              <span>{isVideo ? '🎥' : '🖼️'}</span> {isVideo ? 'Replace Video' : 'Replace Image'}
            </button>
            {isVideo && (
              <button style={{...btnBase, color: menu.audioAllowed !== false ? '#ef4444' : '#22c55e'}}
                onMouseEnter={hoverIn} onMouseLeave={hoverOut}
                onClick={() => onAction('TOGGLE_AUDIO')}>
                <span>{menu.audioAllowed !== false ? '🔇' : '🔊'}</span>
                {menu.audioAllowed !== false ? 'Mute Video for Users' : 'Allow Sound for Users'}
              </button>
            )}
          </>
        ) : (
          <button style={{...btnBase, color:'#e0e0e0'}}
            onMouseEnter={hoverIn} onMouseLeave={hoverOut}
            onClick={() => onAction('EDIT_TEXT')}>
            <span>✏️</span> Edit Text
          </button>
        )}

        {!isMedia && (
          <>
            <button style={{...btnBase, color:'#e0e0e0'}}
              onMouseEnter={hoverIn} onMouseLeave={hoverOut}
              onClick={() => onAction('CHANGE_COLOR')}>
              <span>🎨</span> Change Color
            </button>

            <button style={{...btnBase, color:'#e0e0e0'}}
              onMouseEnter={hoverIn} onMouseLeave={hoverOut}
              onClick={() => onAction('CHANGE_FONT')}>
              <span>Aa</span> Change Font
            </button>
          </>
        )}

        {/* Delete Component Option */}
        <div style={{height:1, background:'rgba(255,255,255,0.08)', margin:'4px 0'}} />
        <button style={{...btnBase, color:'#ef4444'}}
          onMouseEnter={(e)=>hoverIn(e,true)} onMouseLeave={hoverOut}
          onClick={() => onAction('DELETE')}>
          <span>🗑️</span> Delete Component
        </button>
      </div>
    </>
  );
}

/* ─── Modal for prompt inputs (Color / Font) ─── */
function InputModal({ prompt, placeholder, onConfirm, onCancel }) {
  const [value, setValue] = useState('');
  return (
    <div style={{position:'fixed',inset:0,zIndex:100000,background:'rgba(0,0,0,0.7)',
      display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
      <div style={{background:'#1a1a24',border:'1px solid #333',borderRadius:'12px',
        padding:'24px',width:'340px',boxShadow:'0 20px 50px rgba(0,0,0,0.8)'}}>
        <h3 style={{margin:'0 0 12px 0',fontSize:'16px',color:'#fff'}}>{prompt}</h3>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e=>setValue(e.target.value)}
          onKeyDown={e=>{ if (e.key === 'Enter') onConfirm(value); if (e.key === 'Escape') onCancel(); }}
          autoFocus
          style={{width:'100%',background:'#000',border:'1px solid #444',borderRadius:'6px',
            padding:'10px 12px',color:'#fff',fontSize:'14px',boxSizing:'border-box',outline:'none'}}
        />
        <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'16px'}}>
          <button onClick={onCancel} style={{padding:'8px 16px',background:'#222',border:'1px solid #333',
            color:'#aaa',borderRadius:'6px',cursor:'pointer',fontSize:'13px',fontWeight:600}}>Cancel</button>
          <button onClick={()=>onConfirm(value)} style={{padding:'8px 16px',background:'#7932ec',border:'none',
            color:'#fff',borderRadius:'6px',cursor:'pointer',fontSize:'13px',fontWeight:600}}>Apply</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ─── */
export default function DashboardHome() {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menu, setMenu] = useState({ visible:false, x:0, y:0, isMedia:false, tag:'' });
  const [inputModal, setInputModal] = useState(null);
  const [status, setStatus] = useState('waiting');
  const [history, setHistory] = useState({ canUndo: false, canRedo: false, totalStates: 1, currentIndex: 0 });

  const [iframeSrc] = useState(() => `/index.html?admin=true&t=${Date.now()}`);

  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  const postToIframe = useCallback((msg) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(msg, '*');
        return true;
      }
    } catch(e) { console.error('[Admin] postToIframe failed:', e); }
    return false;
  }, []);

  // ── Keyboard Shortcuts (Ctrl+Z / Ctrl+Y) ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault(); postToIframe({ type: 'REDO' });
        } else {
          e.preventDefault(); postToIframe({ type: 'UNDO' });
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault(); postToIframe({ type: 'REDO' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [postToIframe]);

  // ── Message handler ──
  useEffect(() => {
    const handle = (event) => {
      if (!event.data || typeof event.data !== 'object') return;
      const msg = event.data;

      if (msg.type === 'IFRAME_READY') {
        console.log('[Admin] iframe is ready!');
        setStatus('ready');
      }

      if (msg.type === 'HISTORY_UPDATE') {
        setHistory({
          canUndo: !!msg.canUndo,
          canRedo: !!msg.canRedo,
          totalStates: msg.totalStates || 1,
          currentIndex: msg.currentIndex || 0
        });
      }

      if (msg.type === 'ELEMENT_INFO') {
        console.log('[Admin] Got ELEMENT_INFO:', msg);
        if (!msg.found) {
          setMenu(m => ({ ...m, visible: false }));
          setStatus('ready');
          return;
        }
        const container = containerRef.current;
        if (!container) return;
        const cr = container.getBoundingClientRect();

        let mx = cr.left + msg.rect.left + 16;
        let my = cr.top + msg.rect.top + 16;

        if (msg.rect.height < 100) {
          my = cr.top + msg.rect.top + msg.rect.height + 8;
        }

        if (mx + 230 > window.innerWidth) mx = window.innerWidth - 240;
        if (mx < 10) mx = 10;
        if (my + 280 > window.innerHeight) my = cr.top + msg.rect.top - 10;
        if (my < 10) my = 10;

        setMenu({ visible:true, x:mx, y:my, isMedia:msg.isMedia, tag:msg.tag, isVideo:msg.isVideo, audioAllowed: msg.audioAllowed !== false });
        setStatus('ready');
      }

      if (msg.type === 'REQUEST_MEDIA') setShowMediaModal(true);

      if (msg.type === 'SAVE_CONTENT') {
        saveContentToDatabase(msg.content, msg.page);
      }
    };
    window.addEventListener('message', handle);
    return () => window.removeEventListener('message', handle);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenu(m => ({ ...m, visible: false }));
  }, []);

  // ── Context menu actions ──
  const handleMenuAction = useCallback((action) => {
    setMenu(m => ({...m, visible:false}));
    if (action === 'EDIT_TEXT') {
      postToIframe({ type:'EDIT_ACTION', action:'EDIT_TEXT' });
    } else if (action === 'TOGGLE_AUDIO') {
      postToIframe({ type:'EDIT_ACTION', action:'TOGGLE_AUDIO' });
    } else if (action === 'CHANGE_COLOR') {
      setInputModal({ prompt:'🎨 Enter a CSS colour:', placeholder:'e.g. #ff0000, red', action:'CHANGE_COLOR' });
    } else if (action === 'CHANGE_FONT') {
      setInputModal({ prompt:'Aa Enter a font family:', placeholder:"e.g. 'Inter', serif", action:'CHANGE_FONT' });
    } else if (action === 'REPLACE_MEDIA') {
      setShowMediaModal(true);
    } else if (action === 'DELETE') {
      postToIframe({ type:'EDIT_ACTION', action:'DELETE' });
    }
  }, [postToIframe]);

  const handleInputConfirm = useCallback((value) => {
    if (!inputModal) return;
    postToIframe({ type:'EDIT_ACTION', action:inputModal.action, value });
    setInputModal(null);
  }, [inputModal, postToIframe]);

  const handleMediaSelect = useCallback((url) => {
    postToIframe({ type:'MEDIA_SELECTED', url });
    setShowMediaModal(false);
  }, [postToIframe]);

  const requestSave = () => { setSaving(true); postToIframe({ type:'REQUEST_SAVE' }); };

  const saveContentToDatabase = async (htmlContent, pageName) => {
    try {
      setSaving(true);
      const { data:{session}, error:sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('Session expired.');
      const col = pageName === 'projects.html' ? 'seo_keywords' : 'site_description';
      const { data:existing, error:selErr } = await supabase.from('site_settings').select('id').limit(1);
      if (selErr) throw selErr;
      if (existing && existing.length > 0) {
        const { error:upErr, count } = await supabase.from('site_settings')
          .update({[col]:htmlContent},{count:'exact'}).eq('id',existing[0].id);
        if (upErr) throw upErr;
        if (count === 0) throw new Error('0 rows updated.');
      } else {
        const { error:insErr } = await supabase.from('site_settings').insert([{[col]:htmlContent}]);
        if (insErr) throw insErr;
      }
      alert('✅ Saved & Published successfully!');
    } catch(err) {
      console.error('Save failed:', err);
      alert('❌ ' + err.message);
    } finally { setSaving(false); }
  };

  const statusText = status === 'waiting' ? 'Connecting to preview…'
    : status === 'clicked' ? 'Finding element…'
    : 'Ready — double-click to edit';

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
      {/* Top bar */}
      <div style={{padding:'0 0 16px 0',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h2 style={{margin:0,fontSize:'20px',display:'flex',alignItems:'center',gap:'8px'}}>
            <Sparkles size={18} color="#7932ec" /> Scrollz Visual Editor
          </h2>
          <p style={{margin:'4px 0 0 0',color:'#888',fontSize:'13px'}}>
            <span style={{
              display:'inline-block',width:8,height:8,borderRadius:'50%',marginRight:6,
              background: status==='ready'?'#22c55e':status==='clicked'?'#f59e0b':'#888'
            }}/>
            {statusText}
          </p>
        </div>

        {/* Action Controls: Undo, Redo, Restore, Save */}
        <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
          {/* Undo Button */}
          <button
            onClick={() => postToIframe({ type: 'UNDO' })}
            disabled={!history.canUndo}
            title="Undo last change (Ctrl+Z)"
            style={{
              background: history.canUndo ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
              border: '1px solid ' + (history.canUndo ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'),
              color: history.canUndo ? '#fff' : '#555',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: history.canUndo ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              transition: 'all 0.15s'
            }}
          >
            <RotateCcw size={14} /> Undo
          </button>

          {/* Redo Button */}
          <button
            onClick={() => postToIframe({ type: 'REDO' })}
            disabled={!history.canRedo}
            title="Redo change (Ctrl+Y)"
            style={{
              background: history.canRedo ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
              border: '1px solid ' + (history.canRedo ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'),
              color: history.canRedo ? '#fff' : '#555',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: history.canRedo ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              transition: 'all 0.15s'
            }}
          >
            <RotateCw size={14} /> Redo
          </button>

          {/* Restore Original Button */}
          <button
            onClick={() => {
              if (window.confirm('Revert all unsaved changes and restore initial version?')) {
                postToIframe({ type: 'RESTORE_ORIGINAL' });
              }
            }}
            disabled={!history.canUndo}
            title="Restore initial page state before edits"
            style={{
              background: history.canUndo ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.02)',
              border: '1px solid ' + (history.canUndo ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'),
              color: history.canUndo ? '#ef4444' : '#555',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: history.canUndo ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              marginRight: '6px'
            }}
          >
            <History size={14} /> Restore Original
          </button>

          {/* Save & Publish Button */}
          <button onClick={requestSave} disabled={saving} style={{
            background:'linear-gradient(135deg,#7932ec,#23005c)',border:'none',color:'#fff',
            padding:'8px 20px',borderRadius:'8px',cursor:saving?'not-allowed':'pointer',fontWeight:600,
            display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',
            boxShadow:'0 0 15px rgba(121,50,236,0.4)'}}>
            <Save size={15}/> {saving?'Saving…':'Save & Publish'}
          </button>
        </div>
      </div>

      {/* Iframe + container */}
      <div ref={containerRef} style={{flex:1,position:'relative',
        border:'1px solid rgba(255,255,255,0.12)',borderRadius:'12px',overflow:'hidden',background:'#000'}}>

        <iframe ref={iframeRef}
          src={iframeSrc}
          style={{width:'100%',height:'100%',border:'none',display:'block'}}
        />

        {/* Floating Context Menu */}
        <ContextMenu
          menu={menu}
          onAction={handleMenuAction}
          onClose={handleCloseMenu}
        />

        {/* Input modal for color/font */}
        {inputModal && (
          <InputModal
            prompt={inputModal.prompt}
            placeholder={inputModal.placeholder}
            onConfirm={handleInputConfirm}
            onCancel={()=>setInputModal(null)}
          />
        )}

        {/* Media library picker */}
        {showMediaModal && (
          <MediaLibraryModal
            isOpen={showMediaModal}
            onClose={()=>setShowMediaModal(false)}
            onSelect={handleMediaSelect}
            onSelectMedia={handleMediaSelect}
          />
        )}
      </div>
    </div>
  );
}

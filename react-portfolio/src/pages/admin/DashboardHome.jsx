import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import MediaLibraryModal from './MediaLibraryModal';
import { Save, Sparkles, RotateCcw, RotateCw, History, VolumeX, Volume2, ChevronDown, Type, Image as ImageIcon, Video as VideoIcon, Layers } from 'lucide-react';

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
  const hoverGreen = (e) => e.currentTarget.style.background = 'rgba(34,197,94,0.15)';

  const isVideo = menu.isVideo === true || menu.tag === 'VIDEO';
  const isImage = (menu.isImage === true || menu.tag === 'IMG') && !isVideo;
  const isMedia = isVideo || isImage;
  const isText  = menu.isText === true || (!isMedia);

  const headerIcon  = isVideo ? '🎬' : isImage ? '🖼️' : '✏️';
  const headerLabel = isVideo ? 'Video Element'
    : isImage ? 'Image Element'
    : `${menu.tag || 'Text'} Element`;

  const Divider = () => <div style={{height:1, background:'rgba(255,255,255,0.08)', margin:'4px 0'}} />;

  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:99998}} />
      <div style={{
        position:'fixed', top:menu.y, left:menu.x, zIndex:99999,
        background:'rgba(14,14,20,0.97)',
        backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        border:'1px solid rgba(255,255,255,0.15)',
        borderRadius:'14px', padding:'6px', width:'230px',
        boxShadow:'0 20px 50px rgba(0,0,0,0.8), 0 0 0 1px rgba(121,50,236,0.3)',
        color:'#fff', fontFamily:'Inter,sans-serif', animation:'veFadeIn 0.15s ease-out',
      }}>
        {/* Header */}
        <div style={{
          padding:'8px 14px 10px', fontSize:'11px', fontWeight:700,
          color:'#7932ec', letterSpacing:'0.6px', textTransform:'uppercase',
          borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'4px',
          display:'flex', alignItems:'center', justifyContent:'space-between'
        }}>
          <span>{headerIcon} {headerLabel}</span>
          <span style={{fontSize:'10px',color:'#666',fontWeight:500,textTransform:'none',letterSpacing:0}}>double-clicked</span>
        </div>

        {/* ── MEDIA ACTIONS ── */}
        {isMedia && (
          <>
            <button style={{...btnBase, color:'#e0e0e0'}}
              onMouseEnter={hoverIn} onMouseLeave={hoverOut}
              onClick={() => onAction('REPLACE_MEDIA')}>
              {isVideo ? <VideoIcon size={14}/> : <ImageIcon size={14}/>}
              {isVideo ? 'Replace Video' : 'Replace Image'}
            </button>
            {isVideo && (
              <button style={{...btnBase, color: menu.audioAllowed !== false ? '#ef4444' : '#22c55e'}}
                onMouseEnter={hoverIn} onMouseLeave={hoverOut}
                onClick={() => onAction('TOGGLE_AUDIO')}>
                <span>{menu.audioAllowed !== false ? '🔇' : '🔊'}</span>
                {menu.audioAllowed !== false ? 'Mute for Users' : 'Allow Sound for Users'}
              </button>
            )}
            <Divider />
          </>
        )}

        {/* ── TEXT ACTIONS ── */}
        {isText && (
          <>
            <button style={{...btnBase, color:'#e0e0e0'}}
              onMouseEnter={hoverIn} onMouseLeave={hoverOut}
              onClick={() => onAction('EDIT_TEXT')}>
              <Type size={14}/> Edit Text
            </button>
            <button style={{...btnBase, color:'#e0e0e0'}}
              onMouseEnter={hoverIn} onMouseLeave={hoverOut}
              onClick={() => onAction('CHANGE_COLOR')}>
              <span>🎨</span> Text Color
            </button>
            <button style={{...btnBase, color:'#e0e0e0'}}
              onMouseEnter={hoverIn} onMouseLeave={hoverOut}
              onClick={() => onAction('CHANGE_FONT')}>
              <span style={{fontWeight:900,fontSize:12}}>Aa</span> Change Font
            </button>
            <button style={{...btnBase, color:'#e0e0e0'}}
              onMouseEnter={hoverIn} onMouseLeave={hoverOut}
              onClick={() => onAction('CHANGE_FONT_SIZE')}>
              <span style={{fontSize:10,fontWeight:900}}>T↕</span> Font Size
            </button>
            <Divider />
          </>
        )}

        {/* ── ELEMENT ACTIONS (all types) ── */}
        <button style={{...btnBase, color:'#e0e0e0'}}
          onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          onClick={() => onAction('CHANGE_BG_COLOR')}>
          <span>🖌️</span> Background Color
        </button>
        <button style={{...btnBase, color:'#a3e635'}}
          onMouseEnter={hoverGreen} onMouseLeave={hoverOut}
          onClick={() => onAction('DUPLICATE')}>
          <Layers size={14}/> Duplicate Element
        </button>
        <button style={{...btnBase, color:'#888'}}
          onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          onClick={() => onAction('HIDE')}>
          <span>👁️</span> Hide Element
        </button>

        {/* Delete */}
        <Divider />
        <button style={{...btnBase, color:'#ef4444'}}
          onMouseEnter={(e)=>hoverIn(e,true)} onMouseLeave={hoverOut}
          onClick={() => onAction('DELETE')}>
          <span>🗑️</span> Delete Element
        </button>
      </div>
    </>
  );
}

/* ─── Modal for prompt inputs (Color / Font / FontSize) ─── */
function InputModal({ prompt, placeholder, type, onConfirm, onCancel }) {
  const [value, setValue] = useState(type === 'color' ? '#ffffff' : '');
  return (
    <div style={{position:'fixed',inset:0,zIndex:100000,background:'rgba(0,0,0,0.75)',
      display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
      <div style={{background:'#1a1a24',border:'1px solid #333',borderRadius:'14px',
        padding:'28px',width:'360px',boxShadow:'0 24px 60px rgba(0,0,0,0.85)'}}>
        <h3 style={{margin:'0 0 14px 0',fontSize:'16px',color:'#fff'}}>{prompt}</h3>
        {type === 'color' ? (
          <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
            <input type="color" value={value} onChange={e=>setValue(e.target.value)}
              style={{width:'48px',height:'48px',border:'none',background:'none',cursor:'pointer',borderRadius:'8px'}} />
            <input type="text" value={value} onChange={e=>setValue(e.target.value)}
              style={{flex:1,background:'#000',border:'1px solid #444',borderRadius:'6px',
                padding:'10px 12px',color:'#fff',fontSize:'14px',outline:'none',fontFamily:'monospace'}} />
          </div>
        ) : (
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
        )}
        <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'18px'}}>
          <button onClick={onCancel} style={{padding:'9px 18px',background:'#222',border:'1px solid #333',
            color:'#aaa',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:600}}>Cancel</button>
          <button onClick={()=>onConfirm(value)} style={{padding:'9px 18px',background:'linear-gradient(135deg,#7932ec,#23005c)',border:'none',
            color:'#fff',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:600,
            boxShadow:'0 0 12px rgba(121,50,236,0.4)'}}>Apply</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page Selector ─── */
const PAGES = [
  { label: '🏠 Home Page', value: '/index.html' },
  { label: '🎬 Projects Page', value: '/projects.html' },
];

function PageSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = PAGES.find(p => p.value === value) || PAGES[0];
  return (
    <div style={{position:'relative'}}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display:'flex', alignItems:'center', gap:'8px',
          padding:'8px 14px', background:'rgba(255,255,255,0.07)',
          border:'1px solid rgba(255,255,255,0.18)', color:'#fff',
          borderRadius:'8px', cursor:'pointer', fontWeight:600,
          fontSize:'13px', fontFamily:'Inter,sans-serif',
          transition:'all 0.15s'
        }}>
        <span>{current.label}</span>
        <ChevronDown size={14} style={{transition:'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none'}} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{position:'fixed',inset:0,zIndex:9998}} />
          <div style={{
            position:'absolute', top:'calc(100% + 6px)', left:0, zIndex:9999,
            background:'rgba(14,14,20,0.97)', border:'1px solid rgba(255,255,255,0.15)',
            borderRadius:'10px', padding:'6px', minWidth:'200px',
            boxShadow:'0 16px 40px rgba(0,0,0,0.7)', backdropFilter:'blur(16px)',
          }}>
            {PAGES.map(p => (
              <button key={p.value} onClick={() => { onChange(p.value); setOpen(false); }}
                style={{
                  display:'flex', alignItems:'center', width:'100%', padding:'10px 14px',
                  background: p.value === value ? 'rgba(121,50,236,0.25)' : 'transparent',
                  border:'none', color: p.value === value ? '#a78bfa' : '#ccc',
                  borderRadius:'7px', cursor:'pointer', fontSize:'13px', fontWeight:600,
                  fontFamily:'Inter,sans-serif', transition:'background 0.15s', textAlign:'left'
                }}
                onMouseEnter={e => { if(p.value !== value) e.currentTarget.style.background = 'rgba(121,50,236,0.15)'; }}
                onMouseLeave={e => { if(p.value !== value) e.currentTarget.style.background = 'transparent'; }}
              >{p.label}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── MAIN ─── */
export default function DashboardHome() {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menu, setMenu] = useState({ visible:false, x:0, y:0, isMedia:false, isText:false, tag:'' });
  const [inputModal, setInputModal] = useState(null);
  const [status, setStatus] = useState('waiting');
  const [history, setHistory] = useState({ canUndo: false, canRedo: false, totalStates: 1, currentIndex: 0 });
  const [activePage, setActivePage] = useState('/index.html');

  const [iframeSrc, setIframeSrc] = useState(() => `/index.html?admin=true&t=${Date.now()}`);

  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  // When user picks a different page, reload iframe
  const handlePageChange = useCallback((pageUrl) => {
    setActivePage(pageUrl);
    setStatus('waiting');
    setMenu(m => ({...m, visible: false}));
    setIframeSrc(`${pageUrl}?admin=true&t=${Date.now()}`);
  }, []);

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

  const [isGlobalMuted, setIsGlobalMuted] = useState(true);

  const handleToggleGlobalMute = useCallback(() => {
    setIsGlobalMuted(prev => {
      const next = !prev;
      postToIframe({ type: 'TOGGLE_GLOBAL_MUTE', muted: next });
      return next;
    });
  }, [postToIframe]);

  // ── Message handler ──
  useEffect(() => {
    const handle = (event) => {
      if (!event.data || typeof event.data !== 'object') return;
      const msg = event.data;

      if (msg.type === 'IFRAME_READY') {
        console.log('[Admin] iframe is ready!');
        setStatus('ready');
        postToIframe({ type: 'TOGGLE_GLOBAL_MUTE', muted: isGlobalMuted });
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

        if (mx + 250 > window.innerWidth) mx = window.innerWidth - 255;
        if (mx < 10) mx = 10;
        if (my + 420 > window.innerHeight) my = cr.top + msg.rect.top - 10;
        if (my < 10) my = 10;

        setMenu({
          visible: true, x: mx, y: my,
          isMedia: msg.isMedia,
          isText: msg.isText,
          tag: msg.tag,
          isVideo: msg.isVideo,
          isImage: msg.isImage,
          audioAllowed: msg.audioAllowed !== false
        });
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
      setInputModal({ prompt:'🎨 Text Color', placeholder:'e.g. #ff0000, red', action:'CHANGE_COLOR', type:'color' });
    } else if (action === 'CHANGE_FONT') {
      setInputModal({ prompt:'Aa Font Family', placeholder:"e.g. 'Inter', serif", action:'CHANGE_FONT', type:'text' });
    } else if (action === 'CHANGE_FONT_SIZE') {
      setInputModal({ prompt:'T Font Size', placeholder:"e.g. 24px, 2rem, 1.5em", action:'CHANGE_FONT_SIZE', type:'text' });
    } else if (action === 'CHANGE_BG_COLOR') {
      setInputModal({ prompt:'🖌️ Background Color', placeholder:'e.g. #000000, transparent', action:'CHANGE_BG_COLOR', type:'color' });
    } else if (action === 'REPLACE_MEDIA') {
      setShowMediaModal(true);
    } else if (action === 'DUPLICATE') {
      postToIframe({ type:'EDIT_ACTION', action:'DUPLICATE' });
    } else if (action === 'HIDE') {
      postToIframe({ type:'EDIT_ACTION', action:'HIDE' });
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
    : 'Ready — double-click any element to edit';

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
      {/* Top bar */}
      <div style={{padding:'0 0 16px 0',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
          <div>
            <h2 style={{margin:0,fontSize:'20px',display:'flex',alignItems:'center',gap:'8px'}}>
              <Sparkles size={18} color="#7932ec" /> Visual Editor
            </h2>
            <p style={{margin:'4px 0 0 0',color:'#888',fontSize:'13px'}}>
              <span style={{
                display:'inline-block',width:8,height:8,borderRadius:'50%',marginRight:6,
                background: status==='ready'?'#22c55e':status==='clicked'?'#f59e0b':'#888'
              }}/>
              {statusText}
            </p>
          </div>
          {/* Page Switcher */}
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <span style={{fontSize:'12px',color:'#666',fontWeight:600}}>PAGE:</span>
            <PageSelector value={activePage} onChange={handlePageChange} />
          </div>
        </div>

        {/* Action Controls */}
        <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
          {/* Undo */}
          <button
            onClick={() => postToIframe({ type: 'UNDO' })}
            disabled={!history.canUndo}
            title="Undo (Ctrl+Z)"
            style={{
              background: history.canUndo ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
              border: '1px solid ' + (history.canUndo ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'),
              color: history.canUndo ? '#fff' : '#555',
              padding: '8px 14px', borderRadius: '8px',
              cursor: history.canUndo ? 'pointer' : 'not-allowed',
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
            }}>
            <RotateCcw size={14} /> Undo
          </button>

          {/* Redo */}
          <button
            onClick={() => postToIframe({ type: 'REDO' })}
            disabled={!history.canRedo}
            title="Redo (Ctrl+Y)"
            style={{
              background: history.canRedo ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
              border: '1px solid ' + (history.canRedo ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'),
              color: history.canRedo ? '#fff' : '#555',
              padding: '8px 14px', borderRadius: '8px',
              cursor: history.canRedo ? 'pointer' : 'not-allowed',
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
            }}>
            <RotateCw size={14} /> Redo
          </button>

          {/* Restore */}
          <button
            onClick={() => {
              if (window.confirm('Revert all unsaved changes and restore initial version?')) {
                postToIframe({ type: 'RESTORE_ORIGINAL' });
              }
            }}
            disabled={!history.canUndo}
            title="Restore initial page state"
            style={{
              background: history.canUndo ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.02)',
              border: '1px solid ' + (history.canUndo ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'),
              color: history.canUndo ? '#ef4444' : '#555',
              padding: '8px 14px', borderRadius: '8px',
              cursor: history.canUndo ? 'pointer' : 'not-allowed',
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
              marginRight: '2px'
            }}>
            <History size={14} /> Restore
          </button>

          {/* Mute Toggle */}
          <button
            onClick={handleToggleGlobalMute}
            title={isGlobalMuted ? "Enable Sound in Preview" : "Mute All Audio in Preview"}
            style={{
              background: isGlobalMuted ? 'rgba(239,68,68,0.16)' : 'rgba(34,197,94,0.16)',
              border: '1px solid ' + (isGlobalMuted ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.35)'),
              color: isGlobalMuted ? '#f87171' : '#4ade80',
              padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
              marginRight: '6px', transition: 'all 0.15s ease'
            }}>
            {isGlobalMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            {isGlobalMuted ? 'Muted' : 'Sound On'}
          </button>

          {/* Save & Publish */}
          <button onClick={requestSave} disabled={saving} style={{
            background:'linear-gradient(135deg,#7932ec,#23005c)',border:'none',color:'#fff',
            padding:'8px 20px',borderRadius:'8px',cursor:saving?'not-allowed':'pointer',fontWeight:700,
            display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',
            boxShadow:'0 0 18px rgba(121,50,236,0.5)', transition:'box-shadow 0.2s'}}>
            <Save size={15}/> {saving?'Saving…':'Save & Publish'}
          </button>
        </div>
      </div>

      {/* Edit mode legend */}
      <div style={{
        display:'flex', gap:'20px', marginBottom:'10px', padding:'8px 14px',
        background:'rgba(121,50,236,0.08)', border:'1px solid rgba(121,50,236,0.2)',
        borderRadius:'8px', fontSize:'12px', color:'#888', flexWrap:'wrap'
      }}>
        <span style={{color:'#a78bfa',fontWeight:600}}>💡 How to Edit:</span>
        <span>✏️ <strong style={{color:'#ccc'}}>Double-click any text</strong> → Edit inline</span>
        <span>🖼️ <strong style={{color:'#ccc'}}>Double-click any image</strong> → Replace media</span>
        <span>🎬 <strong style={{color:'#ccc'}}>Double-click any video</strong> → Replace / mute</span>
        <span>🗑️ <strong style={{color:'#ccc'}}>Any element</strong> → Delete / Duplicate / Recolor</span>
      </div>

      {/* Iframe + container */}
      <div ref={containerRef} style={{flex:1,position:'relative',
        border:'1px solid rgba(255,255,255,0.12)',borderRadius:'12px',overflow:'hidden',background:'#000'}}>

        <iframe
          ref={iframeRef}
          src={iframeSrc}
          style={{width:'100%',height:'100%',border:'none',display:'block'}}
        />

        {/* Floating Context Menu */}
        <ContextMenu
          menu={menu}
          onAction={handleMenuAction}
          onClose={handleCloseMenu}
        />

        {/* Input modal for color/font/fontsize/bgcolor */}
        {inputModal && (
          <InputModal
            prompt={inputModal.prompt}
            placeholder={inputModal.placeholder}
            type={inputModal.type}
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

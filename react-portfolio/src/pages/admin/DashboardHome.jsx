import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import MediaLibraryModal from './MediaLibraryModal';
import { Save, Sparkles } from 'lucide-react';

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

  const isVideo = menu.tag === 'VIDEO';
  const isImage = menu.tag === 'IMG';
  const isMedia = isVideo || isImage;

  const headerLabel = isVideo ? '🎬 Video Element'
    : isImage ? '🖼️ Image Element'
    : '✏️ Text Element';

  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:99998}} />
      <div style={{
        position:'fixed', left:menu.x, top:menu.y, zIndex:99999,
        background:'#0f0f14', border:'1px solid rgba(121,50,236,0.5)',
        borderRadius:'10px', padding:'6px', minWidth:'210px',
        boxShadow:'0 16px 40px rgba(0,0,0,0.9), 0 0 20px rgba(121,50,236,0.25)',
      }}>
        {/* Header */}
        <div style={{padding:'6px 12px 8px',fontSize:'11px',fontWeight:700,color:'#7932ec',
          textTransform:'uppercase',letterSpacing:'0.8px',fontFamily:'Inter,sans-serif',
          borderBottom:'1px solid rgba(255,255,255,0.06)',marginBottom:'4px'}}>
          {headerLabel}
        </div>

        {/* TEXT actions */}
        {!isMedia && (
          <>
            <button style={{...btnBase,color:'#e5e5e5'}} onClick={()=>onAction('EDIT_TEXT')}
              onMouseEnter={e=>hoverIn(e)} onMouseLeave={hoverOut}>
              <span style={{fontSize:'16px'}}>✏️</span> Edit Text
            </button>
            <button style={{...btnBase,color:'#e5e5e5'}} onClick={()=>onAction('CHANGE_COLOR')}
              onMouseEnter={e=>hoverIn(e)} onMouseLeave={hoverOut}>
              <span style={{fontSize:'16px'}}>🎨</span> Change Colour
            </button>
            <button style={{...btnBase,color:'#e5e5e5'}} onClick={()=>onAction('CHANGE_FONT')}
              onMouseEnter={e=>hoverIn(e)} onMouseLeave={hoverOut}>
              <span style={{fontSize:'16px'}}>Aa</span> Change Font
            </button>
          </>
        )}

        {/* VIDEO actions */}
        {isVideo && (
          <button style={{...btnBase,color:'#e5e5e5'}} onClick={()=>onAction('REPLACE_MEDIA')}
            onMouseEnter={e=>hoverIn(e)} onMouseLeave={hoverOut}>
            <span style={{fontSize:'16px'}}>🎬</span> Replace Video
          </button>
        )}

        {/* IMAGE actions */}
        {isImage && (
          <button style={{...btnBase,color:'#e5e5e5'}} onClick={()=>onAction('REPLACE_MEDIA')}
            onMouseEnter={e=>hoverIn(e)} onMouseLeave={hoverOut}>
            <span style={{fontSize:'16px'}}>🖼️</span> Replace Image
          </button>
        )}

        <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',margin:'4px 0'}} />
        <button style={{...btnBase,color:'#ef4444'}} onClick={()=>onAction('DELETE')}
          onMouseEnter={e=>hoverIn(e,true)} onMouseLeave={hoverOut}>
          <span style={{fontSize:'16px'}}>🗑️</span> Delete Element
        </button>
      </div>
    </>
  );
}

/* ─── Input Modal ─── */
function InputModal({ prompt, placeholder, onConfirm, onCancel }) {
  const [value, setValue] = useState('');
  return (
    <div style={{position:'fixed',inset:0,zIndex:100000,background:'rgba(0,0,0,0.8)',
      backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#111',border:'1px solid #333',borderRadius:'12px',
        padding:'28px',width:'360px',boxShadow:'0 20px 50px rgba(0,0,0,0.6)',
        fontFamily:'Inter,sans-serif',color:'#fff'}}>
        <p style={{margin:'0 0 16px',fontWeight:600,fontSize:'15px'}}>{prompt}</p>
        <input autoFocus value={value} onChange={e=>setValue(e.target.value)}
          onKeyDown={e=>{if(e.key==='Enter')onConfirm(value);if(e.key==='Escape')onCancel();}}
          placeholder={placeholder}
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
  const [status, setStatus] = useState('waiting'); // 'waiting' | 'ready' | 'clicked'

  // Store iframe URL switch timestamp once to avoid reloading on parent component re-renders
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

  // ── Message handler ──
  useEffect(() => {
    const handle = (event) => {
      if (!event.data || typeof event.data !== 'object') return;
      const msg = event.data;

      if (msg.type === 'IFRAME_READY') {
        console.log('[Admin] iframe is ready!');
        setStatus('ready');
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

        // Position context menu adjacent to the double-pressed component frame
        let mx = cr.left + msg.rect.left + 16;
        let my = cr.top + msg.rect.top + 16;

        // If component is compact or near bottom, adjust position
        if (msg.rect.height < 100) {
          my = cr.top + msg.rect.top + msg.rect.height + 8;
        }

        // Viewport bounds protection
        if (mx + 230 > window.innerWidth) mx = window.innerWidth - 240;
        if (mx < 10) mx = 10;
        if (my + 280 > window.innerHeight) my = cr.top + msg.rect.top - 10;
        if (my < 10) my = 10;

        setMenu({ visible:true, x:mx, y:my, isMedia:msg.isMedia, tag:msg.tag });
        setStatus('ready');
      }

      if (msg.type === 'REQUEST_MEDIA') setShowMediaModal(true);

      if (msg.type === 'SAVE_CONTENT') {
        saveContentToDatabase(msg.content, msg.page);
      }
    };
    window.addEventListener('message', handle);
    return () => window.removeEventListener('message', handle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenu(m => ({ ...m, visible: false }));
    postToIframe({ type: 'DESELECT' });
  }, [postToIframe]);

  // ── Context menu actions ──
  const handleMenuAction = useCallback((action) => {
    setMenu(m => ({...m, visible:false}));
    if (action === 'EDIT_TEXT') {
      postToIframe({ type:'EDIT_ACTION', action:'EDIT_TEXT' });
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
      alert('✅ Saved!');
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
      <div style={{padding:'0 0 16px 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
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
        <div style={{display:'flex',gap:'12px'}}>
          <button onClick={requestSave} disabled={saving} style={{
            background:'linear-gradient(135deg,#7932ec,#23005c)',border:'none',color:'#fff',
            padding:'8px 20px',borderRadius:'8px',cursor:'pointer',fontWeight:600,
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
          title="Visual Builder" />

        {/* Status pill */}
        <div style={{position:'absolute',bottom:12,left:'50%',transform:'translateX(-50%)',
          background: status==='ready'?'rgba(121,50,236,0.85)':'rgba(100,100,100,0.7)',
          color:'#fff',padding:'5px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:600,
          zIndex:20,pointerEvents:'none',fontFamily:'Inter,sans-serif'}}>
          {statusText}
        </div>
      </div>

      <ContextMenu menu={menu} onAction={handleMenuAction} onClose={handleCloseMenu} />
      {inputModal && <InputModal prompt={inputModal.prompt} placeholder={inputModal.placeholder}
        onConfirm={handleInputConfirm} onCancel={()=>setInputModal(null)} />}
      {showMediaModal && <MediaLibraryModal onClose={()=>setShowMediaModal(false)} onSelect={handleMediaSelect} />}
    </div>
  );
}

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import MediaLibraryModal from './MediaLibraryModal';
import { FolderKanban, Home, Save, Sparkles } from 'lucide-react';

const editablePages = [
  { id: 'home', label: 'Home', path: '/index.html', Icon: Home },
  { id: 'projects', label: 'Projects', path: '/projects.html', Icon: FolderKanban },
];

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

  const hasVideo = menu.hasVideo || menu.tag === 'VIDEO';
  const hasImage = menu.hasImage || menu.tag === 'IMG';
  const hasText = menu.hasText !== false;
  const isLink  = menu.isLink;

  const headerLabel = hasVideo ? '🎬 Video Frame Component'
    : hasImage ? '🖼️ Image Element'
    : isLink ? '🔗 Link / Button Element'
    : '⚡ Component Element';

  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:99998}} />
      <div style={{
        position:'fixed', left:menu.x, top:menu.y, zIndex:99999,
        background:'#0f0f14', border:'1px solid rgba(121,50,236,0.5)',
        borderRadius:'10px', padding:'6px', minWidth:'230px',
        boxShadow:'0 16px 40px rgba(0,0,0,0.9), 0 0 20px rgba(121,50,236,0.25)',
      }}>
        {/* Header */}
        <div style={{padding:'6px 12px 8px',fontSize:'11px',fontWeight:700,color:'#7932ec',
          textTransform:'uppercase',letterSpacing:'0.8px',fontFamily:'Inter,sans-serif',
          borderBottom:'1px solid rgba(255,255,255,0.06)',marginBottom:'4px'}}>
          {headerLabel}
        </div>

        {/* DEDICATED IMAGE EDIT OPTION */}
        {hasImage && !hasVideo && (
          <div style={{marginBottom:'4px'}}>
            <div style={{padding:'4px 12px 2px',fontSize:'10px',fontWeight:700,color:'#888',textTransform:'uppercase',letterSpacing:'0.5px'}}>
              Image Edit Option
            </div>
            <button style={{...btnBase,color:'#fff',background:'rgba(121,50,236,0.2)'}} onClick={()=>onAction('REPLACE_MEDIA')}
              onMouseEnter={e=>hoverIn(e)} onMouseLeave={e=>e.currentTarget.style.background='rgba(121,50,236,0.2)'}>
              <span style={{fontSize:'16px'}}>🖼️</span> Replace Image
            </button>
          </div>
        )}

        {(hasVideo || hasImage) && (
          <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',margin:'4px 0'}} />
        )}

        {/* DEDICATED TEXT EDIT OPTIONS */}
        {hasText && (
          <>
            <div style={{padding:'4px 12px 2px',fontSize:'10px',fontWeight:700,color:'#888',textTransform:'uppercase',letterSpacing:'0.5px'}}>
              Text Edit Options
            </div>
            <button style={{...btnBase,color:'#e5e5e5'}} onClick={()=>onAction('EDIT_TEXT')}
              onMouseEnter={e=>hoverIn(e)} onMouseLeave={hoverOut}>
              <span style={{fontSize:'16px'}}>✏️</span> Edit Text
            </button>
            {isLink && (
              <button style={{...btnBase,color:'#e5e5e5'}} onClick={()=>onAction('EDIT_LINK')}
                onMouseEnter={e=>hoverIn(e)} onMouseLeave={hoverOut}>
                <span style={{fontSize:'16px'}}>🔗</span> Edit Link URL
              </button>
            )}
            <button style={{...btnBase,color:'#e5e5e5'}} onClick={()=>onAction('CHANGE_COLOR')}
              onMouseEnter={e=>hoverIn(e)} onMouseLeave={hoverOut}>
              <span style={{fontSize:'16px'}}>🎨</span> Text Colour
            </button>
            <button style={{...btnBase,color:'#e5e5e5'}} onClick={()=>onAction('CHANGE_FONT')}
              onMouseEnter={e=>hoverIn(e)} onMouseLeave={hoverOut}>
              <span style={{fontSize:'16px'}}>Aa</span> Change Font
            </button>
          </>
        )}

        <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',margin:'4px 0'}} />

        <button style={{...btnBase,color:'#e5e5e5'}} onClick={()=>onAction('CHANGE_BG_COLOR')}
          onMouseEnter={e=>hoverIn(e)} onMouseLeave={hoverOut}>
          <span style={{fontSize:'16px'}}>🖌️</span> Background Colour
        </button>

        <button style={{...btnBase,color:'#e5e5e5'}} onClick={()=>onAction('DUPLICATE')}
          onMouseEnter={e=>hoverIn(e)} onMouseLeave={hoverOut}>
          <span style={{fontSize:'16px'}}>📋</span> Duplicate Element
        </button>

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
  const [selectedPage, setSelectedPage] = useState(editablePages[0]);
  const [iframeVersion, setIframeVersion] = useState(() => Date.now());
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState('saved'); // 'saved' | 'unsaved' | 'saving'
  const [toastMessage, setToastMessage] = useState('');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [menu, setMenu] = useState({ visible:false, x:0, y:0, isMedia:false, hasVideo:false, hasImage:false, hasText:true, tag:'', logicalVideoId:null });
  const [inputModal, setInputModal] = useState(null);
  const [status, setStatus] = useState('waiting'); // 'waiting' | 'ready' | 'clicked'
  const [showVideoManager, setShowVideoManager] = useState(false);
  const [videoList, setVideoList] = useState([]);
  const [replacingVideoId, setReplacingVideoId] = useState(null);

  const iframeSrc = `${selectedPage.path}?admin=true&t=${iframeVersion}`;

  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  const handlePageSelect = useCallback((page) => {
    setSelectedPage(page);
    setIframeVersion(Date.now());
    setStatus('waiting');
    setSaveState('saved');
    setCanUndo(false);
    setCanRedo(false);
    setMenu(m => ({ ...m, visible: false }));
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

  // ── Message handler ──
  useEffect(() => {
    const handle = (event) => {
      if (!event.data || typeof event.data !== 'object') return;
      const msg = event.data;

      if (msg.type === 'VIDEO_LIST') {
        setVideoList(msg.list);
      }

      if (msg.type === 'IFRAME_READY') {
        console.log('[Admin] iframe is ready!');
        setStatus('ready');
      }

      if (msg.type === 'HISTORY_STATE') {
        setCanUndo(Boolean(msg.canUndo));
        setCanRedo(Boolean(msg.canRedo));
        if (msg.canUndo) setSaveState('unsaved');
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

        setMenu({
          visible: true,
          x: mx,
          y: my,
          isMedia: msg.isMedia,
          hasVideo: msg.hasVideo,
          hasImage: msg.hasImage,
          hasText: msg.hasText,
          tag: msg.tag,
          isLink: msg.isLink,
          linkHref: msg.linkHref,
          logicalVideoId: msg.logicalVideoId
        });
        setStatus('ready');
      }

      if (msg.type === 'EDITING_DONE') {
        setSaveState('unsaved');
      }

      if (msg.type === 'REQUEST_MEDIA') setShowMediaModal(true);

      if (msg.type === 'SAVE_ERROR') {
        setSaving(false);
        setSaveState('unsaved');
        alert('❌ Save blocked: ' + (msg.message || 'Unknown error'));
      }

      if (msg.type === 'REPLACEMENT_SUCCESS') {
        setToastMessage('✓ ' + msg.message);
        setTimeout(() => setToastMessage(''), 5000);
      }

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
    setSaveState('unsaved');
    if (action === 'EDIT_TEXT') {
      postToIframe({ type:'EDIT_ACTION', action:'EDIT_TEXT' });
    } else if (action === 'EDIT_LINK') {
      setInputModal({ prompt:'🔗 Enter link destination URL:', placeholder:'e.g. /projects.html, https://...', action:'EDIT_LINK' });
    } else if (action === 'CHANGE_COLOR') {
      setInputModal({ prompt:'🎨 Enter text colour:', placeholder:'e.g. #ff0000, white, rgb(...)', action:'CHANGE_COLOR' });
    } else if (action === 'CHANGE_BG_COLOR') {
      setInputModal({ prompt:'🖌️ Enter background colour:', placeholder:'e.g. #111, rgba(0,0,0,0.5)', action:'CHANGE_BG_COLOR' });
    } else if (action === 'CHANGE_FONT') {
      setInputModal({ prompt:'Aa Enter font family:', placeholder:"e.g. 'Inter', 'Outfit', sans-serif", action:'CHANGE_FONT' });
    } else if (action === 'DUPLICATE') {
      postToIframe({ type:'EDIT_ACTION', action:'DUPLICATE' });
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
    setSaveState('unsaved');
  }, [inputModal, postToIframe]);

  const handleMediaSelect = useCallback((url) => {
    if (replacingVideoId) {
      postToIframe({ type:'MEDIA_SELECTED', logicalVideoId: replacingVideoId, url });
      setReplacingVideoId(null);
    } else {
      postToIframe({ type:'MEDIA_SELECTED', logicalVideoId: menu.logicalVideoId, url });
    }
    setShowMediaModal(false);
    setSaveState('unsaved');
  }, [postToIframe, menu.logicalVideoId, replacingVideoId]);

  const requestUndo = () => postToIframe({ type: 'UNDO' });
  const requestRedo = () => postToIframe({ type: 'REDO' });
  const requestResetDefault = () => {
    if (window.confirm('Are you sure you want to reset this page to its default template?')) {
      postToIframe({ type: 'RESET_DEFAULT' });
    }
  };

  const requestSave = () => { setSaving(true); setSaveState('saving'); postToIframe({ type:'REQUEST_SAVE' }); };

  const saveContentToDatabase = async (htmlContent, pageName) => {
    try {
      setSaving(true);
      setSaveState('saving');
      const { data:{session}, error:sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('Session expired. Please log in again.');
      const normalizedPageName = (pageName || '').replace(/^\/+/, '').replace(/\.html$/, '');
      const col = normalizedPageName === 'projects' ? 'seo_keywords' : 'site_description';
      const { data:existing, error:selErr } = await supabase.from('site_settings').select('id').limit(1);
      if (selErr) throw selErr;
      if (existing && existing.length > 0) {
        const { error:upErr, count } = await supabase.from('site_settings')
          .update({[col]:htmlContent},{count:'exact'}).eq('id',existing[0].id);
        if (upErr) throw upErr;
        if (count === 0) throw new Error('0 rows updated — check DB permissions.');
      } else {
        const { error:insErr } = await supabase.from('site_settings').insert([{[col]:htmlContent}]);
        if (insErr) throw insErr;
      }

      // ── Broadcast to all open live-site tabs on the same browser ──
      // This gives INSTANT sync without waiting for Supabase Realtime.
      try {
        const syncChannel = new BroadcastChannel('scrollz-cms-sync');
        syncChannel.postMessage({
          type: 'CONTENT_UPDATED',
          page: normalizedPageName,
          timestamp: Date.now(),
        });
        syncChannel.close();
        console.log('[Admin] 📡 Broadcast sent to live site tabs.');
      } catch (broadcastErr) {
        console.warn('[Admin] BroadcastChannel not available:', broadcastErr);
      }

      setSaveState('saved');
      setToastMessage('✅ Saved & Published Live! The public site has been updated.');
      setTimeout(() => setToastMessage(''), 5000);
    } catch(err) {
      console.error('Save failed:', err);
      setSaveState('unsaved');
      setToastMessage('❌ Save failed: ' + err.message);
      setTimeout(() => setToastMessage(''), 6000);
    } finally { setSaving(false); }
  };

  const statusText = status === 'waiting' ? 'Connecting to preview…'
    : status === 'clicked' ? 'Finding element…'
    : 'Ready — double-click to edit';

  const containerWidth = deviceMode === 'tablet' ? '768px' : deviceMode === 'mobile' ? '390px' : '100%';

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
      {/* Top bar */}
      <div style={{padding:'0 0 16px 0',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h2 style={{margin:0,fontSize:'20px',display:'flex',alignItems:'center',gap:'8px'}}>
            <Sparkles size={18} color="#7932ec" /> Scrollz Visual Editor
          </h2>
          <p style={{margin:'4px 0 0 0',color:'#888',fontSize:'13px',display:'flex',alignItems:'center',gap:'8px'}}>
            <span style={{
              display:'inline-block',width:8,height:8,borderRadius:'50%',
              background: saveState==='saved'?'#22c55e':saveState==='saving'?'#a855f7':'#f59e0b'
            }}/>
            <span style={{fontWeight:600,color: saveState==='saved'?'#22c55e':saveState==='saving'?'#a855f7':'#f59e0b'}}>
              {saveState==='saved' ? 'Saved Live' : saveState==='saving' ? 'Saving…' : 'Unsaved Changes'}
            </span>
          </p>
        </div>

        <div style={{display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap'}}>
          {/* Page Switcher */}
          <div style={{display:'flex',gap:'4px',padding:'4px',background:'#111',border:'1px solid #222',borderRadius:'8px'}}>
            {editablePages.map(page => {
              const Icon = page.Icon;
              const isActive = selectedPage.id === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => handlePageSelect(page)}
                  style={{
                    background: isActive ? '#7932ec' : 'transparent',
                    color: isActive ? '#fff' : '#aaa',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Icon size={14} /> {page.label}
                </button>
              );
            })}
          </div>

          {/* Viewport Mode Switcher */}
          <div style={{display:'flex',gap:'4px',padding:'4px',background:'#111',border:'1px solid #222',borderRadius:'8px'}}>
            <button onClick={()=>setDeviceMode('desktop')} style={{
              background: deviceMode==='desktop'?'#222':'transparent',
              color: deviceMode==='desktop'?'#fff':'#888',
              border:'none',padding:'6px 10px',borderRadius:'6px',cursor:'pointer',fontSize:'12px',fontWeight:600
            }} title="Desktop View">💻 Desktop</button>
            <button onClick={()=>setDeviceMode('tablet')} style={{
              background: deviceMode==='tablet'?'#222':'transparent',
              color: deviceMode==='tablet'?'#fff':'#888',
              border:'none',padding:'6px 10px',borderRadius:'6px',cursor:'pointer',fontSize:'12px',fontWeight:600
            }} title="Tablet View">📱 Tablet</button>
            <button onClick={()=>setDeviceMode('mobile')} style={{
              background: deviceMode==='mobile'?'#222':'transparent',
              color: deviceMode==='mobile'?'#fff':'#888',
              border:'none',padding:'6px 10px',borderRadius:'6px',cursor:'pointer',fontSize:'12px',fontWeight:600
            }} title="Mobile View">📲 Mobile</button>
          </div>

          {/* Action Toolbar: Undo, Redo, Reset Default, Save */}
          <div style={{display:'flex',gap:'6px'}}>
            <button onClick={() => { setShowVideoManager(true); postToIframe({type: 'REQUEST_VIDEO_LIST'}); }} style={{
              background:'#111',border:'1px solid #333',color:'#fff',
              padding:'6px 12px',borderRadius:'8px',cursor:'pointer',fontSize:'12px',fontWeight:600
            }} title="Manage permanent Video IDs">🎬 Video ID Manager</button>

            <button onClick={requestUndo} disabled={!canUndo} style={{
              background:'#111',border:'1px solid #333',color: canUndo?'#fff':'#555',
              padding:'6px 12px',borderRadius:'8px',cursor: canUndo?'pointer':'default',fontSize:'12px',fontWeight:600
            }} title="Undo last change">↩️ Undo</button>

            <button onClick={requestRedo} disabled={!canRedo} style={{
              background:'#111',border:'1px solid #333',color: canRedo?'#fff':'#555',
              padding:'6px 12px',borderRadius:'8px',cursor: canRedo?'pointer':'default',fontSize:'12px',fontWeight:600
            }} title="Redo change">↪️ Redo</button>

            <button onClick={requestResetDefault} style={{
              background:'#111',border:'1px solid #333',color:'#aaa',
              padding:'6px 12px',borderRadius:'8px',cursor:'pointer',fontSize:'12px',fontWeight:600
            }} title="Reset to default template">🔄 Default</button>

            <button onClick={requestSave} disabled={saving} style={{
              background:'linear-gradient(135deg,#7932ec,#23005c)',border:'none',color:'#fff',
              padding:'7px 18px',borderRadius:'8px',cursor:'pointer',fontWeight:600,
              display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',
              boxShadow:'0 0 15px rgba(121,50,236,0.4)'}}>
              <Save size={15}/> {saving?'Saving…':'Save & Publish'}
            </button>
          </div>
        </div>
      </div>

      {/* Iframe + container */}
      <div style={{flex:1,display:'flex',justifyContent:'center',alignItems:'stretch',background:'#0a0a0e',borderRadius:'12px',overflow:'hidden',padding:'12px'}}>
        <div ref={containerRef} style={{width:containerWidth,height:'100%',position:'relative',
          border:'1px solid rgba(255,255,255,0.12)',borderRadius:'12px',overflow:'hidden',background:'#000',transition:'width 0.3s cubic-bezier(0.16,1,0.3,1)'}}>

          {/* Toast — shown above iframe, color depends on success/error */}
          {toastMessage && (
            <div style={{
              position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
              background: toastMessage.startsWith('❌') ? '#ef4444' : '#22c55e',
              color: 'white', padding: '12px 24px', borderRadius: '10px',
              fontWeight: 600, zIndex: 99999,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              whiteSpace: 'nowrap', fontSize: '14px',
              animation: 'fadeInDown 0.3s ease',
            }}>
              {toastMessage}
            </div>
          )}

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
      </div>

      <ContextMenu menu={menu} onAction={handleMenuAction} onClose={handleCloseMenu} />
      {inputModal && <InputModal prompt={inputModal.prompt} placeholder={inputModal.placeholder}
        onConfirm={handleInputConfirm} onCancel={()=>setInputModal(null)} />}
      {showVideoManager && (
        <div style={{position:'fixed',inset:0,zIndex:100000,background:'rgba(0,0,0,0.8)',display:'flex',justifyContent:'flex-end'}}>
          <div style={{width:'400px',background:'#0a0a0e',borderLeft:'1px solid #333',display:'flex',flexDirection:'column',color:'#fff',boxShadow:'-10px 0 30px rgba(0,0,0,0.5)'}}>
            <div style={{padding:'20px',borderBottom:'1px solid #222',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 style={{margin:0,fontSize:'18px',fontFamily:'Inter',display:'flex',alignItems:'center',gap:'8px'}}>🎬 Video ID Manager</h3>
              <button onClick={()=>setShowVideoManager(false)} style={{background:'transparent',border:'none',color:'#888',fontSize:'20px',cursor:'pointer'}}>×</button>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'20px',display:'flex',flexDirection:'column',gap:'16px'}}>
              {videoList.length === 0 ? <p style={{color:'#888',fontSize:'14px',textAlign:'center'}}>No videos found.</p> : null}
              {videoList.map(v => (
                <div key={v.id || v.trackingId} style={{background:'#111',border:'1px solid #222',borderRadius:'10px',padding:'16px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
                    <div>
                      <div style={{color:v.isUnassigned?'#ef4444':'#7932ec',fontWeight:700,fontSize:'12px',fontFamily:'monospace',marginBottom:'4px'}}>{v.id || 'Unassigned Video'}</div>
                      <div style={{fontWeight:600,fontSize:'14px',color:'#e5e5e5'}}>{v.friendlyName}</div>
                    </div>
                  </div>
                  
                  {v.src && (
                    <div style={{width:'100%',height:'120px',background:'#000',borderRadius:'6px',marginBottom:'12px',overflow:'hidden'}}>
                      <video src={v.src} muted loop autoPlay playsInline style={{width:'100%',height:'100%',objectFit:'cover'}}></video>
                    </div>
                  )}

                  <div style={{fontSize:'11px',color:'#888',marginBottom:'16px',display:'flex',gap:'6px',flexWrap:'wrap'}}>
                    {v.variants.map(variant => (
                      <span key={variant} style={{background:'#222',padding:'2px 6px',borderRadius:'4px',textTransform:'capitalize'}}>{variant}</span>
                    ))}
                  </div>

                  <div style={{display:'flex',gap:'8px'}}>
                    <button onClick={()=>{
                      postToIframe({ type: 'HIGHLIGHT_VIDEO', logicalVideoId: v.id });
                      setShowVideoManager(false);
                    }} style={{flex:1,background:'#222',border:'1px solid #333',color:'#ccc',padding:'8px',borderRadius:'6px',cursor:'pointer',fontSize:'12px',fontWeight:600}}>View in Editor</button>
                    
                    {!v.isUnassigned ? (
                      <button onClick={()=>{
                        setReplacingVideoId(v.id);
                        setShowMediaModal(true);
                      }} style={{flex:1,background:'rgba(121,50,236,0.2)',border:'1px solid rgba(121,50,236,0.5)',color:'#fff',padding:'8px',borderRadius:'6px',cursor:'pointer',fontSize:'12px',fontWeight:600}}>Replace Video</button>
                    ) : (
                      <button onClick={()=>{
                        const ids = videoList.filter(x=>!x.isUnassigned && x.id.startsWith('VID-')).map(x=>parseInt(x.id.replace('VID-',''))).filter(n=>!isNaN(n));
                        const nextNum = ids.length > 0 ? Math.max(...ids) + 1 : 1;
                        const nextId = 'VID-' + nextNum.toString().padStart(3, '0');
                        postToIframe({ type: 'ASSIGN_VIDEO_ID', trackingId: v.trackingId, newId: nextId });
                      }} style={{flex:1,background:'rgba(239,68,68,0.2)',border:'1px solid rgba(239,68,68,0.5)',color:'#fff',padding:'8px',borderRadius:'6px',cursor:'pointer',fontSize:'12px',fontWeight:600}}>Assign Video ID</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showMediaModal && <MediaLibraryModal onClose={()=>setShowMediaModal(false)} onSelect={handleMediaSelect} />}
    </div>
  );
}

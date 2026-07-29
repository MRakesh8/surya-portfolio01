(function() {
  'use strict';

  /* ══════════════════════════════════════════════════
   *  ADMIN MODE DETECTION
   * ══════════════════════════════════════════════════ */
  var isAdmin = false;
  try {
    var editorParams = new URLSearchParams(window.location.search);
    if (editorParams.get('admin') === 'true') {
      isAdmin = true;
    } else if (window.self !== window.top) {
      try {
        if (window.parent && window.parent.location.pathname.indexOf('/admin') !== -1) {
          isAdmin = true;
        }
      } catch(e) { isAdmin = true; }
    }
  } catch(e) {
    isAdmin = (window.self !== window.top);
  }

  /* ══════════════════════════════════════════════════
   *  MUTE / UNMUTE BUTTON — injected on ALL videos
   * ══════════════════════════════════════════════════ */
  function injectMuteControls() {
    var videos = document.querySelectorAll('video');
    videos.forEach(function(vid) {
      if (vid.dataset.muteInjected) {
        if (vid._updateMuteControl) vid._updateMuteControl();
        return;
      }
      vid.dataset.muteInjected = 'true';
      vid.style.setProperty('object-fit', 'cover', 'important');
      vid.style.setProperty('width', '100%', 'important');
      vid.style.setProperty('height', '100%', 'important');
      vid.style.setProperty('display', 'block', 'important');
      vid.muted = true;

      var wrapper = vid.parentElement;
      if (!wrapper) return;
      var wrapperPos = window.getComputedStyle(wrapper).position;
      if (wrapperPos === 'static') wrapper.style.position = 'relative';

      var btn = document.createElement('button');
      btn.className = 've-mute-btn';
      btn.style.cssText = [
        'position:absolute','top:12px','right:12px','z-index:9999',
        'width:38px','height:38px','border-radius:50%',
        'background:rgba(0,0,0,0.7)','border:1.5px solid rgba(255,255,255,0.4)',
        'color:#fff','font-size:16px','cursor:pointer',
        'display:flex','align-items:center','justify-content:center',
        'backdrop-filter:blur(8px)','-webkit-backdrop-filter:blur(8px)',
        'transition:background 0.18s, transform 0.15s',
        'pointer-events:all !important','outline:none',
        'box-shadow:0 4px 16px rgba(0,0,0,0.5)',
      ].join(';');

      function muteIcon() { return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'; }
      function soundIcon() { return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>'; }

      function updateIcon() {
        btn.innerHTML = vid.muted ? muteIcon() : soundIcon();
        btn.setAttribute('aria-label', vid.muted ? 'Unmute video' : 'Mute video');
        btn.title = vid.muted ? 'Click to Unmute Sound' : 'Click to Mute Sound';
      }

      function updateVisibility() {
        var audioAllowed = vid.getAttribute('data-audio-allowed') !== 'false';
        if (!audioAllowed) {
          vid.muted = true;
          if (!isAdmin) { btn.style.display = 'none'; }
          else { btn.style.display = 'flex'; btn.style.opacity = '0.5'; btn.title = 'Sound disabled for users'; btn.innerHTML = muteIcon(); }
        } else {
          btn.style.display = 'flex'; btn.style.opacity = '1'; updateIcon();
        }
      }

      vid._updateMuteControl = updateVisibility;
      vid._updateMuteIcon = updateIcon;
      updateVisibility();

      btn.addEventListener('mouseenter', function() { btn.style.background = 'rgba(121,50,236,0.9)'; btn.style.transform = 'scale(1.1)'; });
      btn.addEventListener('mouseleave', function() { btn.style.background = 'rgba(0,0,0,0.7)'; btn.style.transform = 'scale(1)'; });
      btn.addEventListener('click', function(e) {
        e.stopPropagation(); e.preventDefault();
        var audioAllowed = vid.getAttribute('data-audio-allowed') !== 'false';
        if (!audioAllowed && !isAdmin) { vid.muted = true; return; }
        if (vid.muted) {
          document.querySelectorAll('video').forEach(function(ov) { if (ov !== vid) { ov.muted = true; if (ov._updateMuteIcon) ov._updateMuteIcon(); } });
          vid.muted = false; vid.play().catch(function(){});
        } else { vid.muted = true; }
        updateIcon();
      });

      function checkAudio() { if (vid.mozHasAudio === false || (vid.audioTracks && vid.audioTracks.length === 0)) { btn.style.display = 'none'; } }
      vid.addEventListener('loadedmetadata', checkAudio);
      if (vid.readyState >= 1) checkAudio();
      wrapper.appendChild(btn);
    });
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', injectMuteControls); }
  else { injectMuteControls(); }
  setTimeout(injectMuteControls, 800);
  setTimeout(injectMuteControls, 2500);

  /* ══════════════════════════════════════════════════
   *  ADMIN EDITOR — only when isAdmin = true
   * ══════════════════════════════════════════════════ */
  if (!isAdmin) return;

  console.log('[VE] visual-editor v35 — Universal Edit for ALL elements starting…');

  var currentTarget = null;
  window.lastSelectedElement = null;
  var currentlyPausedVideo = null;
  var activeEditingElement = null;

  /* ══════════════════════════════════════════════════
   *  HISTORY STACK
   * ══════════════════════════════════════════════════ */
  var historyStack = [];
  var historyIndex = -1;
  var MAX_HISTORY = 50;

  function getCleanSnapshot() {
    var mainEl = document.getElementById('main') || document.body;
    var clone = mainEl.cloneNode(true);
    ['#__framer-badge-container','#ve-styles-editor'].forEach(function(sel) {
      var n = clone.querySelector(sel); if (n) n.remove();
    });
    clone.querySelectorAll('[data-ve-sel]').forEach(function(n) { n.removeAttribute('data-ve-sel'); n.style.outline = ''; });
    clone.querySelectorAll('.ve-mute-btn,.ve-edit-badge,.ve-hover-label').forEach(function(n) { n.remove(); });
    clone.querySelectorAll('[contenteditable]').forEach(function(n) { n.removeAttribute('contenteditable'); });
    return clone.innerHTML;
  }

  function notifyHistoryStatus() {
    try { window.parent.postMessage({ type:'HISTORY_UPDATE', canUndo:historyIndex>0, canRedo:historyIndex<historyStack.length-1, totalStates:historyStack.length, currentIndex:historyIndex }, '*'); } catch(e){}
  }

  function pushHistoryState() {
    var snapshot = getCleanSnapshot();
    if (historyIndex >= 0 && historyStack[historyIndex] === snapshot) return;
    if (historyIndex < historyStack.length - 1) historyStack.splice(historyIndex + 1);
    historyStack.push(snapshot);
    if (historyStack.length > MAX_HISTORY) historyStack.shift();
    historyIndex = historyStack.length - 1;
    notifyHistoryStatus();
  }

  function applySnapshot(snapshot) {
    clearSelection(); resumePausedVideo(); currentTarget = null; window.lastSelectedElement = null;
    var mainEl = document.getElementById('main') || document.body;
    mainEl.innerHTML = snapshot;
    setTimeout(injectMuteControls, 100);
    notifyHistoryStatus();
  }

  function undoState() { if (historyIndex > 0) { historyIndex--; applySnapshot(historyStack[historyIndex]); } }
  function redoState() { if (historyIndex < historyStack.length - 1) { historyIndex++; applySnapshot(historyStack[historyIndex]); } }
  function restoreOriginalState() { if (historyStack.length > 0) { historyIndex = 0; applySnapshot(historyStack[0]); } }

  setTimeout(function() { pushHistoryState(); }, 1500);

  window.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { if (e.shiftKey) { e.preventDefault(); redoState(); } else { e.preventDefault(); undoState(); } }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redoState(); }
  });

  /* ══════════════════════════════════════════════════
   *  GLOBAL ADMIN CSS — overrides ALL Framer blocks
   * ══════════════════════════════════════════════════ */
  var adminStyle = document.createElement('style');
  adminStyle.id = 've-styles-editor';
  adminStyle.innerHTML = [
    /* Force ALL elements to be clickable & visible to the editor */
    '*, *::before, *::after { pointer-events: auto !important; cursor: crosshair !important; }',
    /* Except our own UI buttons */
    '.ve-mute-btn, .ve-mute-btn * { pointer-events: auto !important; cursor: pointer !important; }',
    '.ve-edit-badge, .ve-hover-label { pointer-events: none !important; cursor: default !important; }',
    /* Allow text selection in contenteditable */
    '[contenteditable="true"], [contenteditable="true"] * { user-select: text !important; -webkit-user-select: text !important; pointer-events: auto !important; cursor: text !important; }',
    /* Selection ring */
    '[data-ve-sel="1"] { outline: 2.5px solid #2563eb !important; outline-offset: 3px !important; box-shadow: 0 0 0 4px rgba(37,99,235,0.25), 0 0 14px rgba(37,99,235,0.35) !important; border-radius: 4px !important; }',
    /* Editing ring */
    '[contenteditable="true"] { outline: 2.5px dashed #2563eb !important; outline-offset: 3px !important; box-shadow: 0 0 0 4px rgba(37,99,235,0.2) !important; border-radius: 4px !important; }',
    /* Scrollbar */
    '::-webkit-scrollbar { width: 10px !important; } ::-webkit-scrollbar-track { background: #06060a !important; } ::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#7932ec,#4c1d95) !important; border-radius: 99px !important; border: 2px solid #06060a !important; }',
    '* { scrollbar-width: thin !important; scrollbar-color: #7932ec #06060a !important; }',
    /* Ticker animations */
    '.framer-6lep06 ul, .framer-18eru5x ul, [data-framer-name="Edited Video Wrapper"] ul, .ticker-track ul, .ticker-inner { opacity:1 !important; visibility:visible !important; display:flex !important; width:max-content !important; animation:tickerAutoMove 28s linear infinite !important; }',
    '@keyframes tickerAutoMove { 0% { transform:translate3d(0,0,0); } 100% { transform:translate3d(-50%,0,0); } }',
    /* Hover label badge */
    '.ve-hover-label { position:absolute; z-index:99995; background:rgba(121,50,236,0.92); color:#fff; font-size:10px; font-weight:700; font-family:Inter,sans-serif; padding:3px 8px; border-radius:4px; pointer-events:none !important; letter-spacing:0.4px; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,0.6); top:0; left:0; transform:translate(4px,4px); }',
  ].join(' ');
  document.head.appendChild(adminStyle);

  /* Signal parent */
  try { window.parent.postMessage({ type:'IFRAME_READY' }, '*'); notifyHistoryStatus(); } catch(e){}

  /* ── Block link navigation ── */
  window.addEventListener('click', function(e) {
    if (e.target.closest('[contenteditable="true"]')) return;
    if (e.target.closest('.ve-mute-btn')) return;
    var link = e.target.closest('a');
    if (link) {
      e.preventDefault(); e.stopPropagation();
      try { var url = new URL(link.href); if (url.host === window.location.host && url.pathname !== window.location.pathname) { url.searchParams.set('admin','true'); window.location.href = url.toString(); } } catch(err) {}
    }
  }, true);

  /* ── Global Mute ── */
  window.isGlobalMuted = true;
  function setGlobalMute(muted) {
    window.isGlobalMuted = typeof muted === 'boolean' ? muted : true;
    document.querySelectorAll('video, audio').forEach(function(media) {
      if (window.isGlobalMuted) { media.muted = true; }
      else { if (media.getAttribute('data-audio-allowed') !== 'false') media.muted = false; }
      if (media._updateMuteControl) media._updateMuteControl();
      if (media._updateMuteIcon) media._updateMuteIcon();
    });
  }

  /* ── Ticker animation helpers ── */
  function pauseTickerAnimations() { document.querySelectorAll('.framer-6lep06 ul,.framer-18eru5x ul,[class*="ticker"],[data-framer-name*="ticker"],.ticker-item').forEach(function(el) { el.style.setProperty('animation-play-state','paused','important'); }); }
  function resumeTickerAnimations() { document.querySelectorAll('.framer-6lep06 ul,.framer-18eru5x ul,[class*="ticker"],[data-framer-name*="ticker"],.ticker-item').forEach(function(el) { el.style.removeProperty('animation-play-state'); }); }
  function resumePausedVideo() { if (currentlyPausedVideo) { try { currentlyPausedVideo.play().catch(function(){}); } catch(e){} currentlyPausedVideo = null; } }

  /* ── Clear selection ── */
  function clearSelection() {
    resumeTickerAnimations();
    document.querySelectorAll('[data-ve-sel]').forEach(function(n) { n.removeAttribute('data-ve-sel'); n.style.outline = ''; n.style.outlineOffset = ''; n.style.boxShadow = ''; });
    document.querySelectorAll('.ve-hover-label').forEach(function(n) { n.remove(); });
  }

  /* ══════════════════════════════════════════════════
   *  ELEMENT TYPE CLASSIFICATION
   * ══════════════════════════════════════════════════ */

  var TEXT_TAGS = ['H1','H2','H3','H4','H5','H6','P','SPAN','A','LABEL','B','STRONG','EM','I','U','BUTTON','LI','TD','TH','CAPTION','BLOCKQUOTE','CITE','CODE','FIGCAPTION','TIME','MARK','SMALL','ABBR'];

  function hasDirectText(el) {
    if (!el) return false;
    for (var i = 0; i < el.childNodes.length; i++) {
      var cn = el.childNodes[i];
      if (cn.nodeType === 3 && cn.textContent.trim()) return true;
    }
    return false;
  }

  function isTextElement(el) {
    if (!el || !el.tagName) return false;
    var tag = el.tagName.toUpperCase();
    if (TEXT_TAGS.indexOf(tag) !== -1 && el.textContent.trim()) return true;
    if (el.classList && el.classList.contains('framer-text') && el.textContent.trim()) return true;
    if (el.getAttribute && el.getAttribute('data-framer-component-type') === 'RichTextContainer') return true;
    // Pure text div (no child media)
    if (tag === 'DIV' && el.textContent.trim() && !el.querySelector('img,video,svg') && el.children.length <= 3 && hasDirectText(el)) return true;
    return false;
  }

  function isVideoElement(el) {
    if (!el || !el.tagName) return false;
    if (el.tagName === 'VIDEO') return true;
    if (el.querySelector && el.querySelector('video')) return true;
    return false;
  }

  function isImageElement(el) {
    if (!el || !el.tagName) return false;
    var tag = el.tagName.toUpperCase();
    if (tag === 'IMG') return true;
    if (tag === 'SVG') return true;
    if (el.getAttribute && el.getAttribute('data-framer-component-type') === 'SVG') return true;
    if (el.classList && el.classList.contains('svgContainer')) return true;
    return false;
  }

  function classifyElement(el) {
    if (!el) return null;
    var isVid = isVideoElement(el);
    var isImg = !isVid && isImageElement(el);
    var isTxt = !isVid && !isImg && isTextElement(el);
    var tag = el.tagName ? el.tagName.toUpperCase() : 'DIV';
    return {
      isText:  isTxt,
      isVideo: isVid,
      isImage: isImg,
      isMedia: isVid || isImg,
      tag: isVid ? 'VIDEO' : (isImg ? 'IMG' : tag),
      audioAllowed: isVid ? (function(e) { var v = e.tagName === 'VIDEO' ? e : e.querySelector('video'); return v ? v.getAttribute('data-audio-allowed') !== 'false' : true; })(el) : true,
      hasText: !!(el.textContent && el.textContent.trim())
    };
  }

  /* ══════════════════════════════════════════════════
   *  FIND BEST EDITABLE TARGET
   * ══════════════════════════════════════════════════ */

  function findBestTextContainer(el) {
    if (!el) return el;
    if (el.nodeType === 3) el = el.parentElement;
    var block = el.closest('h1,h2,h3,h4,h5,h6,p,button,label,[data-framer-component-type="RichTextContainer"],li,blockquote,figcaption');
    if (block) return block;
    // Walk up to find element with direct text
    var curr = el;
    while (curr && curr !== document.body) {
      if (isTextElement(curr)) return curr;
      curr = curr.parentElement;
    }
    return el;
  }

  /**
   * Deep hit test — pierces ALL overlays & Framer wrapper divs.
   * Walks the full element stack at the click point and returns the
   * most meaningful editable element (text > video > image > container).
   */
  function deepHitTest(clickX, clickY, rawTarget) {
    var stack = document.elementsFromPoint ? document.elementsFromPoint(clickX, clickY) : [];

    // 1. Look for text first (highest priority)
    for (var i = 0; i < Math.min(stack.length, 10); i++) {
      var el = stack[i];
      if (isTextElement(el)) return findBestTextContainer(el);
    }
    // Also check rawTarget for text
    if (rawTarget && isTextElement(rawTarget)) return findBestTextContainer(rawTarget);
    if (rawTarget && rawTarget.nodeType === 3 && rawTarget.parentElement && isTextElement(rawTarget.parentElement)) {
      return findBestTextContainer(rawTarget.parentElement);
    }

    // 2. Look for VIDEO
    for (var j = 0; j < stack.length; j++) {
      if (stack[j].tagName === 'VIDEO') return stack[j];
    }
    // Bounding-box check all videos
    var allVids = document.querySelectorAll('video');
    for (var v = 0; v < allVids.length; v++) {
      var r = allVids[v].getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && clickX >= r.left && clickX <= r.right && clickY >= r.top && clickY <= r.bottom) return allVids[v];
    }

    // 3. Look for IMG
    for (var k = 0; k < stack.length; k++) {
      if (stack[k].tagName === 'IMG') return stack[k];
    }
    // Bounding-box check all images
    var allImgs = document.querySelectorAll('img');
    for (var m = 0; m < allImgs.length; m++) {
      var r2 = allImgs[m].getBoundingClientRect();
      if (r2.width > 0 && r2.height > 0 && clickX >= r2.left && clickX <= r2.right && clickY >= r2.top && clickY <= r2.bottom) return allImgs[m];
    }

    // 4. Look for SVG
    for (var s = 0; s < stack.length; s++) {
      if (stack[s].tagName === 'SVG') return stack[s];
      if (stack[s].tagName === 'USE' && stack[s].ownerSVGElement) return stack[s].ownerSVGElement;
    }

    // 5. Use rawTarget - find nearest meaningful ancestor
    var fallback = rawTarget;
    if (fallback && fallback.nodeType === 3) fallback = fallback.parentElement;
    if (fallback) {
      var meaningful = fallback.closest('[data-framer-name],[data-framer-component-type],article,.reel-card,.review-card,.p-card,section,header,footer,nav,button,a[href]');
      if (meaningful) return meaningful;
    }
    return fallback || stack[0] || null;
  }

  /* ══════════════════════════════════════════════════
   *  HOVER LABEL — shows element type on hover
   * ══════════════════════════════════════════════════ */
  var hoverLabel = null;
  var hoverTimeout = null;

  function showHoverLabel(el, x, y) {
    removeHoverLabel();
    if (!el) return;
    var cls = classifyElement(el);
    if (!cls) return;
    var label = cls.isVideo ? '🎬 Video — click to edit' : cls.isImage ? '🖼 Image — click to edit' : cls.isText ? '✏️ Text — click to edit' : '⬛ Element — click to edit';

    hoverLabel = document.createElement('div');
    hoverLabel.className = 've-hover-label';
    hoverLabel.textContent = label;
    hoverLabel.style.position = 'fixed';
    hoverLabel.style.left = (x + 12) + 'px';
    hoverLabel.style.top = (y - 28) + 'px';
    document.body.appendChild(hoverLabel);
  }

  function removeHoverLabel() {
    if (hoverLabel) { try { hoverLabel.remove(); } catch(e){} hoverLabel = null; }
  }

  /* ══════════════════════════════════════════════════
   *  MOUSE MOVE — show hover labels
   * ══════════════════════════════════════════════════ */
  document.addEventListener('mousemove', function(e) {
    if (activeEditingElement) return;
    clearTimeout(hoverTimeout);
    removeHoverLabel();
    hoverTimeout = setTimeout(function() {
      var el = e.target;
      if (!el || el === document.body || el === document.documentElement) return;
      if (el.closest('.ve-mute-btn') || el.closest('.ve-hover-label')) return;
      var best = deepHitTest(e.clientX, e.clientY, el);
      if (best && best !== document.body) {
        showHoverLabel(best, e.clientX, e.clientY);
      }
    }, 300);
  }, { passive: true });

  document.addEventListener('mouseleave', function() { clearTimeout(hoverTimeout); removeHoverLabel(); });

  /* ══════════════════════════════════════════════════
   *  DOUBLE-CLICK HANDLER — select & open context menu
   * ══════════════════════════════════════════════════ */
  window.addEventListener('dblclick', function(e) {
    e.preventDefault();
    e.stopPropagation();

    removeHoverLabel();
    var rawTarget = e.target;
    if (!rawTarget || rawTarget === document.body || rawTarget === document.documentElement) {
      clearSelection(); resumePausedVideo();
      window.parent.postMessage({ type:'ELEMENT_INFO', found:false }, '*');
      return;
    }

    // Skip editor UI
    if (rawTarget.closest('.ve-mute-btn') || rawTarget.closest('.ve-hover-label')) return;

    var target = deepHitTest(e.clientX, e.clientY, rawTarget);
    if (!target || target === document.body) {
      clearSelection(); resumePausedVideo();
      window.parent.postMessage({ type:'ELEMENT_INFO', found:false }, '*');
      return;
    }

    clearSelection();
    pauseTickerAnimations();

    // Handle video pause
    var vidEl = target.tagName === 'VIDEO' ? target : (target.querySelector ? target.querySelector('video') : null);
    if (vidEl) {
      if (currentlyPausedVideo && currentlyPausedVideo !== vidEl) resumePausedVideo();
      currentlyPausedVideo = vidEl;
      if (!vidEl.paused) { try { vidEl.pause(); } catch(ee){} }
    } else {
      resumePausedVideo();
    }

    // Select
    target.setAttribute('data-ve-sel', '1');
    currentTarget = target;
    window.lastSelectedElement = target;

    var cls = classifyElement(target);

    // Auto-start text editing on double-click if it's a text element
    if (cls.isText) {
      enableTextEditing(target);
    }

    var rect = target.getBoundingClientRect();
    if ((rect.width === 0 || rect.height === 0) && target.parentElement) {
      rect = target.parentElement.getBoundingClientRect();
    }

    var info = {
      type: 'ELEMENT_INFO',
      found: true,
      isMedia: cls.isMedia,
      isText: cls.isText,
      tag: cls.tag,
      isVideo: cls.isVideo,
      isImage: cls.isImage,
      audioAllowed: cls.audioAllowed,
      hasText: cls.hasText,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
    };
    console.log('[VE] ELEMENT_INFO →', info);
    window.parent.postMessage(info, '*');
  }, true);

  /* ══════════════════════════════════════════════════
   *  TEXT EDITING
   * ══════════════════════════════════════════════════ */
  function unlockForEditing(el) {
    var curr = el;
    while (curr && curr !== document.body) {
      curr.style.setProperty('pointer-events', 'auto', 'important');
      curr.style.setProperty('user-select', 'text', 'important');
      curr.style.setProperty('-webkit-user-select', 'text', 'important');
      curr = curr.parentElement;
    }
    if (el && el.querySelectorAll) {
      el.querySelectorAll('*').forEach(function(child) {
        child.style.setProperty('pointer-events', 'auto', 'important');
        child.style.setProperty('user-select', 'text', 'important');
        child.style.setProperty('-webkit-user-select', 'text', 'important');
      });
    }
  }

  function finishTextEditing() {
    if (!activeEditingElement) return;
    var el = activeEditingElement;
    activeEditingElement = null;
    el.contentEditable = 'false';
    el.removeAttribute('contenteditable');
    el.removeAttribute('data-ve-sel');
    el.style.outline = '';
    el.style.outlineOffset = '';
    el.style.boxShadow = '';
    resumePausedVideo();
    pushHistoryState();
    window.parent.postMessage({ type:'EDITING_DONE' }, '*');
  }

  function enableTextEditing(target) {
    if (!target) return;
    target = findBestTextContainer(target);
    currentTarget = target;
    window.lastSelectedElement = target;

    if (activeEditingElement && activeEditingElement !== target) finishTextEditing();

    pushHistoryState();
    activeEditingElement = target;
    unlockForEditing(target);

    target.contentEditable = 'true';
    target.setAttribute('data-ve-sel', '1');

    window.focus(); target.focus();
    try {
      var sel = window.getSelection();
      sel.removeAllRanges();
      var range = document.createRange();
      range.selectNodeContents(target);
      range.collapse(false);
      sel.addRange(range);
    } catch(e) {}

    setTimeout(function() {
      function onDocClick(e2) {
        if (activeEditingElement && !activeEditingElement.contains(e2.target)) {
          document.removeEventListener('click', onDocClick, true);
          document.removeEventListener('keydown', onKeyDown, true);
          finishTextEditing();
        }
      }
      function onKeyDown(e2) {
        if (e2.key === 'Escape') {
          document.removeEventListener('click', onDocClick, true);
          document.removeEventListener('keydown', onKeyDown, true);
          finishTextEditing();
        }
      }
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onKeyDown, true);
    }, 150);
  }

  /* ══════════════════════════════════════════════════
   *  MESSAGE HANDLER
   * ══════════════════════════════════════════════════ */
  window.addEventListener('message', function(event) {
    try {
      if (!event.data || typeof event.data !== 'object') return;
      var msg = event.data;
      if (msg.type === 'EDIT_ACTION')      handleEditAction(msg.action, msg.value);
      if (msg.type === 'MEDIA_SELECTED' && msg.url) applyMedia(msg.url);
      if (msg.type === 'REQUEST_SAVE')     doSave();
      if (msg.type === 'UNDO')             undoState();
      if (msg.type === 'REDO')             redoState();
      if (msg.type === 'RESTORE_ORIGINAL') restoreOriginalState();
      if (msg.type === 'TOGGLE_GLOBAL_MUTE') setGlobalMute(msg.muted);
      if (msg.type === 'DESELECT') { clearSelection(); resumePausedVideo(); currentTarget = null; }
    } catch(e) { console.error('[VE] Message handler error:', e); }
  });

  /* ══════════════════════════════════════════════════
   *  EDIT ACTIONS
   * ══════════════════════════════════════════════════ */
  function handleEditAction(action, value) {
    console.log('[VE] handleEditAction:', action, value);
    var target = currentTarget || window.lastSelectedElement;
    if (!target) { console.warn('[VE] No target!'); return; }

    switch (action) {
      case 'EDIT_TEXT':
        enableTextEditing(target);
        break;

      case 'TOGGLE_AUDIO': {
        var vidNode = target.tagName === 'VIDEO' ? target : (target.querySelector ? target.querySelector('video') : null);
        if (vidNode) {
          pushHistoryState();
          var wasAllowed = vidNode.getAttribute('data-audio-allowed') !== 'false';
          vidNode.setAttribute('data-audio-allowed', wasAllowed ? 'false' : 'true');
          if (wasAllowed) vidNode.muted = true;
          if (vidNode._updateMuteControl) vidNode._updateMuteControl();
          pushHistoryState();
          // Re-send updated info
          var r = target.getBoundingClientRect();
          window.parent.postMessage({ type:'ELEMENT_INFO', found:true, isMedia:true, isVideo:true, isImage:false, tag:'VIDEO', audioAllowed:!wasAllowed, rect:{top:r.top,left:r.left,width:r.width,height:r.height} }, '*');
        }
        break;
      }

      case 'CHANGE_COLOR':
        if (value) {
          pushHistoryState();
          target.style.setProperty('color', value, 'important');
          target.querySelectorAll('span,p,h1,h2,h3,h4,h5,h6,a,b,strong,em,i,label,li').forEach(function(n) { n.style.setProperty('color', value, 'important'); });
          pushHistoryState(); resumePausedVideo();
        }
        break;

      case 'CHANGE_FONT':
        if (value) {
          pushHistoryState();
          target.style.setProperty('font-family', value, 'important');
          target.querySelectorAll('span,p,h1,h2,h3,h4,h5,h6,a,b,strong,em,i,label,li').forEach(function(n) { n.style.setProperty('font-family', value, 'important'); });
          pushHistoryState(); resumePausedVideo();
        }
        break;

      case 'CHANGE_FONT_SIZE':
        if (value) {
          pushHistoryState();
          target.style.setProperty('font-size', value, 'important');
          pushHistoryState(); resumePausedVideo();
        }
        break;

      case 'CHANGE_BG_COLOR':
        if (value) {
          pushHistoryState();
          target.style.setProperty('background', value, 'important');
          target.style.setProperty('background-color', value, 'important');
          pushHistoryState(); resumePausedVideo();
        }
        break;

      case 'REPLACE_MEDIA':
        window.parent.postMessage({ type:'REQUEST_MEDIA' }, '*');
        break;

      case 'DUPLICATE': {
        pushHistoryState();
        var clone = target.cloneNode(true);
        clone.removeAttribute('data-ve-sel');
        clone.style.outline = '';
        if (target.parentElement) target.parentElement.insertBefore(clone, target.nextSibling);
        pushHistoryState();
        break;
      }

      case 'HIDE':
        pushHistoryState();
        target.style.setProperty('visibility', 'hidden', 'important');
        target.style.setProperty('opacity', '0', 'important');
        pushHistoryState();
        break;

      case 'SHOW':
        pushHistoryState();
        target.style.removeProperty('visibility');
        target.style.removeProperty('opacity');
        pushHistoryState();
        break;

      case 'DELETE':
        pushHistoryState();
        resumePausedVideo();
        target.remove();
        currentTarget = null; window.lastSelectedElement = null;
        pushHistoryState();
        break;
    }
  }

  /* ══════════════════════════════════════════════════
   *  APPLY MEDIA — with ticker duplicate sync
   * ══════════════════════════════════════════════════ */
  function applyMedia(url) {
    pushHistoryState();
    var t = currentTarget || window.lastSelectedElement;
    if (!t) { console.warn('[VE] No target for media replace!'); return; }
    var cleanUrl = url.trim();

    // Record original src for ticker sync
    var originalSrc = '';
    var directMedia = t.tagName === 'IMG' || t.tagName === 'VIDEO' ? t : (t.querySelector ? t.querySelector('img, video') : null);
    if (directMedia) originalSrc = directMedia.getAttribute('src') || '';

    // Resolve actual media element
    if (t.tagName !== 'IMG' && t.tagName !== 'VIDEO') {
      var cv = t.querySelector('video');
      var ci = t.querySelector('img');
      var cs = t.querySelector('svg,[data-framer-component-type="SVG"],.svgContainer');
      if (cv) t = cv; else if (ci) t = ci; else if (cs) t = cs;
    }

    var isVideo = /\.(mp4|webm|mov|m4v|ogv|mkv|avi|blob)/i.test(cleanUrl) || cleanUrl.includes('video') || (cleanUrl.includes('/media/') && !/\.(png|jpe?g|gif|webp|svg)/i.test(cleanUrl));

    var origClass = t.className || '';
    var origStyle = t.getAttribute('style') || '';
    var computedRadius = window.getComputedStyle(t).borderRadius;

    if (isVideo) {
      if (t.tagName === 'VIDEO') {
        t.removeAttribute('poster'); t.src = cleanUrl; t.muted = true; t.loop = true; t.autoplay = true;
        t.setAttribute('playsinline',''); t.setAttribute('webkit-playsinline','');
        t.style.setProperty('object-fit','cover','important'); t.style.setProperty('width','100%','important'); t.style.setProperty('height','100%','important'); t.style.setProperty('display','block','important');
        t.load(); t.play().catch(function(){});
      } else {
        var newVid = document.createElement('video');
        newVid.autoplay = true; newVid.loop = true; newVid.muted = true;
        newVid.setAttribute('playsinline',''); newVid.setAttribute('webkit-playsinline','');
        if (origClass) newVid.className = origClass;
        if (origStyle) newVid.setAttribute('style', origStyle);
        newVid.style.setProperty('object-fit','cover','important'); newVid.style.setProperty('width','100%','important'); newVid.style.setProperty('height','100%','important'); newVid.style.setProperty('display','block','important');
        if (computedRadius && computedRadius !== '0px') newVid.style.setProperty('border-radius', computedRadius, 'important');
        newVid.src = cleanUrl; t.replaceWith(newVid); t = newVid; t.load(); t.play().catch(function(){});
      }
      delete t.dataset.muteInjected;
      setTimeout(injectMuteControls, 100);
    } else {
      if (t.tagName === 'IMG') {
        t.removeAttribute('srcset'); t.src = cleanUrl;
        t.style.setProperty('object-fit','cover','important'); t.style.setProperty('width','100%','important'); t.style.setProperty('height','100%','important'); t.style.setProperty('display','block','important');
      } else {
        var newImg = document.createElement('img');
        newImg.loading = 'lazy';
        if (origClass) newImg.className = origClass;
        if (origStyle) newImg.setAttribute('style', origStyle);
        newImg.style.setProperty('object-fit','cover','important'); newImg.style.setProperty('width','100%','important'); newImg.style.setProperty('height','100%','important'); newImg.style.setProperty('display','block','important');
        if (computedRadius && computedRadius !== '0px') newImg.style.setProperty('border-radius', computedRadius, 'important');
        newImg.src = cleanUrl; t.replaceWith(newImg); t = newImg;
      }
    }

    // Ticker sync — update all duplicates with same original src
    if (originalSrc) {
      var syncSel = isVideo ? 'video' : 'img';
      document.querySelectorAll(syncSel).forEach(function(el) {
        if (el !== t && (el.getAttribute('src') === originalSrc || el.getAttribute('srcset') || '').includes(originalSrc.split('?')[0])) {
          el.removeAttribute('srcset');
          el.setAttribute('src', cleanUrl);
          if (el.tagName === 'VIDEO') { el.load(); el.play().catch(function(){}); }
        }
      });
    }

    currentlyPausedVideo = null;
    currentTarget = t; window.lastSelectedElement = t;
    if (t) { t.setAttribute('data-ve-sel','1'); }
    pushHistoryState();
  }

  /* ══════════════════════════════════════════════════
   *  SAVE
   * ══════════════════════════════════════════════════ */
  function doSave() {
    try {
      resumePausedVideo();
      var mainEl = document.getElementById('main') || document.body;
      var clone = mainEl.cloneNode(true);
      var badge = clone.querySelector('#__framer-badge-container');
      if (badge) badge.remove();
      clone.querySelectorAll('[data-ve-sel]').forEach(function(n) { n.removeAttribute('data-ve-sel'); n.style.outline = ''; n.style.outlineOffset = ''; n.style.boxShadow = ''; });
      clone.querySelectorAll('[contenteditable]').forEach(function(n) { n.removeAttribute('contenteditable'); n.style.outline = ''; n.style.outlineOffset = ''; n.style.boxShadow = ''; });
      var styleEl = clone.querySelector('#ve-styles-editor');
      if (styleEl) styleEl.remove();
      clone.querySelectorAll('.ve-mute-btn,.ve-edit-badge,.ve-hover-label').forEach(function(n) { n.remove(); });

      var pageName = window.location.pathname.split('/').pop() || 'index.html';
      var savedContent = mainEl.id === 'main' ? clone.outerHTML : clone.innerHTML;
      window.parent.postMessage({ type:'SAVE_CONTENT', content:savedContent, page:pageName }, '*');
    } catch(e) { console.error('[VE] Save error:', e); }
  }

  console.log('[VE] visual-editor v35 ready — ALL elements editable (text, images, videos, containers)');
})();

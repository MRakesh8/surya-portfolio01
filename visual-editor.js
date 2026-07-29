(function() {
  var isAdmin = false;
  try {
    var editorParams = new URLSearchParams(window.location.search);
    if (editorParams.get('admin') === 'true') {
      isAdmin = true;
    } else if (window.self !== window.top) {
      if (window.parent && window.parent.location.pathname.indexOf('/admin') !== -1) {
        isAdmin = true;
      }
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

      // Enforce muted by default so sound NEVER autoplays without explicit user interaction
      vid.muted = true;

      var wrapper = vid.parentElement;
      if (!wrapper) return;

      var wrapperPos = window.getComputedStyle(wrapper).position;
      if (wrapperPos === 'static') wrapper.style.position = 'relative';

      var btn = document.createElement('button');
      btn.className = 've-mute-btn';
      btn.style.cssText = [
        'position:absolute', 'top:12px', 'right:12px', 'z-index:9999',
        'width:38px', 'height:38px', 'border-radius:50%',
        'background:rgba(0,0,0,0.7)', 'border:1.5px solid rgba(255,255,255,0.4)',
        'color:#fff', 'font-size:16px', 'cursor:pointer',
        'display:flex', 'align-items:center', 'justify-content:center',
        'backdrop-filter:blur(8px)', '-webkit-backdrop-filter:blur(8px)',
        'transition:background 0.18s, transform 0.15s',
        'pointer-events:all', 'outline:none',
        'box-shadow:0 4px 16px rgba(0,0,0,0.5)',
      ].join(';');

      function muteIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
      }
      function soundIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
      }

      function updateIcon() {
        btn.innerHTML = vid.muted ? muteIcon() : soundIcon();
        btn.setAttribute('aria-label', vid.muted ? 'Unmute video' : 'Mute video');
        btn.title = vid.muted ? 'Click to Unmute Sound' : 'Click to Mute Sound';
      }

      function updateVisibility() {
        var audioAllowed = vid.getAttribute('data-audio-allowed') !== 'false';
        if (!audioAllowed) {
          vid.muted = true;
          if (!isAdmin) {
            btn.style.display = 'none';
          } else {
            btn.style.display = 'flex';
            btn.style.opacity = '0.5';
            btn.title = 'Sound disabled by admin for users';
            btn.innerHTML = muteIcon();
          }
        } else {
          btn.style.display = 'flex';
          btn.style.opacity = '1';
          updateIcon();
        }
      }

      vid._updateMuteControl = updateVisibility;
      vid._updateMuteIcon = updateIcon;

      updateVisibility();

      btn.addEventListener('mouseenter', function() {
        btn.style.background = 'rgba(121,50,236,0.9)';
        btn.style.transform = 'scale(1.1)';
      });
      btn.addEventListener('mouseleave', function() {
        btn.style.background = 'rgba(0,0,0,0.7)';
        btn.style.transform = 'scale(1)';
      });

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();

        var audioAllowed = vid.getAttribute('data-audio-allowed') !== 'false';
        if (!audioAllowed && !isAdmin) {
          vid.muted = true;
          return;
        }

        if (vid.muted) {
          // Mute all other playing videos on page so audio tracks don't overlap
          document.querySelectorAll('video').forEach(function(otherVid) {
            if (otherVid !== vid) {
              otherVid.muted = true;
              if (otherVid._updateMuteIcon) otherVid._updateMuteIcon();
            }
          });
          vid.muted = false;
          vid.play().catch(function(){});
        } else {
          vid.muted = true;
        }
        updateIcon();
      });

      function checkAudio() {
        if (vid.mozHasAudio === false || (vid.audioTracks && vid.audioTracks.length === 0)) {
          btn.style.display = 'none';
        }
      }
      vid.addEventListener('loadedmetadata', checkAudio);
      if (vid.readyState >= 1) checkAudio();

      wrapper.appendChild(btn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectMuteControls);
  } else {
    injectMuteControls();
  }
  setTimeout(injectMuteControls, 800);
  setTimeout(injectMuteControls, 2500);

  /* ══════════════════════════════════════════════════
   *  ADMIN EDITOR — only when isAdmin = true
   * ══════════════════════════════════════════════════ */
  if (!isAdmin) return;

  console.log('[VE] visual-editor v33 starting with Past & Present History Stack…');

  var currentTarget = null;
  window.lastSelectedElement = null;
  var currentlyPausedVideo = null;

  /* ══════════════════════════════════════════════════
   *  HISTORY STACK (Undo / Redo / Restore)
   * ══════════════════════════════════════════════════ */
  var historyStack = [];
  var historyIndex = -1;
  var MAX_HISTORY = 50;

  function getCleanSnapshot() {
    var mainEl = document.getElementById('main') || document.body;
    var clone = mainEl.cloneNode(true);
    var badge = clone.querySelector('#__framer-badge-container');
    if (badge) badge.remove();
    clone.querySelectorAll('[data-ve-sel]').forEach(function(n) {
      n.removeAttribute('data-ve-sel'); n.style.outline = '';
    });
    var styleEditor = clone.querySelector('#ve-styles-editor');
    if (styleEditor) styleEditor.remove();
    clone.querySelectorAll('.ve-mute-btn').forEach(function(n){ n.remove(); });
    return clone.innerHTML;
  }

  function notifyHistoryStatus() {
    try {
      window.parent.postMessage({
        type: 'HISTORY_UPDATE',
        canUndo: historyIndex > 0,
        canRedo: historyIndex < historyStack.length - 1,
        totalStates: historyStack.length,
        currentIndex: historyIndex
      }, '*');
    } catch(e) {}
  }

  function pushHistoryState() {
    var snapshot = getCleanSnapshot();
    if (historyIndex >= 0 && historyStack[historyIndex] === snapshot) {
      return; // Skip duplicate states
    }
    // Truncate redo history
    if (historyIndex < historyStack.length - 1) {
      historyStack.splice(historyIndex + 1);
    }
    historyStack.push(snapshot);
    if (historyStack.length > MAX_HISTORY) {
      historyStack.shift();
    }
    historyIndex = historyStack.length - 1;
    console.log('[VE] History push: state count =', historyStack.length, 'at index =', historyIndex);
    notifyHistoryStatus();
  }

  function applySnapshot(snapshot) {
    clearSelection();
    resumePausedVideo();
    currentTarget = null;
    window.lastSelectedElement = null;

    var mainEl = document.getElementById('main') || document.body;
    mainEl.innerHTML = snapshot;

    // Re-inject mute buttons and video controls
    setTimeout(function() {
      injectMuteControls();
    }, 100);

    notifyHistoryStatus();
  }

  function undoState() {
    if (historyIndex > 0) {
      historyIndex--;
      console.log('[VE] Undo → state index', historyIndex);
      applySnapshot(historyStack[historyIndex]);
    }
  }

  function redoState() {
    if (historyIndex < historyStack.length - 1) {
      historyIndex++;
      console.log('[VE] Redo → state index', historyIndex);
      applySnapshot(historyStack[historyIndex]);
    }
  }

  function restoreOriginalState() {
    if (historyStack.length > 0) {
      historyIndex = 0;
      console.log('[VE] Restore Original → state index 0');
      applySnapshot(historyStack[0]);
    }
  }

  // Initialize initial state snapshot
  setTimeout(function() {
    pushHistoryState();
  }, 1000);

  /* Keyboard shortcut listener (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z) */
  window.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (e.shiftKey) {
        e.preventDefault(); redoState();
      } else {
        e.preventDefault(); undoState();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault(); redoState();
    }
  });

  /* Resume video playback */
  function resumePausedVideo() {
    if (currentlyPausedVideo) {
      try {
        currentlyPausedVideo.play().catch(function(){});
      } catch(e) {}
      currentlyPausedVideo = null;
    }
  }

  function pauseTickerAnimations() {
    document.querySelectorAll('[class*="ticker"], [data-framer-name*="ticker"], .ticker-item').forEach(function(el) {
      el.style.setProperty('animation-play-state', 'paused', 'important');
    });
  }

  function resumeTickerAnimations() {
    document.querySelectorAll('[class*="ticker"], [data-framer-name*="ticker"], .ticker-item').forEach(function(el) {
      el.style.removeProperty('animation-play-state');
    });
  }

  /* Clear selection highlights */
  function clearSelection() {
    resumeTickerAnimations();
    var prevSel = document.querySelectorAll('[data-ve-sel]');
    for (var j = 0; j < prevSel.length; j++) {
      prevSel[j].removeAttribute('data-ve-sel');
      prevSel[j].style.outline = '';
      prevSel[j].style.outlineOffset = '';
      prevSel[j].style.boxShadow = '';
    }
  }

  /* Inject admin cursor style, blue selection component ring & matching themed dark scrollbar */
  var adminStyle = document.createElement('style');
  adminStyle.id = 've-styles-editor';
  adminStyle.innerHTML = [
    'body { cursor: crosshair !important; }',
    '::-webkit-scrollbar { width: 10px !important; height: 10px !important; }',
    '::-webkit-scrollbar-track { background: #06060a !important; border-left: 1px solid rgba(255, 255, 255, 0.08) !important; }',
    '::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #7932ec, #4c1d95) !important; border-radius: 99px !important; border: 2px solid #06060a !important; box-shadow: 0 0 10px rgba(121, 50, 236, 0.4) !important; }',
    '::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #a855f7, #7932ec) !important; box-shadow: 0 0 16px rgba(168, 85, 247, 0.7) !important; }',
    '::-webkit-scrollbar-thumb:active { background: #c084fc !important; box-shadow: 0 0 20px rgba(192, 132, 252, 0.8) !important; }',
    '::-webkit-scrollbar-corner { background: #06060a !important; }',
    '::-webkit-scrollbar-button { display: none !important; width: 0 !important; height: 0 !important; }',
    '* { scrollbar-width: thin !important; scrollbar-color: #7932ec #06060a !important; }',
    '[data-ve-sel="1"] { outline: 2.5px solid #2563eb !important; outline-offset: 3px !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.25), 0 0 12px rgba(37, 99, 235, 0.3) !important; border-radius: 4px !important; transition: outline 0.15s ease, box-shadow 0.15s ease !important; }',
    '[contenteditable="true"] { outline: 2.5px dashed #2563eb !important; outline-offset: 3px !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.25) !important; cursor: text !important; user-select: text !important; -webkit-user-select: text !important; pointer-events: auto !important; border-radius: 4px !important; }',
    '[contenteditable="true"] * { user-select: text !important; -webkit-user-select: text !important; pointer-events: auto !important; }'
  ].join(' ');
  document.head.appendChild(adminStyle);

  /* Signal parent iframe is ready */
  try {
    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
    notifyHistoryStatus();
    console.log('[VE] Sent IFRAME_READY');
  } catch(e) {
    console.error('[VE] Failed to send IFRAME_READY', e);
  }

  /* ── Capture double-click ── */
  window.addEventListener('dblclick', function(e) {
    e.preventDefault();
    e.stopPropagation();
    handleDoubleClick(e.target, e.clientX, e.clientY);
  }, true);

  /* ── Block link navigation in admin ── */
  window.addEventListener('click', function(e) {
    if (e.target.closest('[contenteditable="true"]')) return;
    if (e.target.closest('.ve-mute-btn')) return;
    var link = e.target.closest('a');
    if (link) {
      e.preventDefault(); e.stopPropagation();
      try {
        var url = new URL(link.href);
        if (url.host === window.location.host && url.pathname !== window.location.pathname) {
          url.searchParams.set('admin', 'true');
          window.location.href = url.toString();
        }
      } catch(err) {}
    }
  }, true);

  /* ── Message handler ── */
  window.addEventListener('message', function(event) {
    try {
      if (!event.data || typeof event.data !== 'object') return;
      var msg = event.data;
      if (msg.type === 'EDIT_ACTION')   handleEditAction(msg.action, msg.value);
      if (msg.type === 'MEDIA_SELECTED' && msg.url) applyMedia(msg.url);
      if (msg.type === 'REQUEST_SAVE')  doSave();
      if (msg.type === 'UNDO')             undoState();
      if (msg.type === 'REDO')             redoState();
      if (msg.type === 'RESTORE_ORIGINAL') restoreOriginalState();
      if (msg.type === 'DESELECT') {
        clearSelection();
        resumePausedVideo();
        currentTarget = null;
      }
    } catch(e) {
      console.error('[VE] Message handler error:', e);
    }
  });

  /** Check if node is a text tag */
  function isTextNodeOrTag(node) {
    if (!node) return false;
    if (node.nodeType === 3 && node.textContent.trim()) return true;
    var tags = ['H1','H2','H3','H4','H5','H6','P','SPAN','A','LABEL','B','STRONG','EM','I','BUTTON'];
    if (tags.indexOf(node.tagName) !== -1 && node.textContent.trim()) return true;
    if (node.classList && node.classList.contains('framer-text') && node.textContent.trim()) return true;
    if (node.getAttribute && node.getAttribute('data-framer-component-type') === 'RichTextContainer') return true;
    return false;
  }

  function findBestTextContainer(el) {
    if (!el) return el;
    if (el.nodeType === 3) el = el.parentElement;
    var block = el.closest('h1, h2, h3, h4, h5, h6, p, a, button, label, [data-framer-component-type="RichTextContainer"]');
    if (block) return block;
    return el;
  }

  function unlockPointerAndSelection(el) {
    var curr = el;
    while (curr && curr !== document.body && curr !== document.documentElement) {
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

  var activeEditingElement = null;

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
    el.style.removeProperty('pointer-events');
    el.style.removeProperty('user-select');
    el.style.removeProperty('-webkit-user-select');

    resumePausedVideo();
    pushHistoryState();
    window.parent.postMessage({ type: 'EDITING_DONE' }, '*');
    console.log('[VE] Text editing finished & snapshot saved');
  }

  function enableTextEditing(target) {
    if (!target) return;
    target = findBestTextContainer(target);
    currentTarget = target;
    window.lastSelectedElement = target;

    if (activeEditingElement && activeEditingElement !== target) {
      finishTextEditing();
    }

    pushHistoryState(); // Save state before editing starts
    activeEditingElement = target;

    unlockPointerAndSelection(target);

    target.contentEditable = 'true';
    target.setAttribute('data-ve-sel', '1');
    target.style.outline = '2.5px dashed #2563eb';
    target.style.outlineOffset = '3px';

    window.focus();
    target.focus();

    // Clear native highlight selection rectangles
    try {
      var sel = window.getSelection();
      sel.removeAllRanges();
      var range = document.createRange();
      range.selectNodeContents(target);
      range.collapse(false);
      sel.addRange(range);
    } catch(e) {}

    // Listen for click outside or Escape to finish editing
    setTimeout(function() {
      function onDocClick(e) {
        if (activeEditingElement && !activeEditingElement.contains(e.target)) {
          document.removeEventListener('click', onDocClick, true);
          document.removeEventListener('keydown', onKeyDown, true);
          finishTextEditing();
        }
      }
      function onKeyDown(e) {
        if (e.key === 'Escape') {
          document.removeEventListener('click', onDocClick, true);
          document.removeEventListener('keydown', onKeyDown, true);
          finishTextEditing();
        }
      }
      document.addEventListener('click', onDocClick, true);
      document.addEventListener('keydown', onKeyDown, true);
    }, 150);
  }

  function findVideoInTree(el, maxDepth) {
    var node = el;
    for (var d = 0; d < maxDepth && node && node !== document.body; d++) {
      if (node.tagName === 'VIDEO') return node;
      var vid = node.querySelector ? node.querySelector('video') : null;
      if (vid) return vid;
      node = node.parentElement;
    }
    return null;
  }

  function findImgInTree(el, maxDepth) {
    var node = el;
    for (var d = 0; d < maxDepth && node && node !== document.body; d++) {
      if (node.tagName === 'IMG') return node;
      var img = node.querySelector ? node.querySelector('img') : null;
      if (img) return img;
      node = node.parentElement;
    }
    return null;
  }

  /**
   * Precise Bounding-Box Hit-Detection for Videos & Images in Carousels & Sliders.
   * Returns the exact <video> or <img> under (clickX, clickY) by checking physical screen coordinates.
   */
  function findMediaOrSvgNode(node) {
    if (!node) return null;
    var tag = node.tagName ? node.tagName.toUpperCase() : '';
    if (tag === 'VIDEO' || tag === 'IMG' || tag === 'SVG') return node;
    if (tag === 'USE' && node.ownerSVGElement) return node.ownerSVGElement;
    if (node.getAttribute && node.getAttribute('data-framer-component-type') === 'SVG') return node;
    if (node.classList && (node.classList.contains('svgContainer') || node.classList.contains('ticker-item'))) return node;
    var child = node.querySelector ? node.querySelector('video, img, svg, [data-framer-component-type="SVG"], .svgContainer') : null;
    if (child) return child;
    return null;
  }

  /**
   * Precise Bounding-Box Hit-Detection for Videos, Images & SVG Logos in Carousels, Sliders & Tickers.
   * Returns the exact media or SVG element under (clickX, clickY) by checking physical screen coordinates.
   */
  function getElementAtPoint(clickX, clickY) {
    if (clickX === undefined || clickY === undefined || !document.elementsFromPoint) return null;

    var stack = document.elementsFromPoint(clickX, clickY);
    if (!stack || stack.length === 0) return null;

    // Prioritize direct text clicks
    if (isTextNodeOrTag(stack[0])) {
      return findBestTextContainer(stack[0]);
    }

    // 1. Check direct point-stack hit for media/svg
    for (var i = 0; i < stack.length; i++) {
      var mediaNode = findMediaOrSvgNode(stack[i]);
      if (mediaNode) return mediaNode;
    }

    // 2. Check all <video> tags on the page
    var allVideos = document.querySelectorAll('video');
    for (var v = 0; v < allVideos.length; v++) {
      var vid = allVideos[v];
      var r = vid.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && clickX >= r.left && clickX <= r.right && clickY >= r.top && clickY <= r.bottom) {
        return vid;
      }
    }

    // 3. Check all <img> tags on the page
    var allImgs = document.querySelectorAll('img');
    for (var m = 0; m < allImgs.length; m++) {
      var img = allImgs[m];
      var r2 = img.getBoundingClientRect();
      if (r2.width > 0 && r2.height > 0 && clickX >= r2.left && clickX <= r2.right && clickY >= r2.top && clickY <= r2.bottom) {
        return img;
      }
    }

    // 4. Check all SVG & logo elements on the page
    var allSvgs = document.querySelectorAll('svg, [data-framer-component-type="SVG"], .svgContainer');
    for (var s = 0; s < allSvgs.length; s++) {
      var svg = allSvgs[s];
      var r3 = svg.getBoundingClientRect();
      if (r3.width > 0 && r3.height > 0 && clickX >= r3.left && clickX <= r3.right && clickY >= r3.top && clickY <= r3.bottom) {
        return svg;
      }
    }

    return null;
  }

  /* ── UNIVERSAL COMPONENT DOUBLE CLICK HANDLER ── */
  function handleDoubleClick(el, clickX, clickY) {
    if (!el || el === document.body || el === document.documentElement) {
      resumePausedVideo();
      clearSelection();
      window.parent.postMessage({ type: 'ELEMENT_INFO', found: false }, '*');
      return;
    }

    var target = null;
    if (isTextNodeOrTag(el)) {
      target = findBestTextContainer(el);
    } else {
      target = getElementAtPoint(clickX, clickY);
    }

    // 2. Hierarchical fallback if coordinate check didn't resolve target
    if (!target) {
      var tagUpper = el.tagName ? el.tagName.toUpperCase() : '';
      if (tagUpper === 'VIDEO' || tagUpper === 'IMG' || tagUpper === 'SVG' || tagUpper === 'USE') {
        target = (tagUpper === 'USE' && el.ownerSVGElement) ? el.ownerSVGElement : el;
      } else {
        var treeVideo = findVideoInTree(el, 15);
        if (treeVideo) {
          target = treeVideo;
        } else {
          var treeImg = findImgInTree(el, 10);
          if (treeImg) {
            target = isTextNodeOrTag(el) ? findBestTextContainer(el) : treeImg;
          } else {
            if (isTextNodeOrTag(el)) {
              target = findBestTextContainer(el);
            } else {
              target = el.closest('article, [data-framer-name], .reel-card, .review-card, .ticker-item, section, header, footer, nav, button, a') || el;
            }
          }
        }
      }
    }

    if (!target) {
      resumePausedVideo();
      clearSelection();
      window.parent.postMessage({ type: 'ELEMENT_INFO', found: false }, '*');
      return;
    }

    clearSelection();
    pauseTickerAnimations(); // Pause scrolling ticker animation so logo stays in place while editing!

    if (target.tagName === 'VIDEO') {
      if (currentlyPausedVideo && currentlyPausedVideo !== target) {
        resumePausedVideo();
      }
      currentlyPausedVideo = target;
      if (!target.paused) {
        try { target.pause(); } catch(e){}
      }
    } else {
      resumePausedVideo();
    }

    target.setAttribute('data-ve-sel', '1');
    target.style.outline = '2.5px solid #2563eb';
    target.style.outlineOffset = '3px';
    currentTarget = target;
    window.lastSelectedElement = target;

    var targetTag  = target.tagName ? target.tagName.toUpperCase() : '';
    var isText     = isTextNodeOrTag(target);
    var isVideoTag = !isText && ((targetTag === 'VIDEO') || (target.querySelector && target.querySelector('video') !== null));
    var isSvgTag   = !isText && ((targetTag === 'SVG') || (targetTag === 'USE') || (target.getAttribute && target.getAttribute('data-framer-component-type') === 'SVG') || (target.classList && target.classList.contains('svgContainer')));
    var isImgTag   = !isText && ((targetTag === 'IMG') || isSvgTag);
    var isMedia    = !isText && (isVideoTag || isImgTag);

    if (!isMedia) {
      enableTextEditing(target);
    }

    var rect = target.getBoundingClientRect();
    if ((rect.width === 0 || rect.height === 0) && target.parentElement) {
      rect = target.parentElement.getBoundingClientRect();
    }

    var actualVideo = isVideoTag ? (target.tagName === 'VIDEO' ? target : (target.querySelector ? target.querySelector('video') : null)) : null;
    var audioAllowed = actualVideo ? (actualVideo.getAttribute('data-audio-allowed') !== 'false') : true;

    var info = {
      type: 'ELEMENT_INFO',
      found: true,
      isMedia: isMedia,
      tag: isVideoTag ? 'VIDEO' : (isImgTag ? 'IMG' : (target.tagName ? target.tagName.toUpperCase() : 'TEXT')),
      isVideo: isVideoTag,
      audioAllowed: audioAllowed,
      hasText: !!(target.textContent && target.textContent.trim()),
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
    };
    console.log('[VE] ELEMENT_INFO →', info);
    window.parent.postMessage(info, '*');
  }

  /* ── EDIT ACTIONS (With History Snapshots) ── */
  function handleEditAction(action, value) {
    console.log('[VE] handleEditAction:', action, value);
    var target = currentTarget || window.lastSelectedElement;
    if (!target) { console.log('[VE] No target element!'); return; }

    if (action === 'EDIT_TEXT') {
      enableTextEditing(target);
    }
    else if (action === 'TOGGLE_AUDIO') {
      var vidNode = target.tagName === 'VIDEO' ? target : (target.querySelector ? target.querySelector('video') : null);
      if (vidNode) {
        pushHistoryState();
        var isCurrentlyAllowed = vidNode.getAttribute('data-audio-allowed') !== 'false';
        var newAudioAllowed = !isCurrentlyAllowed;
        vidNode.setAttribute('data-audio-allowed', newAudioAllowed ? 'true' : 'false');

        if (!newAudioAllowed) {
          vidNode.muted = true;
        }

        if (vidNode._updateMuteControl) {
          vidNode._updateMuteControl();
        }

        pushHistoryState();

        var isVideoTag = (target.tagName === 'VIDEO') || (target.querySelector && target.querySelector('video') !== null);
        var isImgTag   = (target.tagName === 'IMG')   || (target.querySelector && target.querySelector('img') !== null);
        var rect = target.getBoundingClientRect();
        window.parent.postMessage({
          type: 'ELEMENT_INFO',
          found: true,
          isMedia: isVideoTag || isImgTag,
          tag: target.tagName,
          isVideo: isVideoTag,
          audioAllowed: newAudioAllowed,
          rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        }, '*');
      }
    }
    else if (action === 'CHANGE_COLOR' && value) {
      pushHistoryState();
      target.style.setProperty('color', value, 'important');
      target.querySelectorAll('span,p,h1,h2,h3,h4,h5,h6')
        .forEach(function(n){ n.style.setProperty('color', value, 'important'); });
      pushHistoryState();
      resumePausedVideo();
    }
    else if (action === 'CHANGE_FONT' && value) {
      pushHistoryState();
      target.style.setProperty('font-family', value, 'important');
      target.querySelectorAll('span,p,h1,h2,h3,h4,h5,h6')
        .forEach(function(n){ n.style.setProperty('font-family', value, 'important'); });
      pushHistoryState();
      resumePausedVideo();
    }
    else if (action === 'DELETE') {
      pushHistoryState();
      resumePausedVideo();
      target.remove();
      currentTarget = null;
      window.lastSelectedElement = null;
      pushHistoryState();
    }
    else if (action === 'REPLACE_MEDIA') {
      window.parent.postMessage({ type: 'REQUEST_MEDIA' }, '*');
    }
  }

  /* ── APPLY MEDIA (With History Snapshots) ── */
  function applyMedia(url) {
    pushHistoryState(); // Save state before media replacement

    var t = currentTarget || window.lastSelectedElement;
    if (!t) {
      console.warn('[VE] No target element available to replace media!');
      return;
    }
    var cleanUrl = url.trim();

    if (t.tagName !== 'IMG' && t.tagName !== 'VIDEO') {
      var childVid = t.querySelector('video');
      var childImg = t.querySelector('img');
      var childSvg = t.querySelector('svg, [data-framer-component-type="SVG"], .svgContainer');
      if (childVid) t = childVid;
      else if (childImg) t = childImg;
      else if (childSvg) t = childSvg;
    }

    var isVideo = /\.(mp4|webm|mov|m4v|ogv|mkv|avi|blob)/i.test(cleanUrl) || 
                  cleanUrl.includes('video') || 
                  (cleanUrl.includes('/media/') && !/\.(png|jpe?g|gif|webp|svg)/i.test(cleanUrl));

    var origClass = t.className || '';
    var origStyle = t.getAttribute('style') || '';

    var computedStyle = window.getComputedStyle(t);
    var computedRadius = computedStyle.borderRadius;

    if (isVideo) {
      if (t.tagName === 'VIDEO') {
        t.removeAttribute('poster');
        t.src = cleanUrl;
        t.muted = true;
        t.loop = true;
        t.autoplay = true;
        t.setAttribute('playsinline', '');
        t.setAttribute('webkit-playsinline', '');
        t.style.setProperty('object-fit', 'cover', 'important');
        t.style.setProperty('width', '100%', 'important');
        t.style.setProperty('height', '100%', 'important');
        t.style.setProperty('display', 'block', 'important');
        t.load();
        t.play().catch(function(){});
      } else {
        var v = document.createElement('video');
        v.autoplay = true;
        v.loop = true;
        v.muted = true;
        v.setAttribute('playsinline', '');
        v.setAttribute('webkit-playsinline', '');
        if (origClass) v.className = origClass;
        if (origStyle) v.setAttribute('style', origStyle);

        v.style.setProperty('object-fit', 'cover', 'important');
        v.style.setProperty('width', '100%', 'important');
        v.style.setProperty('height', '100%', 'important');
        v.style.setProperty('display', 'block', 'important');
        if (computedRadius && computedRadius !== '0px') {
          v.style.setProperty('border-radius', computedRadius, 'important');
        }

        v.src = cleanUrl;
        t.replaceWith(v);
        t = v;
        v.load();
        v.play().catch(function(){});
      }
      delete t.dataset.muteInjected;
      setTimeout(injectMuteControls, 100);
    } else {
      if (t.tagName === 'IMG') {
        t.removeAttribute('srcset');
        t.src = cleanUrl;
        t.style.setProperty('object-fit', 'contain', 'important');
        t.style.setProperty('max-width', '100%', 'important');
        t.style.setProperty('max-height', '100%', 'important');
        t.style.setProperty('display', 'block', 'important');
      } else {
        var img = document.createElement('img');
        img.loading = 'lazy';
        if (origClass) img.className = origClass;
        if (origStyle) img.setAttribute('style', origStyle);

        img.style.setProperty('object-fit', 'contain', 'important');
        img.style.setProperty('max-width', '100%', 'important');
        img.style.setProperty('max-height', '100%', 'important');
        img.style.setProperty('display', 'block', 'important');
        if (computedRadius && computedRadius !== '0px') {
          img.style.setProperty('border-radius', computedRadius, 'important');
        }

        img.src = cleanUrl;
        t.replaceWith(img);
        t = img;
      }
    }

    currentlyPausedVideo = null;
    currentTarget = t;
    window.lastSelectedElement = t;

    if (currentTarget) {
      currentTarget.setAttribute('data-ve-sel', '1');
      currentTarget.style.outline = '2.5px solid #2563eb';
      currentTarget.style.outlineOffset = '3px';
    }

    pushHistoryState(); // Save state after media replacement
  }

  /* ── SAVE ── */
  function doSave() {
    try {
      resumePausedVideo();
      var mainEl = document.getElementById('main') || document.body;
      var clone = mainEl.cloneNode(true);
      var badge = clone.querySelector('#__framer-badge-container');
      if (badge) badge.remove();
      clone.querySelectorAll('[data-ve-sel]').forEach(function(n) {
        n.removeAttribute('data-ve-sel');
        n.style.outline = '';
        n.style.outlineOffset = '';
        n.style.boxShadow = '';
      });
      clone.querySelectorAll('[contenteditable]').forEach(function(n) {
        n.removeAttribute('contenteditable');
        n.style.outline = '';
        n.style.outlineOffset = '';
        n.style.boxShadow = '';
      });
      var styleEditor = clone.querySelector('#ve-styles-editor');
      if (styleEditor) styleEditor.remove();
      clone.querySelectorAll('.ve-mute-btn').forEach(function(n){ n.remove(); });

      var pageName = window.location.pathname.split('/').pop() || 'index.html';
      var savedContent = mainEl.id === 'main' ? clone.outerHTML : clone.innerHTML;

      window.parent.postMessage({
        type: 'SAVE_CONTENT',
        content: savedContent,
        page: pageName
      }, '*');
    } catch(e) {
      console.error('[VE] Save error:', e);
    }
  }

  console.log('[VE] visual-editor v33 initialized with Undo / Redo Past & Present History!');
})();

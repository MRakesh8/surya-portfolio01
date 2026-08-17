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
      if (vid.dataset.muteInjected) return;
      vid.dataset.muteInjected = 'true';

      vid.style.setProperty('object-fit', 'cover', 'important');
      vid.style.setProperty('width', '100%', 'important');
      vid.style.setProperty('height', '100%', 'important');
      vid.style.setProperty('display', 'block', 'important');

      var wrapper = vid.parentElement;
      if (!wrapper) return;

      var wrapperPos = window.getComputedStyle(wrapper).position;
      if (wrapperPos === 'static') wrapper.style.position = 'relative';

      var btn = document.createElement('button');
      btn.className = 've-mute-btn';
      btn.style.cssText = [
        'position:absolute', 'bottom:10px', 'right:10px', 'z-index:9999',
        'width:36px', 'height:36px', 'border-radius:50%',
        'background:rgba(0,0,0,0.65)', 'border:1.5px solid rgba(255,255,255,0.35)',
        'color:#fff', 'font-size:16px', 'cursor:pointer',
        'display:flex', 'align-items:center', 'justify-content:center',
        'backdrop-filter:blur(6px)', '-webkit-backdrop-filter:blur(6px)',
        'transition:background 0.18s,transform 0.15s',
        'pointer-events:all', 'outline:none',
        'box-shadow:0 2px 12px rgba(0,0,0,0.4)',
      ].join(';');

      function muteIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
      }
      function soundIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
      }

      function updateIcon() {
        btn.innerHTML = vid.muted ? muteIcon() : soundIcon();
        btn.setAttribute('aria-label', vid.muted ? 'Unmute video' : 'Mute video');
      }
      updateIcon();

      btn.addEventListener('mouseenter', function() { btn.style.background = 'rgba(121,50,236,0.85)'; btn.style.transform = 'scale(1.1)'; });
      btn.addEventListener('mouseleave', function() { btn.style.background = 'rgba(0,0,0,0.65)'; btn.style.transform = 'scale(1)'; });
      btn.addEventListener('click', function(e) {
        e.stopPropagation(); e.preventDefault();
        vid.muted = !vid.muted;
        updateIcon();
        if (!vid.muted) vid.play().catch(function(){});
      });

      function checkAudio() {
        if (vid.mozHasAudio === false || vid.webkitAudioDecodedByteCount === 0) btn.style.display = 'none';
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

  console.log('[VE] visual-editor v33 starting…');

  var currentTarget = null;
  window.lastSelectedElement = null;
  var currentlyPausedVideo = null;

  /* Undo / Redo history stack */
  var undoStack = [];
  var redoStack = [];
  var maxHistory = 25;

  function pushState() {
    try {
      var state = document.body.innerHTML;
      if (!state || state.length < 200) return;
      if (undoStack.length === 0 || undoStack[undoStack.length - 1] !== state) {
        undoStack.push(state);
        if (undoStack.length > maxHistory) undoStack.shift();
        redoStack = [];
        notifyHistoryState();
      }
    } catch(e){}
  }

  function notifyHistoryState() {
    try {
      window.parent.postMessage({
        type: 'HISTORY_STATE',
        canUndo: undoStack.length > 1,
        canRedo: redoStack.length > 0
      }, '*');
    } catch(e){}
  }

  function doUndo() {
    if (undoStack.length > 1) {
      clearSelection();
      resumePausedVideo();
      var current = undoStack.pop();
      redoStack.push(current);
      var prev = undoStack[undoStack.length - 1];
      document.body.innerHTML = prev;
      // Clear all stale DOM references after innerHTML replacement
      currentTarget = null;
      window.lastSelectedElement = null;
      window.lastSelectedVideo = null;
      window.lastSelectedVideoId = null;
      window.lastSelectedImg = null;
      window.lastSelectedText = null;
      currentlyPausedVideo = null;
      if (window.VideoManager) window.VideoManager.scanVideos();
      // Re-inject admin styles and mute controls
      if (!document.getElementById('ve-styles-editor')) {
        var s = document.createElement('style');
        s.id = 've-styles-editor';
        s.innerHTML = 'body { cursor: crosshair !important; } [data-framer-component-type], .framer-text, .framer-text * { pointer-events: auto !important; }';
        document.head.appendChild(s);
      }
      injectMuteControls();
      notifyHistoryState();
      window.parent.postMessage({ type: 'ELEMENT_INFO', found: false }, '*');
    }
  }

  function doRedo() {
    if (redoStack.length > 0) {
      clearSelection();
      resumePausedVideo();
      var next = redoStack.pop();
      undoStack.push(next);
      document.body.innerHTML = next;
      // Clear all stale DOM references after innerHTML replacement
      currentTarget = null;
      window.lastSelectedElement = null;
      window.lastSelectedVideo = null;
      window.lastSelectedVideoId = null;
      window.lastSelectedImg = null;
      window.lastSelectedText = null;
      currentlyPausedVideo = null;
      if (window.VideoManager) window.VideoManager.scanVideos();
      // Re-inject admin styles and mute controls
      if (!document.getElementById('ve-styles-editor')) {
        var s = document.createElement('style');
        s.id = 've-styles-editor';
        s.innerHTML = 'body { cursor: crosshair !important; } [data-framer-component-type], .framer-text, .framer-text * { pointer-events: auto !important; }';
        document.head.appendChild(s);
      }
      injectMuteControls();
      notifyHistoryState();
      window.parent.postMessage({ type: 'ELEMENT_INFO', found: false }, '*');
    }
  }

  function doResetDefault() {
    window.location.reload();
  }

  /* Initial state push */
  setTimeout(pushState, 500);

  /* Resume video playback */
  function resumePausedVideo() {
    if (currentlyPausedVideo) {
      try {
        currentlyPausedVideo.play().catch(function(){});
      } catch(e) {}
      currentlyPausedVideo = null;
    }
  }

  /* Clear selection highlights */
  function clearSelection() {
    var prevSel = document.querySelectorAll('[data-ve-sel]');
    for (var j = 0; j < prevSel.length; j++) {
      prevSel[j].removeAttribute('data-ve-sel');
      prevSel[j].style.outline = '';
    }
  }

  /* Inject admin cursor and pointer override styles */
  var adminStyle = document.createElement('style');
  adminStyle.id = 've-styles-editor';
  adminStyle.innerHTML = 'body { cursor: crosshair !important; } [data-framer-component-type], .framer-text, .framer-text * { pointer-events: auto !important; }';
  document.head.appendChild(adminStyle);

  /* Signal parent iframe is ready */
  try {
    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
    console.log('[VE] Sent IFRAME_READY');
  } catch(e) {
    console.error('[VE] Failed to send IFRAME_READY', e);
  }

  /* ── Receive messages from parent admin panel ── */
  window.addEventListener('message', function(event) {
    if (!event.data || typeof event.data !== 'object') return;
    var msg = event.data;
    switch (msg.type) {
      case 'MEDIA_SELECTED':  applyMedia(msg.url); break;
      case 'EDIT_ACTION':     handleEditAction(msg.action, msg.value); break;
      case 'UNDO':            doUndo(); break;
      case 'REDO':            doRedo(); break;
      case 'REQUEST_SAVE':    doSave(); break;
      case 'DESELECT':        clearSelection(); resumePausedVideo(); break;
      case 'RESET_DEFAULT':   doResetDefault(); break;
    }
  });

  /* ── Capture double-click ── */
  window.addEventListener('dblclick', function(e) {
    e.preventDefault();
    e.stopPropagation();
    handleDoubleClick(e.target, e.clientX, e.clientY);
  }, true);

  /* ── Block link navigation in admin (never unload iframe) ── */
  window.addEventListener('click', function(e) {
    if (e.target.closest('[contenteditable="true"]')) return;
    if (e.target.closest('.ve-mute-btn')) return;
    var link = e.target.closest('a');
    if (link) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  /* ── Helper: Check if node is a top-level page root container ── */
  function isRootContainer(node) {
    if (!node || node === document.body || node === document.documentElement) return true;
    if (node.id === 'main' || (node.classList && (node.classList.contains('site-wrapper') || node.classList.contains('framer-DOCwU') || node.classList.contains('framer-iEKBO')))) return true;
    if (node.hasAttribute && node.hasAttribute('data-framer-root')) return true;
    var fn = node.getAttribute ? (node.getAttribute('data-framer-name') || '') : '';
    if (fn === 'Desktop' || fn === 'Tablet' || fn === 'Mobile' || fn === 'Page' || fn === 'Content' || fn === 'Root') return true;
    return false;
  }

  /** Check if node is a text tag */
  function isTextNodeOrTag(node) {
    if (!node || isRootContainer(node)) return false;
    if (node.nodeType === 3 && node.textContent.trim()) return true;
    var tags = ['H1','H2','H3','H4','H5','H6','P','SPAN','A','LABEL','B','STRONG','EM','I','BUTTON','DIV','OPTION','SELECT'];
    if (tags.indexOf(node.tagName) !== -1 && node.children.length === 0 && node.textContent.trim()) return true;
    if (tags.indexOf(node.tagName) !== -1 && node.textContent.trim() && node.textContent.trim().length < 500) return true;
    if (node.classList && node.classList.contains('framer-text') && node.textContent.trim()) return true;
    if (node.getAttribute && node.getAttribute('data-framer-component-type') === 'RichTextContainer') return true;
    return false;
  }

  function findVideoInTree(el, maxDepth) {
    // Priority 1: The element itself
    if (el && el.tagName === 'VIDEO') return el;
    // Priority 2: Walk up ancestors looking for <video> tag directly
    var node = el;
    for (var d = 0; d < maxDepth && node && !isRootContainer(node); d++) {
      if (node.tagName === 'VIDEO') return node;
      node = node.parentElement;
    }
    // Priority 3: Check immediate children of the clicked element (not deep querySelector)
    if (el && el.children) {
      for (var c = 0; c < el.children.length; c++) {
        if (el.children[c].tagName === 'VIDEO') return el.children[c];
      }
    }
    // Priority 4: Walk up from el looking for the closest ancestor that directly contains a video child
    node = el;
    for (var d2 = 0; d2 < maxDepth && node && !isRootContainer(node); d2++) {
      if (node.children) {
        for (var k = 0; k < node.children.length; k++) {
          if (node.children[k].tagName === 'VIDEO') return node.children[k];
        }
      }
      // Also check the next level down in case there's a wrapper div
      var inner = node.querySelector ? node.querySelector(':scope > * > video') : null;
      if (inner) return inner;
      node = node.parentElement;
    }
    return null;
  }

  function findImgInTree(el, maxDepth) {
    var node = el;
    for (var d = 0; d < maxDepth && node && !isRootContainer(node); d++) {
      if (node.tagName === 'IMG') return node;
      var img = node.querySelector ? node.querySelector('img') : null;
      if (img) return img;
      node = node.parentElement;
    }
    return null;
  }

  window.lastSelectedVideo = null;
  window.lastSelectedImg = null;
  window.lastSelectedText = null;

  /* ── UNIVERSAL COMPONENT DOUBLE CLICK HANDLER ── */
  function handleDoubleClick(el, clickX, clickY) {
    if (!el || isRootContainer(el)) {
      // If clicked element was root container, try finding precise element under cursor
      var pointEl = document.elementFromPoint(clickX, clickY);
      if (pointEl && !isRootContainer(pointEl)) {
        el = pointEl;
      } else {
        resumePausedVideo();
        clearSelection();
        window.parent.postMessage({ type: 'ELEMENT_INFO', found: false }, '*');
        return;
      }
    }

    // 1. Find parent card / component frame
    var card = el.closest('.p-card, .reel-card, .review-card, article, [data-framer-name], section, header, footer, nav, button, a');
    if (card && isRootContainer(card)) card = null;

    // 2. Locate video, img, and text in component tree
    var treeVideo = (el.tagName === 'VIDEO') ? el : findVideoInTree(el, 12);
    // Fallback: if no video found in tree walk but card exists, find the closest video to the click point
    if (!treeVideo && card) {
      var cardVideos = card.querySelectorAll('video');
      if (cardVideos.length === 1) {
        treeVideo = cardVideos[0];
      } else if (cardVideos.length > 1) {
        // Multiple videos in card: prefer the one whose container is closest to clicked element
        var bestVid = null;
        var bestDist = Infinity;
        for (var vi = 0; vi < cardVideos.length; vi++) {
          var vRect = cardVideos[vi].getBoundingClientRect();
          var elRect = el.getBoundingClientRect();
          var dist = Math.abs(vRect.top - elRect.top) + Math.abs(vRect.left - elRect.left);
          if (dist < bestDist) { bestDist = dist; bestVid = cardVideos[vi]; }
        }
        treeVideo = bestVid;
      }
    }
    var treeImg   = (el.tagName === 'IMG')   ? el : findImgInTree(el, 10)   || (card ? card.querySelector('img') : null);

    var targetText = null;
    if (isTextNodeOrTag(el)) {
      targetText = el;
    } else if (card) {
      targetText = card.querySelector('h1,h2,h3,h4,h5,h6,p,span,.p-name,.p-desc');
    }
    if (!targetText && isTextNodeOrTag(card)) {
      targetText = card;
    }

    // 3. Primary selection target
    var target = treeVideo || treeImg || targetText || card || el;
    if (isRootContainer(target)) {
      target = el;
    }

    if (!target || isRootContainer(target)) {
      console.log('[VE] Double click — no valid specific target');
      resumePausedVideo();
      clearSelection();
      window.parent.postMessage({ type: 'ELEMENT_INFO', found: false }, '*');
      return;
    }

    clearSelection();

    // Clear previous active target markers
    document.querySelectorAll('[data-ve-active-target]').forEach(function(n) {
      n.removeAttribute('data-ve-active-target');
    });

    // Mark persistent active target markers
    if (treeVideo) {
      treeVideo.setAttribute('data-ve-active-target', 'video');
      var vidId = treeVideo.getAttribute('data-ve-video-id');
      if (!vidId && window.VideoManager) {
        window.VideoManager.scanVideos();
        vidId = treeVideo.getAttribute('data-ve-video-id');
      }
      window.lastSelectedVideoId = vidId;
    }
    if (treeImg) treeImg.setAttribute('data-ve-active-target', 'img');
    if (card) card.setAttribute('data-ve-active-target', 'card');
    if (target && target !== treeVideo && target !== treeImg) target.setAttribute('data-ve-active-target', 'target');

    // Store references
    window.lastSelectedVideo = treeVideo;
    window.lastSelectedImg   = treeImg;
    window.lastSelectedText  = targetText;

    // Pause video playback while editing options are open
    if (treeVideo) {
      if (currentlyPausedVideo && currentlyPausedVideo !== treeVideo) {
        resumePausedVideo();
      }
      currentlyPausedVideo = treeVideo;
      if (!treeVideo.paused) {
        try { treeVideo.pause(); } catch(e){}
      }
    } else {
      resumePausedVideo();
    }

    var outlineEl = card || target;
    outlineEl.setAttribute('data-ve-sel', '1');
    outlineEl.style.outline = '2px solid #7932ec';
    currentTarget = target;
    window.lastSelectedElement = target;

    var hasVideo = Boolean(treeVideo);
    var hasImage = Boolean(treeImg);
    var hasText  = Boolean(targetText && targetText.textContent && targetText.textContent.trim().length > 0);
    var isMedia  = hasVideo || hasImage;

    var rect = outlineEl.getBoundingClientRect();
    if ((rect.width === 0 || rect.height === 0) && outlineEl.parentElement) {
      rect = outlineEl.parentElement.getBoundingClientRect();
    }

    var linkEl = outlineEl.closest('a') || (target.tagName === 'A' ? target : null);
    var isLink = Boolean(linkEl);
    var linkHref = linkEl ? linkEl.getAttribute('href') || '' : '';

    var info = {
      type: 'ELEMENT_INFO',
      found: true,
      isMedia: isMedia,
      hasVideo: hasVideo,
      hasImage: hasImage,
      hasText: hasText,
      isLink: isLink,
      linkHref: linkHref,
      tag: target.tagName,
      isVideo: hasVideo,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
    };
    console.log('[VE] ELEMENT_INFO →', info);
    window.parent.postMessage(info, '*');
  }

  /* ── EDIT ACTIONS ── */
  function handleEditAction(action, value) {
    console.log('[VE] handleEditAction:', action, value);
    var target = currentTarget || window.lastSelectedElement;
    if (!target) { console.log('[VE] No target element!'); return; }

    pushState();

    if (action === 'EDIT_TEXT') {
      var textNode = window.lastSelectedText || (isTextNodeOrTag(target) ? target : null);
      if (!textNode || textNode.tagName === 'VIDEO' || textNode.tagName === 'IMG') {
        var parentCard = target.closest ? target.closest('.p-card, .reel-card, .review-card, article, [data-framer-name], section') : null;
        if (parentCard) {
          textNode = parentCard.querySelector('h1,h2,h3,h4,h5,h6,p,span,.p-name,.p-desc') || parentCard;
        } else {
          textNode = target;
        }
      }

      function enableEditing(n) {
        if (!n || n.nodeType !== 1) return;
        if (n.classList && (n.classList.contains('p-chk') || n.classList.contains('p-badge') || n.classList.contains('ve-mute-btn'))) {
          n.setAttribute('contenteditable', 'false');
          return;
        }
        if (n.tagName === 'VIDEO' || n.tagName === 'IMG') return;

        n.contentEditable = 'true';
        n.style.setProperty('outline', '2px dashed #7932ec', 'important');
        n.style.setProperty('pointer-events', 'auto', 'important');
        n.style.setProperty('user-select', 'text', 'important');
        n.style.setProperty('-webkit-user-select', 'text', 'important');
      }

      function disableEditing(n) {
        if (!n || n.nodeType !== 1) return;
        n.removeAttribute('contenteditable');
        n.style.outline = '';
        n.style.removeProperty('pointer-events');
        n.style.removeProperty('user-select');
        n.style.removeProperty('-webkit-user-select');
        if (n.children) {
          for (var i = 0; i < n.children.length; i++) {
            disableEditing(n.children[i]);
          }
        }
      }

      enableEditing(textNode);
      textNode.focus();
      try {
        var range = document.createRange();
        var sel   = window.getSelection();
        range.selectNodeContents(textNode);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch(e) {}

      textNode.addEventListener('blur', function onBlur() {
        textNode.removeEventListener('blur', onBlur);
        disableEditing(textNode);
        resumePausedVideo();
        pushState();
        window.parent.postMessage({ type: 'EDITING_DONE' }, '*');
      }, { once: true, capture: true });
    }
    else if (action === 'EDIT_LINK' && value !== undefined) {
      var aTag = target.closest('a') || (target.tagName === 'A' ? target : null);
      if (aTag) {
        aTag.setAttribute('href', value);
      } else {
        target.setAttribute('data-href', value);
      }
      resumePausedVideo();
    }
    else if (action === 'CHANGE_COLOR' && value) {
      var colorTarget = window.lastSelectedText || target;
      colorTarget.style.setProperty('color', value, 'important');
      colorTarget.querySelectorAll('span,p,h1,h2,h3,h4,h5,h6')
        .forEach(function(n){ n.style.setProperty('color', value, 'important'); });
      resumePausedVideo();
    }
    else if (action === 'CHANGE_BG_COLOR' && value) {
      target.style.setProperty('background-color', value, 'important');
      resumePausedVideo();
    }
    else if (action === 'CHANGE_FONT' && value) {
      var fontTarget = window.lastSelectedText || target;
      fontTarget.style.setProperty('font-family', value, 'important');
      fontTarget.querySelectorAll('span,p,h1,h2,h3,h4,h5,h6')
        .forEach(function(n){ n.style.setProperty('font-family', value, 'important'); });
      resumePausedVideo();
    }
    else if (action === 'DUPLICATE') {
      resumePausedVideo();
      var dupTarget = target.closest('.p-card, .reel-card, .review-card, article') || target;
      var clone = dupTarget.cloneNode(true);
      clone.removeAttribute('data-ve-sel');
      clone.removeAttribute('data-ve-active-target');
      clone.style.outline = '';
      if (dupTarget.nextSibling) {
        dupTarget.parentNode.insertBefore(clone, dupTarget.nextSibling);
      } else {
        dupTarget.parentNode.appendChild(clone);
      }
    }
    else if (action === 'DELETE') {
      resumePausedVideo();
      var delTarget = target.closest('.p-card, .reel-card, .review-card, article') || target;
      delTarget.remove(); currentTarget = null; window.lastSelectedElement = null;
    }
    else if (action === 'REPLACE_MEDIA') {
      window.parent.postMessage({ type: 'REQUEST_MEDIA' }, '*');
    }
  }

  /* ── APPLY MEDIA (Per-frame exact sizing and fitting) ── */
  function applyMedia(url) {
    if (!url) return;
    console.log('[VE] applyMedia called with:', url);
    var cleanUrl = url.trim();

    // Guard: clear any detached (stale) DOM references
    if (currentTarget && !document.body.contains(currentTarget)) currentTarget = null;
    if (window.lastSelectedElement && !document.body.contains(window.lastSelectedElement)) window.lastSelectedElement = null;
    if (window.lastSelectedVideo && !document.body.contains(window.lastSelectedVideo)) window.lastSelectedVideo = null;
    if (window.lastSelectedImg && !document.body.contains(window.lastSelectedImg)) window.lastSelectedImg = null;

    var isVideoUrl = /\.(mp4|webm|mov|m4v|ogv|mkv|avi|blob)/i.test(cleanUrl) || 
                     cleanUrl.startsWith('blob:') ||
                     cleanUrl.startsWith('data:video') ||
                     cleanUrl.includes('video') || 
                     (cleanUrl.includes('/media/') && !/\.(png|jpe?g|gif|webp|svg)/i.test(cleanUrl)) ||
                     cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be') || cleanUrl.includes('instagram.com');

    // Use VideoManager for robust video replacement
    if (isVideoUrl && window.lastSelectedVideoId && window.VideoManager) {
      var result = window.VideoManager.replaceSelected(window.lastSelectedVideoId, cleanUrl);
      if (result.success) {
        notifyHistoryState();
        window.parent.postMessage({ 
          type: 'REPLACEMENT_SUCCESS', 
          message: 'Video ' + (result.friendlyName || window.lastSelectedVideoId) + ' replaced successfully. Updated variants: ' + result.variants.join(', ')
        }, '*');
      } else {
        window.parent.postMessage({ type: 'SAVE_ERROR', message: 'Failed to replace video: ' + result.error }, '*');
      }
      return;
    }

    // Multi-stage target resolution (fallback for images/text or if VideoManager fails)
    var t = null;

    // Stage 1: Check persistent active target markers in DOM
    if (isVideoUrl) {
      t = document.querySelector('video[data-ve-active-target]') || 
          document.querySelector('[data-ve-active-target="card"] video') ||
          document.querySelector('[data-ve-active-target="target"] video') ||
          window.lastSelectedVideo;
    } else {
      t = document.querySelector('img[data-ve-active-target]') || 
          document.querySelector('[data-ve-active-target="card"] img') ||
          document.querySelector('[data-ve-active-target="target"] img') ||
          window.lastSelectedImg;
    }

    // Stage 2: Fallback to currentTarget / lastSelectedElement
    if (!t) {
      t = currentTarget || window.lastSelectedElement;
    }

    // Stage 3: If t is a container or text node, look for inner video/img in parent card component
    if (t && t.tagName !== 'IMG' && t.tagName !== 'VIDEO' && t.tagName !== 'IFRAME') {
      var card = (t.closest ? t.closest('.p-card, .reel-card, .review-card, article, [data-framer-name], section') : null) || t.parentElement;
      var childVid = (isVideoUrl && card) ? card.querySelector('video') : (t.querySelector ? t.querySelector('video') : null);
      var childImg = (!isVideoUrl && card) ? card.querySelector('img') : (t.querySelector ? t.querySelector('img') : null);
      var childIfr = card ? card.querySelector('iframe') : (t.querySelector ? t.querySelector('iframe') : null);

      if (childVid) t = childVid;
      else if (childImg) t = childImg;
      else if (childIfr) t = childIfr;
    }

    // Stage 4: Ultimate fallback — if still no target, search any active card in document
    if (!t) {
      var activeCard = document.querySelector('[data-ve-active-target]') || document.querySelector('[data-ve-sel]');
      if (activeCard) {
        t = isVideoUrl ? activeCard.querySelector('video') : activeCard.querySelector('img');
        if (!t) t = activeCard;
      }
    }

    if (!t) {
      console.warn('[VE] No target element available to replace media!');
      return;
    }

    // If t is a container or text node, look for video/img in parent card component
    if (t.tagName !== 'IMG' && t.tagName !== 'VIDEO' && t.tagName !== 'IFRAME') {
      var card = (t.closest ? t.closest('.p-card, .reel-card, .review-card, article, [data-framer-name], section') : null) || t.parentElement;
      var childVid = (isVideoUrl && card) ? card.querySelector('video') : (t.querySelector ? t.querySelector('video') : null);
      var childImg = (!isVideoUrl && card) ? card.querySelector('img') : (t.querySelector ? t.querySelector('img') : null);
      var childIfr = card ? card.querySelector('iframe') : (t.querySelector ? t.querySelector('iframe') : null);

      if (childVid) t = childVid;
      else if (childImg) t = childImg;
      else if (childIfr) t = childIfr;
    }

    var origClass = t.className || '';
    var origStyle = t.getAttribute('style') || '';

    // Detect YouTube / Instagram URLs
    var ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    var igMatch = cleanUrl.match(/instagram\.com\/(?:p|reel)\/([^"&?\/\s]+)/i);

    if (ytMatch && ytMatch[1]) {
      pushState();
      var embedYtUrl = 'https://www.youtube.com/embed/' + ytMatch[1] + '?autoplay=1&mute=1&loop=1&playlist=' + ytMatch[1] + '&controls=0&playsinline=1';
      var iframeYt = document.createElement('iframe');
      iframeYt.src = embedYtUrl;
      iframeYt.style.cssText = 'width:100%!important;height:100%!important;border:none!important;display:block!important;border-radius:inherit!important;pointer-events:none;';
      iframeYt.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
      if (origClass) iframeYt.className = origClass;
      t.replaceWith(iframeYt);
      t = iframeYt;
      currentlyPausedVideo = null;
      currentTarget = t;
      window.lastSelectedElement = t;
      pushState();
      return;
    } else if (igMatch && igMatch[1]) {
      pushState();
      var embedIgUrl = 'https://www.instagram.com/p/' + igMatch[1] + '/embed/';
      var iframeIg = document.createElement('iframe');
      iframeIg.src = embedIgUrl;
      iframeIg.style.cssText = 'width:100%!important;height:100%!important;border:none!important;display:block!important;border-radius:inherit!important;pointer-events:none;';
      if (origClass) iframeIg.className = origClass;
      t.replaceWith(iframeIg);
      t = iframeIg;
      currentlyPausedVideo = null;
      currentTarget = t;
      window.lastSelectedElement = t;
      pushState();
      return;
    }

    pushState();

    var isVideo = isVideoUrl;
    var computedStyle = window.getComputedStyle(t);
    var computedRadius = computedStyle.borderRadius;

    if (isVideo) {
      if (t.tagName === 'VIDEO') {
        t.removeAttribute('poster');
        t.querySelectorAll('source').forEach(function(s){ s.src = cleanUrl; });
        t.src = cleanUrl;
        t.muted = true;
        t.defaultMuted = true;
        t.loop = true;
        t.autoplay = true;
        t.setAttribute('playsinline', '');
        t.setAttribute('webkit-playsinline', '');
        t.style.setProperty('object-fit', 'cover', 'important');
        t.style.setProperty('width', '100%', 'important');
        t.style.setProperty('height', '100%', 'important');
        t.style.setProperty('display', 'block', 'important');
        t.load();
        var p1 = t.play();
        if (p1 !== undefined) p1.catch(function(){});
      } else {
        // Converting IMG/DIV -> VIDEO
        var v = document.createElement('video');
        v.autoplay = true;
        v.loop = true;
        v.muted = true;
        v.defaultMuted = true;
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
        window.lastSelectedVideo = v;
        v.load();
        var p2 = v.play();
        if (p2 !== undefined) p2.catch(function(){});
      }
      delete t.dataset.muteInjected;
      setTimeout(injectMuteControls, 100);
    } else {
      // Image replacement
      if (t.tagName === 'IMG') {
        t.removeAttribute('srcset');
        t.src = cleanUrl;
        t.style.setProperty('object-fit', 'cover', 'important');
        t.style.setProperty('width', '100%', 'important');
        t.style.setProperty('height', '100%', 'important');
        t.style.setProperty('display', 'block', 'important');
      } else {
        // Converting VIDEO -> IMG
        var img = document.createElement('img');
        img.loading = 'lazy';
        if (origClass) img.className = origClass;
        if (origStyle) img.setAttribute('style', origStyle);

        img.style.setProperty('object-fit', 'cover', 'important');
        img.style.setProperty('width', '100%', 'important');
        img.style.setProperty('height', '100%', 'important');
        img.style.setProperty('display', 'block', 'important');
        if (computedRadius && computedRadius !== '0px') {
          img.style.setProperty('border-radius', computedRadius, 'important');
        }

        img.src = cleanUrl;
        t.replaceWith(img);
        t = img;
        window.lastSelectedImg = img;
      }
    }

    currentlyPausedVideo = null;
    currentTarget = t;
    window.lastSelectedElement = t;

    if (currentTarget) {
      currentTarget.setAttribute('data-ve-sel', '1');
      currentTarget.style.outline = '2px solid #7932ec';
    }
  }

  /* ── SAVE ── */
  function doSave() {
    try {
      resumePausedVideo();
      var clone = document.body.cloneNode(true);
      var badge = clone.querySelector('#__framer-badge-container');
      if (badge) badge.remove();
      clone.querySelectorAll('[data-ve-sel], [data-ve-active-target]').forEach(function(n) {
        n.removeAttribute('data-ve-sel');
        n.removeAttribute('data-ve-active-target');
        n.style.outline = '';
      });
      var styleEditor = clone.querySelector('#ve-styles-editor');
      if (styleEditor) styleEditor.remove();
      clone.querySelectorAll('.ve-mute-btn').forEach(function(n){ n.remove(); });

      // Strip editor-injected data-mute-injected attribute so mute buttons re-inject on live site
      clone.querySelectorAll('[data-mute-injected]').forEach(function(n) {
        n.removeAttribute('data-mute-injected');
      });

      // Block save if any blob: URLs exist (they won't survive page reload)
      var htmlToSave = clone.innerHTML;
      if (htmlToSave.indexOf('blob:') !== -1) {
        window.parent.postMessage({
          type: 'SAVE_ERROR',
          message: 'Cannot save: page contains temporary local media URLs (blob:). Please re-upload the media files using Supabase Storage before saving.'
        }, '*');
        return;
      }

      var pageName = window.location.pathname.split('/').pop() || 'index.html';
      window.parent.postMessage({
        type: 'SAVE_CONTENT',
        content: htmlToSave,
        page: pageName
      }, '*');
    } catch(e) {
      console.error('[VE] Save error:', e);
    }
  }

  console.log('[VE] visual-editor v33 fully initialized — Message listener + video selection fix active!');
})();

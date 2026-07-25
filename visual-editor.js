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

  console.log('[VE] visual-editor v32 starting…');

  var currentTarget = null;
  window.lastSelectedElement = null;
  var currentlyPausedVideo = null;

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

  /* Inject admin cursor style */
  var adminStyle = document.createElement('style');
  adminStyle.id = 've-styles-editor';
  adminStyle.innerHTML = 'body { cursor: crosshair !important; }';
  document.head.appendChild(adminStyle);

  /* Signal parent iframe is ready */
  try {
    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
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

  /* ── UNIVERSAL COMPONENT DOUBLE CLICK HANDLER ── */
  function handleDoubleClick(el, clickX, clickY) {
    if (!el || el === document.body || el === document.documentElement) {
      resumePausedVideo();
      clearSelection();
      window.parent.postMessage({ type: 'ELEMENT_INFO', found: false }, '*');
      return;
    }

    var target = null;

    // 1. Direct hit on VIDEO or IMG tag
    if (el.tagName === 'VIDEO') {
      target = el;
    } else if (el.tagName === 'IMG') {
      target = el;
    } else {
      // 2. Look for VIDEO in component tree (up to 12 levels)
      var treeVideo = findVideoInTree(el, 12);
      if (treeVideo) {
        if (isTextNodeOrTag(el)) {
          target = el; // Specific text inside video component
        } else {
          target = treeVideo; // Video element / video card
        }
      } else {
        // 3. Look for IMG in component tree (up to 10 levels)
        var treeImg = findImgInTree(el, 10);
        if (treeImg) {
          if (isTextNodeOrTag(el)) {
            target = el; // Specific text inside image component
          } else {
            target = treeImg; // Image element / image card
          }
        } else {
          // 4. Direct text element
          if (isTextNodeOrTag(el)) {
            target = el;
          } else {
            // 5. UNIVERSAL COMPONENT FALLBACK: Any div, article, section, card, button, etc.
            target = el.closest('article, [data-framer-name], .reel-card, .review-card, section, header, footer, nav, button, a') || el;
          }
        }
      }
    }

    if (!target) {
      console.log('[VE] Double click — no target');
      resumePausedVideo();
      clearSelection();
      window.parent.postMessage({ type: 'ELEMENT_INFO', found: false }, '*');
      return;
    }

    clearSelection();

    // Pause video playback while editing options are open
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
    target.style.outline = '2px solid #7932ec';
    currentTarget = target;
    window.lastSelectedElement = target;

    var isVideoTag = (target.tagName === 'VIDEO') || (target.querySelector && target.querySelector('video') !== null);
    var isImgTag   = (target.tagName === 'IMG')   || (target.querySelector && target.querySelector('img') !== null);
    var isMedia    = isVideoTag || isImgTag;

    var rect = target.getBoundingClientRect();
    if ((rect.width === 0 || rect.height === 0) && target.parentElement) {
      rect = target.parentElement.getBoundingClientRect();
    }

    var info = {
      type: 'ELEMENT_INFO',
      found: true,
      isMedia: isMedia,
      tag: target.tagName,
      isVideo: isVideoTag,
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

    if (action === 'EDIT_TEXT') {
      target.contentEditable = 'true';
      target.style.outline = '2px dashed #7932ec';
      target.style.setProperty('pointer-events', 'all', 'important');
      target.style.setProperty('user-select', 'text', 'important');
      target.style.setProperty('-webkit-user-select', 'text', 'important');
      target.focus();
      try {
        var range = document.createRange();
        var sel   = window.getSelection();
        range.selectNodeContents(target);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch(e) {}
      target.addEventListener('blur', function onBlur() {
        target.removeEventListener('blur', onBlur);
        target.contentEditable = 'false';
        target.style.outline = '';
        target.style.removeProperty('pointer-events');
        target.style.removeProperty('user-select');
        target.style.removeProperty('-webkit-user-select');
        resumePausedVideo();
        window.parent.postMessage({ type: 'EDITING_DONE' }, '*');
      }, { once: true });
    }
    else if (action === 'CHANGE_COLOR' && value) {
      target.style.setProperty('color', value, 'important');
      target.querySelectorAll('span,p,h1,h2,h3,h4,h5,h6')
        .forEach(function(n){ n.style.setProperty('color', value, 'important'); });
      resumePausedVideo();
    }
    else if (action === 'CHANGE_FONT' && value) {
      target.style.setProperty('font-family', value, 'important');
      target.querySelectorAll('span,p,h1,h2,h3,h4,h5,h6')
        .forEach(function(n){ n.style.setProperty('font-family', value, 'important'); });
      resumePausedVideo();
    }
    else if (action === 'DELETE') {
      resumePausedVideo();
      target.remove(); currentTarget = null; window.lastSelectedElement = null;
    }
    else if (action === 'REPLACE_MEDIA') {
      window.parent.postMessage({ type: 'REQUEST_MEDIA' }, '*');
    }
  }

  /* ── APPLY MEDIA (Per-frame exact sizing and fitting) ── */
  function applyMedia(url) {
    var t = currentTarget || window.lastSelectedElement;
    if (!t) {
      console.warn('[VE] No target element available to replace media!');
      return;
    }
    var cleanUrl = url.trim();

    if (t.tagName !== 'IMG' && t.tagName !== 'VIDEO') {
      var childVid = t.querySelector('video');
      var childImg = t.querySelector('img');
      if (childVid) t = childVid;
      else if (childImg) t = childImg;
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
        // Converting IMG -> VIDEO
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
      clone.querySelectorAll('[data-ve-sel]').forEach(function(n) {
        n.removeAttribute('data-ve-sel'); n.style.outline = '';
      });
      var styleEditor = clone.querySelector('#ve-styles-editor');
      if (styleEditor) styleEditor.remove();
      clone.querySelectorAll('.ve-mute-btn').forEach(function(n){ n.remove(); });

      var pageName = window.location.pathname.split('/').pop() || 'index.html';
      window.parent.postMessage({
        type: 'SAVE_CONTENT',
        content: clone.innerHTML,
        page: pageName
      }, '*');
    } catch(e) {
      console.error('[VE] Save error:', e);
    }
  }

  console.log('[VE] visual-editor v32 fully initialized — Universal component editing enabled!');
})();

// This script fetches data from your Supabase CMS and updates the live website in REAL-TIME.

const SUPABASE_URL = 'https://sdvcpkexawlihomyhkkp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdmNwa2V4YXdsaWhvbXloa2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzk2ODAsImV4cCI6MjA5OTYxNTY4MH0.g02cUmn305wiUZ4aNfKr43SaeveI1FcmPwTmBia5dh4';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get('admin') === 'true';

(function injectHidePencilStyle() {
  if (!document.getElementById('hide-pencil-button')) {
    var st = document.createElement('style');
    st.id = 'hide-pencil-button';
    st.innerHTML = 'use[href*="1899053508"], [id="1899053508"], .framer-r6zv2z { display: none !important; opacity: 0 !important; pointer-events: none !important; visibility: hidden !important; }';
    (document.head || document.documentElement).appendChild(st);
  }
})();

/**
 * Recursively diffs and patches the live DOM with the saved HTML.
 * Real-Time DOM reconcile logic for text, media, styles, and structural changes.
 */
function patchDOM(liveNode, savedNode) {
  if (!liveNode || !savedNode) return;

  // Skip script, style, and noscript elements completely
  if (liveNode.tagName === 'SCRIPT' || liveNode.tagName === 'STYLE' || liveNode.tagName === 'NOSCRIPT') {
    return;
  }

  // 1. Sync Text Node values
  if (liveNode.nodeType === Node.TEXT_NODE && savedNode.nodeType === Node.TEXT_NODE) {
    if (liveNode.nodeValue !== savedNode.nodeValue) {
      liveNode.nodeValue = savedNode.nodeValue;
    }
    return;
  }

  if (liveNode.nodeType !== savedNode.nodeType) return;

  if (liveNode.nodeType === Node.ELEMENT_NODE) {
    // If tag names differ, handle media element replacement (IMG <-> VIDEO <-> IFRAME)
    if (liveNode.tagName !== savedNode.tagName) {
      if (['IMG', 'VIDEO', 'IFRAME'].includes(liveNode.tagName) && ['IMG', 'VIDEO', 'IFRAME'].includes(savedNode.tagName)) {
        const replacement = savedNode.cloneNode(true);
        liveNode.replaceWith(replacement);
        if (replacement.tagName === 'VIDEO') {
          replacement.load();
          replacement.play().catch(() => {});
        }
      }
      return;
    }

    // 2. Sync visual, text styling, and media attributes across ALL elements
    const attrsToSync = ['class', 'style', 'src', 'srcset', 'href', 'poster'];

    attrsToSync.forEach(attrName => {
      if (savedNode.hasAttribute(attrName)) {
        const val = savedNode.getAttribute(attrName);
        if (liveNode.getAttribute(attrName) !== val) {
          if (liveNode.tagName === 'VIDEO' && attrName === 'src') {
            liveNode.setAttribute('src', val);
            liveNode.load();
            const playPromise = liveNode.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {});
            }
          } else {
            liveNode.setAttribute(attrName, val);
          }
        }
      } else {
        if (liveNode.hasAttribute(attrName)) {
          liveNode.removeAttribute(attrName);
        }
      }
    });

    // 3. Sync Children recursively (with structural additions/deletions handling)
    const liveChildren = Array.from(liveNode.childNodes);
    const savedChildren = Array.from(savedNode.childNodes);
    const minLen = Math.min(liveChildren.length, savedChildren.length);

    for (let i = 0; i < minLen; i++) {
      patchDOM(liveChildren[i], savedChildren[i]);
    }

    // If elements were deleted in savedNode, remove them from liveNode
    if (liveChildren.length > savedChildren.length) {
      for (let i = savedChildren.length; i < liveChildren.length; i++) {
        if (liveChildren[i].tagName !== 'SCRIPT' && liveChildren[i].tagName !== 'STYLE') {
          liveChildren[i].remove();
        }
      }
    }
  }
}

/**
 * Loads CMS content from Supabase database and updates the live website in real time.
 */
async function loadCMSContent() {
  try {
    const isProjectsPage = window.location.pathname.includes('projects.html');
    const columnName = isProjectsPage ? 'seo_keywords' : 'site_description';

    const { data, error } = await client
      .from('site_settings')
      .select(columnName)
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0 && data[0][columnName]) {
      const savedHTML = data[0][columnName].trim();
      if (!savedHTML) return;

      const liveMain = document.getElementById('main');
      const parser = new DOMParser();
      const savedDoc = parser.parseFromString(savedHTML, 'text/html');
      const savedMain = savedDoc.getElementById('main');

      if (liveMain) {
        if (savedMain && savedMain.innerHTML.trim()) {
          liveMain.innerHTML = savedMain.innerHTML;
        } else if (savedDoc.body && savedDoc.body.innerHTML.trim()) {
          liveMain.innerHTML = savedDoc.body.innerHTML;
        } else {
          liveMain.innerHTML = savedHTML;
        }
      } else if (savedDoc.body && document.body) {
        document.body.innerHTML = savedDoc.body.innerHTML;
      }

      // Re-initialize mute controls and video scripts on live website
      if (typeof injectMuteControls === 'function') {
        injectMuteControls();
      }
    }
  } catch (err) {
    console.error('[CMS] Error loading CMS content:', err);
  }
}

// Defer CMS content load until idle to guarantee instant initial page paint
function scheduleCMSLoad() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadCMSContent, { timeout: 1000 });
  } else {
    setTimeout(loadCMSContent, 100);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleCMSLoad);
} else {
  scheduleCMSLoad();
}

// REAL-TIME SUPABASE SUBSCRIPTION: Listen for live database updates
try {
  client.channel('site_settings_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, payload => {
      console.log('[CMS Realtime] Database change detected — updating live website in real time!');
      loadCMSContent();
    })
    .subscribe();
} catch(e) {
  console.warn('[CMS Realtime] Subscription warning:', e);
}

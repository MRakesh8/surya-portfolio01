// This script fetches data from your Supabase CMS and updates the live website in REAL-TIME.
// It listens for BOTH Supabase Realtime DB changes AND BroadcastChannel messages from the Admin.

const SUPABASE_URL = 'https://sdvcpkexawlihomyhkkp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdmNwa2V4YXdsaWhvbXloa2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzk2ODAsImV4cCI6MjA5OTYxNTY4MH0.g02cUmn305wiUZ4aNfKr43SaeveI1FcmPwTmBia5dh4';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get('admin') === 'true';

/**
 * Determines which Supabase column to read for the current page.
 * Handles: '/', '/index.html', '/projects.html', '/projects'
 */
function getColumnForCurrentPage() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const isProjectsPage = pathname.endsWith('/projects') || pathname.endsWith('/projects.html');
  return isProjectsPage ? 'seo_keywords' : 'site_description';
}

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
    // If tag names differ, handle media element replacement (IMG <-> VIDEO)
    if (liveNode.tagName !== savedNode.tagName) {
      if (['IMG', 'VIDEO'].includes(liveNode.tagName) && ['IMG', 'VIDEO'].includes(savedNode.tagName)) {
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

async function loadCMSContent() {
  try {
    const columnName = getColumnForCurrentPage();

    const { data, error } = await client
      .from('site_settings')
      .select(columnName)
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0 && data[0][columnName]) {
      const savedHTML = data[0][columnName];

      // SAFETY GUARD: Only proceed if savedHTML is valid HTML content with tags and significant length
      if (
        typeof savedHTML === 'string' &&
        savedHTML.length > 200 &&
        (savedHTML.includes('<section') || savedHTML.includes('<div') || savedHTML.includes('<nav') || savedHTML.includes('<main'))
      ) {
        const parser = new DOMParser();
        const savedDoc = parser.parseFromString(savedHTML, 'text/html');

        // Try to target a specific root element for a precise patch
        const liveMain = document.getElementById('main');
        const savedMain = savedDoc.getElementById('main');

        if (liveMain && savedMain) {
          patchDOM(liveMain, savedMain);
        } else {
          // Try Framer root or site-wrapper
          const liveRoot =
            document.querySelector('[data-framer-root]') ||
            document.querySelector('.site-wrapper') ||
            document.querySelector('main');
          const savedRoot =
            savedDoc.querySelector('[data-framer-root]') ||
            savedDoc.querySelector('.site-wrapper') ||
            savedDoc.querySelector('main');

          if (liveRoot && savedRoot) {
            patchDOM(liveRoot, savedRoot);
          } else {
            // Full body patch as final fallback
            patchDOM(document.body, savedDoc.body);
          }
        }
        console.log('[CMS Sync] ✅ Live site patched from Supabase data.');
      }
    }
  } catch (err) {
    console.error('[CMS Sync] Error loading CMS content:', err);
  }
}

// ─────────────────────────────────────────────────────────
// 📡 BroadcastChannel — Instant same-browser tab sync
// When the Admin presses "Save & Publish", it broadcasts
// a message on this channel. Any open live site tab picks
// it up immediately and refreshes content from Supabase.
// ─────────────────────────────────────────────────────────
if (typeof BroadcastChannel !== 'undefined') {
  try {
    const syncChannel = new BroadcastChannel('scrollz-cms-sync');
    syncChannel.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CONTENT_UPDATED') {
        console.log('[CMS Sync] 📡 Admin published! Syncing live site instantly...');
        loadCMSContent();
      }
    });
    console.log('[CMS Sync] BroadcastChannel listener active.');
  } catch (e) {
    console.warn('[CMS Sync] BroadcastChannel not available:', e);
  }
}

// ─────────────────────────────────────────────────────────
// 🔴 Supabase Realtime — Cross-device / cross-browser sync
// NOTE: For this to work, you must enable Realtime on the
// site_settings table in your Supabase Dashboard:
//   Database → Replication → Enable for site_settings
// ─────────────────────────────────────────────────────────
try {
  client
    .channel('scrollz_site_settings_changes')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'site_settings' },
      (payload) => {
        console.log('[CMS Realtime] 🔴 Database update detected — patching live DOM...');
        loadCMSContent();
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[CMS Realtime] ✅ Realtime subscription active.');
      }
    });
} catch (e) {
  console.warn('[CMS Realtime] Subscription warning:', e);
}

// Load content on initial page load (for public visitors arriving fresh)
window.addEventListener('load', () => {
  setTimeout(loadCMSContent, 400);
});

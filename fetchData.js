// This script fetches data from your Supabase CMS and updates the live website.

const SUPABASE_URL = 'https://sdvcpkexawlihomyhkkp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdmNwa2V4YXdsaWhvbXloa2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzk2ODAsImV4cCI6MjA5OTYxNTY4MH0.g02cUmn305wiUZ4aNfKr43SaeveI1FcmPwTmBia5dh4';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get('admin') === 'true';

/**
 * Surgically patches media elements (img, video) in the live DOM
 * using a saved HTML string as the source of truth.
 * This avoids replacing document.body.innerHTML which destroys
 * all event listeners, scripts, and interactive functionality.
 */
function patchMediaElements(savedHTML) {
  // Parse the saved HTML into a detached document
  const parser = new DOMParser();
  const savedDoc = parser.parseFromString(savedHTML, 'text/html');

  // --- 1. Patch elements that have an ID ---
  const savedMediaWithId = savedDoc.querySelectorAll('img[id], video[id]');
  savedMediaWithId.forEach(savedEl => {
    const liveEl = document.getElementById(savedEl.id);
    if (!liveEl) return;

    if (savedEl.tagName === 'VIDEO') {
      patchVideoElement(liveEl, savedEl.src);
    } else if (savedEl.tagName === 'IMG') {
      if (liveEl.src !== savedEl.src) {
        liveEl.src = savedEl.src;
      }
    }
  });

  // --- 2. Patch elements by matching their position in the DOM ---
  // For elements without IDs (e.g. phone gallery videos), match by index
  const liveVideos = Array.from(document.querySelectorAll('video'));
  const savedVideos = Array.from(savedDoc.querySelectorAll('video'));

  savedVideos.forEach((savedVid, i) => {
    // Skip if already handled by ID match above
    if (savedVid.id && document.getElementById(savedVid.id)) return;
    if (liveVideos[i] && liveVideos[i].getAttribute('src') !== savedVid.getAttribute('src')) {
      patchVideoElement(liveVideos[i], savedVid.getAttribute('src'));
    }
  });

  const liveImgs = Array.from(document.querySelectorAll('img:not([data-skip-cms])'));
  const savedImgs = Array.from(savedDoc.querySelectorAll('img'));

  savedImgs.forEach((savedImg, i) => {
    if (savedImg.id && document.getElementById(savedImg.id)) return;
    if (liveImgs[i] && liveImgs[i].src !== savedImg.src) {
      liveImgs[i].src = savedImg.src;
    }
  });

  // --- 3. Patch CMS text fields (elements with cms- IDs) ---
  const cmsElements = savedDoc.querySelectorAll('[id^="cms-"]');
  cmsElements.forEach(savedEl => {
    const liveEl = document.getElementById(savedEl.id);
    if (liveEl && liveEl.innerHTML !== savedEl.innerHTML) {
      liveEl.innerHTML = savedEl.innerHTML;
    }
  });
}

/**
 * Replaces a video's src cleanly, forcing reload and autoplay.
 * Works around browser quirks with dynamically injected video elements.
 */
function patchVideoElement(liveVid, newSrc) {
  if (!newSrc || liveVid.getAttribute('src') === newSrc) return;

  liveVid.setAttribute('src', newSrc);
  liveVid.muted = true;
  liveVid.setAttribute('muted', '');
  liveVid.setAttribute('playsinline', '');
  liveVid.load();

  // Play when ready, respecting browser autoplay policy
  if (liveVid.hasAttribute('autoplay') || liveVid.classList.contains('active')) {
    const playPromise = liveVid.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked — video will play on user interaction
      });
    }
  }
}

async function loadCMSContent() {
  if (isAdmin) {
    // If in Admin builder mode, don't override the page
    return;
  }

  try {
    const isProjectsPage = window.location.pathname.includes('projects.html');
    const columnName = isProjectsPage ? 'seo_keywords' : 'site_description';

    const { data, error } = await client
      .from('site_settings')
      .select(columnName)
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0 && data[0][columnName]) {
      const savedHTML = data[0][columnName];
      // Only process if it actually contains HTML
      if (savedHTML.includes('<section') || savedHTML.includes('<div')) {
        // Surgically patch only media elements — no full body replacement
        patchMediaElements(savedHTML);
      }
    }
  } catch (err) {
    console.error('Error loading CMS content:', err);
  }
}

// Load content when the DOM is ready
document.addEventListener('DOMContentLoaded', loadCMSContent);

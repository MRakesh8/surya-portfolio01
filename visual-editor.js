(function() {
// This script only runs when the page is loaded inside the Admin iframe.
var editorParams = new URLSearchParams(window.location.search);
var editorIsAdmin = editorParams.get('admin') === 'true';

if (editorIsAdmin) {
  console.log("Visual Editor Mode Activated");

  // Undo/Redo State
  let historyStack = [];
  let historyIndex = -1;
  let currentTarget = null;

  const saveState = () => {
    const clone = document.body.cloneNode(true);
    const adminUI = clone.querySelector('#admin-floating-toolbar');
    if (adminUI) adminUI.remove();
    
    // Clean admin classes
    clone.querySelectorAll('.admin-hover-target, .admin-editing').forEach(el => {
      el.classList.remove('admin-hover-target', 'admin-editing');
      el.removeAttribute('contenteditable');
    });

    const state = clone.innerHTML;
    
    if (historyIndex < historyStack.length - 1) {
      historyStack = historyStack.slice(0, historyIndex + 1);
    }
    historyStack.push(state);
    historyIndex++;
    
    window.parent.postMessage({
      type: 'HISTORY_UPDATE',
      canUndo: historyIndex > 0,
      canRedo: historyIndex < historyStack.length - 1
    }, '*');
  };

  setTimeout(saveState, 500);

  window.addEventListener('message', (event) => {
    if (event.data.type === 'UNDO' && historyIndex > 0) {
      historyIndex--;
      restoreState(historyStack[historyIndex]);
    } else if (event.data.type === 'REDO' && historyIndex < historyStack.length - 1) {
      historyIndex++;
      restoreState(historyStack[historyIndex]);
    } else if (event.data.type === 'REQUEST_SAVE') {
      const clone = document.body.cloneNode(true);
      const adminUI = clone.querySelector('#admin-floating-toolbar');
      if (adminUI) adminUI.remove();
      
      // Clean modal if open
      const editModal = clone.querySelector('.admin-edit-modal');
      if (editModal) editModal.remove();

      clone.querySelectorAll('.admin-hover-target, .admin-editing').forEach(el => {
        el.classList.remove('admin-hover-target', 'admin-editing');
        el.removeAttribute('contenteditable');
        // Clean dynamic inline style outlines
        if (el.style.outline && el.style.outline.includes('dashed')) {
          el.style.outline = '';
        }
      });
      
      const pageName = window.location.pathname.split('/').pop() || 'index.html';
      window.parent.postMessage({ type: 'SAVE_CONTENT', content: clone.innerHTML, page: pageName }, '*');
    } else if (event.data.type === 'MEDIA_SELECTED' && event.data.url) {
      const url = event.data.url;
      const isVideo = url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm') || url.toLowerCase().endsWith('.mov') || url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
      
      if (currentTarget) {
        if (isVideo) {
          const newVideo = document.createElement('video');
          newVideo.autoplay = true;
          newVideo.loop = true;
          newVideo.muted = true;
          newVideo.setAttribute('autoplay', '');
          newVideo.setAttribute('loop', '');
          newVideo.setAttribute('muted', '');
          newVideo.setAttribute('playsinline', '');
          newVideo.style.display = 'block';
          if (currentTarget && currentTarget.className) {
            newVideo.className = currentTarget.className;
          }
          if (currentTarget && currentTarget.id) {
            newVideo.id = currentTarget.id;
          }
          newVideo.src = url;
          currentTarget.replaceWith(newVideo);
          currentTarget = newVideo;
          currentTarget.load();
          let playPromise = currentTarget.play();
          if (playPromise !== undefined) {
            playPromise.catch(e => console.log('Autoplay prevented:', e));
          }
        } else {
          const newImg = document.createElement('img');
          newImg.loading = 'lazy';
          newImg.src = url;
          currentTarget.replaceWith(newImg);
          currentTarget = newImg;
        }
        saveState();
      }
    }
  });

  const restoreState = (htmlString) => {
    document.body.innerHTML = htmlString;
    attachAdminUI();
  };

  const attachAdminUI = () => {
    const existingToolbar = document.getElementById('admin-floating-toolbar');
    if (existingToolbar) existingToolbar.remove();

    if (!document.getElementById('admin-styles')) {
      const style = document.createElement('style');
      style.id = 'admin-styles';
      style.innerHTML = `
        .admin-editing {
          outline: 2px solid #9333ea !important;
          background-color: rgba(147, 51, 234, 0.1) !important;
          cursor: pointer;
        }
        #admin-floating-toolbar {
          position: fixed;
          background: #111;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 4px;
          display: none;
          gap: 4px;
          z-index: 100000;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          font-family: 'Inter', sans-serif;
        }
        .admin-tb-btn {
          background: #222;
          color: #eee;
          border: none;
          padding: 6px 10px;
          font-size: 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.1s;
        }
        .admin-tb-btn:hover { background: #9333ea; color: white; }
        .admin-tb-btn.danger:hover { background: #ef4444; }

        /* Modal Styles */
        .admin-edit-modal {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000000;
          display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);
          font-family: 'Inter', sans-serif; color: #fff;
        }
        .admin-modal-content {
          background: #111; border: 1px solid #333; border-radius: 12px;
          width: 90%; max-width: 500px; padding: 24px; display: flex; flex-direction: column; gap: 16px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }
        .admin-modal-header {
          font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 800;
          border-bottom: 1px solid #222; padding-bottom: 12px; margin-bottom: 8px;
        }
        .admin-modal-field {
          display: flex; flex-direction: column; gap: 6px;
        }
        .admin-modal-field label {
          display: block; font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .admin-modal-input, .admin-modal-select, .admin-modal-textarea {
          background: #000; border: 1px solid #333; border-radius: 6px; padding: 10px 12px;
          color: #fff; font-size: 13px; font-family: inherit; width: 100%; box-sizing: border-box;
        }
        .admin-modal-input:focus, .admin-modal-select:focus, .admin-modal-textarea:focus {
          border-color: #9333ea; outline: none;
        }
        .admin-modal-checkboxes {
          display: flex; gap: 16px; flex-wrap: wrap; margin-top: 4px;
        }
        .admin-modal-checkbox {
          display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer;
        }
        .admin-modal-checkbox input {
          margin: 0; cursor: pointer; width: 16px; height: 16px; accent-color: #9333ea;
        }
        .admin-modal-buttons {
          display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px;
        }
        .admin-btn {
          padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none;
        }
        .admin-btn-save { background: #9333ea; color: #fff; }
        .admin-btn-cancel { background: #222; color: #ccc; border: 1px solid #333; }
        .admin-btn-upload { background: #333; color: #eee; border: 1px solid #444; font-size: 12px; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-top: 4px; display: inline-block; width: fit-content; }
        .admin-btn-upload:hover { background: #444; }
      `;
      document.head.appendChild(style);
    }

    const toolbar = document.createElement('div');
    toolbar.id = 'admin-floating-toolbar';
    document.body.appendChild(toolbar);

    currentTarget = null;
    let initialTextContent = '';
    let hideTimeout;

    const showToolbar = (target) => {
      clearTimeout(hideTimeout);
      currentTarget = target;
      
      const isProjectCard = target.classList.contains('p-card');
      const isServiceCard = target.classList.contains('svc-card');
      const isMedia = !isProjectCard && !isServiceCard && (target.tagName === 'IMG' || target.tagName === 'VIDEO' || target.classList.contains('phone-overlay') || target.classList.contains('testi-progress') || target.classList.contains('phone-card'));
      const isText = !isProjectCard && !isServiceCard && !isMedia;

      let html = '';
      if (isProjectCard) {
        html += `<button class="admin-tb-btn" id="tb-edit-project">⚙ Edit Project</button>`;
        html += `<button class="admin-tb-btn" id="tb-duplicate">➕ Duplicate</button>`;
      } else if (isServiceCard) {
        html += `<button class="admin-tb-btn" id="tb-edit-service">⚙ Edit Service</button>`;
        html += `<button class="admin-tb-btn" id="tb-duplicate">➕ Duplicate</button>`;
      } else {
        if (isText) {
          html += `<button class="admin-tb-btn" id="tb-edit-text">✎ Edit Text</button>`;
          html += `<button class="admin-tb-btn" id="tb-color">🎨 Color</button>`;
          html += `<button class="admin-tb-btn" id="tb-font">Aa Font</button>`;
        }
        if (isMedia) {
          html += `<button class="admin-tb-btn" id="tb-replace">🔄 Replace Media</button>`;
        }
      }
      html += `<button class="admin-tb-btn danger" id="tb-delete">🗑 Delete</button>`;
      
      toolbar.innerHTML = html;
      
      const rect = target.getBoundingClientRect();
      toolbar.style.left = `${Math.max(0, rect.left)}px`;
      toolbar.style.top = `${Math.max(0, rect.top - 36)}px`;
      toolbar.style.display = 'flex';

      if (isProjectCard) {
        document.getElementById('tb-edit-project').onclick = (e) => { e.stopPropagation(); openProjectModal(target); };
        document.getElementById('tb-duplicate').onclick = (e) => { e.stopPropagation(); duplicateCard(target); };
      } else if (isServiceCard) {
        document.getElementById('tb-edit-service').onclick = (e) => { e.stopPropagation(); openServiceModal(target); };
        document.getElementById('tb-duplicate').onclick = (e) => { e.stopPropagation(); duplicateCard(target); };
      } else {
        if (isText) {
          document.getElementById('tb-edit-text').onclick = (e) => { e.stopPropagation(); handleEditText(); };
          document.getElementById('tb-color').onclick = (e) => { e.stopPropagation(); handleChangeColor(); };
          document.getElementById('tb-font').onclick = (e) => { e.stopPropagation(); handleChangeFont(); };
        }
        if (isMedia) {
          document.getElementById('tb-replace').onclick = (e) => { e.stopPropagation(); handleReplaceMedia(); };
        }
      }
      document.getElementById('tb-delete').onclick = (e) => { e.stopPropagation(); handleDelete(); };
    };

    const hideToolbar = () => {
      toolbar.style.display = 'none';
      if (currentTarget && currentTarget.contentEditable === "true") {
        currentTarget.contentEditable = "false";
        currentTarget.classList.remove('admin-editing');
        if (currentTarget.innerText !== initialTextContent) saveState();
      }
      document.querySelectorAll('.admin-editing').forEach(el => el.classList.remove('admin-editing'));
    };

    // EVENT DELEGATION FOR DOUBLE CLICK
    const targetSelector = 'h1, h2, h3, h4, p, span, a, button, img, video, label, li, .phone-overlay, .testi-progress, .phone-card, .filter-label, .svc-card, .p-card';

    document.addEventListener('dblclick', (e) => {
      if (e.target.closest('#admin-floating-toolbar')) return;

      const pCard = e.target.closest('.p-card');
      const svcCard = e.target.closest('.svc-card');
      
      let target = null;
      if (pCard) {
        target = pCard;
      } else if (svcCard) {
        target = svcCard;
      } else {
        target = e.target.closest(targetSelector);
      }
      
      // Ignore things inside navbar
      if (target && !target.closest('.navbar')) {
        e.preventDefault();
        e.stopPropagation();
        
        document.querySelectorAll('.admin-editing').forEach(el => el.classList.remove('admin-editing'));
        target.classList.add('admin-editing');
        showToolbar(target);
      }
    }, true);

    // Intercept clicks on links to preserve ?admin=true parameter inside iframe
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href) {
        try {
          const url = new URL(link.href);
          if (url.host === window.location.host) {
            if (url.pathname === window.location.pathname) {
              return;
            }
            e.preventDefault();
            url.searchParams.set('admin', 'true');
            window.location.href = url.toString();
          }
        } catch(err) {
          // ignore
        }
      }
    });

    // Hide toolbar when clicking anywhere else
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#admin-floating-toolbar') && !e.target.closest('.admin-editing')) {
        hideToolbar();
      }
    });


    const handleEditText = () => {
      toolbar.style.display = 'none';
      initialTextContent = currentTarget.innerText;
      currentTarget.contentEditable = "true";
      currentTarget.focus();
    };

    const handleChangeColor = () => {
      toolbar.style.display = 'none';
      const color = prompt("Enter a CSS color (e.g. #ff0000, red, #00aeff):");
      if (color) {
        currentTarget.style.color = color;
        saveState();
      }
    };

    const handleChangeFont = () => {
      toolbar.style.display = 'none';
      const font = prompt("Enter a Font Family (e.g. 'Inter', 'Outfit', sans-serif):");
      if (font) {
        currentTarget.style.fontFamily = font;
        saveState();
      }
    };

    const handleReplaceMedia = () => {
      toolbar.style.display = 'none';
      // Send message to parent admin panel to open Media Library
      window.parent.postMessage({ type: 'REQUEST_MEDIA' }, '*');
    };

    const handleDelete = () => {
      toolbar.style.display = 'none';
      currentTarget.remove();
      saveState();
    };

    const duplicateCard = (card) => {
      toolbar.style.display = 'none';
      const clone = card.cloneNode(true);
      clone.classList.remove('admin-editing');
      clone.style.outline = '';
      card.parentNode.insertBefore(clone, card.nextSibling);
      saveState();
      
      if (card.classList.contains('p-card')) {
        openProjectModal(clone);
      } else if (card.classList.contains('svc-card')) {
        openServiceModal(clone);
      }
    };

    const openProjectModal = (card) => {
      toolbar.style.display = 'none';
      
      const service = card.dataset.service || 'short-form';
      const niche = card.dataset.niche || 'finance';
      const style = card.dataset.style || 'cinematic';
      const platforms = card.dataset.platforms ? card.dataset.platforms.split(',') : [];
      const mediaEl = card.querySelector('img, video');
      const mediaUrl = mediaEl ? mediaEl.src : '';
      const author = card.querySelector('.p-name') ? card.querySelector('.p-name').textContent.replace('✓', '').trim() : '';
      const stats = card.querySelector('.p-tag span:last-child') ? card.querySelector('.p-tag span:last-child').textContent.trim() : '';
      const desc = card.querySelector('.p-desc') ? card.querySelector('.p-desc').textContent.trim() : '';

      const modal = document.createElement('div');
      modal.className = 'admin-edit-modal';
      modal.innerHTML = `
        <div class="admin-modal-content">
          <div class="admin-modal-header">Edit Project Card</div>
          
          <div class="admin-modal-field">
            <label>Image/Video URL</label>
            <input type="text" id="proj-media-url" class="admin-modal-input" value="${mediaUrl}">
            <button type="button" id="proj-upload-btn" class="admin-btn-upload">Upload Media</button>
          </div>
          
          <div class="admin-modal-field">
            <label>Author / Creator Name</label>
            <input type="text" id="proj-author" class="admin-modal-input" value="${author}">
          </div>

          <div class="admin-modal-field">
            <label>Badge Stats (e.g. 1M+ Views, 250K Subs)</label>
            <input type="text" id="proj-stats" class="admin-modal-input" value="${stats}">
          </div>

          <div class="admin-modal-field">
            <label>Project Description</label>
            <textarea id="proj-desc" class="admin-modal-textarea" rows="3">${desc}</textarea>
          </div>

          <div class="admin-modal-field">
            <label>Service Type</label>
            <select id="proj-service" class="admin-modal-select">
              <option value="short-form" ${service === 'short-form' ? 'selected' : ''}>Short-Form Editing</option>
              <option value="motion" ${service === 'motion' ? 'selected' : ''}>Motion Graphics</option>
              <option value="scripting" ${service === 'scripting' ? 'selected' : ''}>Scripting</option>
            </select>
          </div>

          <div class="admin-modal-field">
            <label>Niche</label>
            <select id="proj-niche" class="admin-modal-select">
              <option value="finance" ${niche === 'finance' ? 'selected' : ''}>Finance</option>
              <option value="fitness" ${niche === 'fitness' ? 'selected' : ''}>Fitness</option>
              <option value="lifestyle" ${niche === 'lifestyle' ? 'selected' : ''}>Lifestyle</option>
              <option value="education" ${niche === 'education' ? 'selected' : ''}>Education</option>
              <option value="art" ${niche === 'art' ? 'selected' : ''}>Art & Creative</option>
              <option value="brand" ${niche === 'brand' ? 'selected' : ''}>Brand</option>
            </select>
          </div>

          <div class="admin-modal-field">
            <label>Editing Style</label>
            <select id="proj-style" class="admin-modal-select">
              <option value="cinematic" ${style === 'cinematic' ? 'selected' : ''}>Cinematic</option>
              <option value="fast-cut" ${style === 'fast-cut' ? 'selected' : ''}>Fast Cut</option>
              <option value="vlog" ${style === 'vlog' ? 'selected' : ''}>Vlog</option>
              <option value="documentary" ${style === 'documentary' ? 'selected' : ''}>Documentary</option>
            </select>
          </div>

          <div class="admin-modal-field">
            <label>Platforms</label>
            <div class="admin-modal-checkboxes">
              <label class="admin-modal-checkbox"><input type="checkbox" value="youtube" class="proj-platform" ${platforms.includes('youtube') ? 'checked' : ''}> YouTube</label>
              <label class="admin-modal-checkbox"><input type="checkbox" value="tiktok" class="proj-platform" ${platforms.includes('tiktok') ? 'checked' : ''}> TikTok</label>
              <label class="admin-modal-checkbox"><input type="checkbox" value="instagram" class="proj-platform" ${platforms.includes('instagram') ? 'checked' : ''}> Instagram</label>
            </div>
          </div>

          <div class="admin-modal-buttons">
            <button type="button" id="proj-cancel" class="admin-btn admin-btn-cancel">Cancel</button>
            <button type="button" id="proj-save" class="admin-btn admin-btn-save">Save Changes</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const uploadBtn = document.getElementById('proj-upload-btn');
      uploadBtn.onclick = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*,video/*';
        fileInput.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          uploadBtn.textContent = 'Uploading...';
          try {
            var supabaseUrl = 'https://sdvcpkexawlihomyhkkp.supabase.co';
            var supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdmNwa2V4YXdsaWhvbXloa2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzk2ODAsImV4cCI6MjA5OTYxNTY4MH0.g02cUmn305wiUZ4aNfKr43SaeveI1FcmPwTmBia5dh4';
            var sb = window.supabase.createClient(supabaseUrl, supabaseKey);
            
            var ext = file.name.split('.').pop();
            var fileName = Math.random().toString(36).substring(2, 15) + '_' + Date.now() + '.' + ext;
            
            var uploadResult = await sb.storage.from('media').upload(fileName, file);
            if (uploadResult.error) throw uploadResult.error;
            
            var urlResult = sb.storage.from('media').getPublicUrl(fileName);
            document.getElementById('proj-media-url').value = urlResult.data.publicUrl;
            uploadBtn.textContent = 'Uploaded ✓';
          } catch (err) {
            alert('Upload failed: ' + err.message);
            uploadBtn.textContent = 'Upload Media';
          }
        };
        fileInput.click();
      };

      document.getElementById('proj-cancel').onclick = () => modal.remove();

      document.getElementById('proj-save').onclick = () => {
        const newMediaUrl = document.getElementById('proj-media-url').value;
        const newAuthor = document.getElementById('proj-author').value;
        const newStats = document.getElementById('proj-stats').value;
        const newDesc = document.getElementById('proj-desc').value;
        const newService = document.getElementById('proj-service').value;
        const newNiche = document.getElementById('proj-niche').value;
        const newStyle = document.getElementById('proj-style').value;
        
        const checkedPlatforms = [];
        document.querySelectorAll('.proj-platform:checked').forEach(cb => {
          checkedPlatforms.push(cb.value);
        });

        card.dataset.service = newService;
        card.dataset.niche = newNiche;
        card.dataset.style = newStyle;
        card.dataset.platforms = checkedPlatforms.join(',');

        let currentMediaEl = card.querySelector('img, video');
        const isVideo = newMediaUrl.toLowerCase().endsWith('.mp4') || newMediaUrl.toLowerCase().endsWith('.webm') || newMediaUrl.includes('video') || newMediaUrl.includes('.webm') || newMediaUrl.includes('.mov');
        if (isVideo) {
          if (!currentMediaEl || currentMediaEl.tagName !== 'VIDEO') {
            const newVideo = document.createElement('video');
            newVideo.autoplay = true;
            newVideo.loop = true;
            newVideo.muted = true;
            newVideo.setAttribute('autoplay', '');
            newVideo.setAttribute('loop', '');
            newVideo.setAttribute('muted', '');
            newVideo.setAttribute('playsinline', '');
            if (currentMediaEl) {
              if (currentMediaEl.className) newVideo.className = currentMediaEl.className;
              if (currentMediaEl.id) newVideo.id = currentMediaEl.id;
              currentMediaEl.replaceWith(newVideo);
            }
            currentMediaEl = newVideo;
          }
          currentMediaEl.src = newMediaUrl;
          currentMediaEl.load();
        } else {
          if (!currentMediaEl || currentMediaEl.tagName !== 'IMG') {
            const newImg = document.createElement('img');
            newImg.loading = 'lazy';
            if (currentMediaEl) currentMediaEl.replaceWith(newImg);
            currentMediaEl = newImg;
          }
          currentMediaEl.src = newMediaUrl;
        }

        let tagHtml = '';
        checkedPlatforms.forEach(p => {
          let color = '#fff';
          let label = p;
          if (p === 'youtube') { color = '#ff0000'; label = 'YouTube'; }
          else if (p === 'tiktok') { color = '#ff2d55'; label = 'TikTok'; }
          else if (p === 'instagram') { color = '#c13584'; label = 'Instagram'; }
          tagHtml += `<span class="p-badge"><span class="p-badge-dot" style="background:${color}"></span>${label}</span>`;
        });
        if (newStats) {
          tagHtml += `<span class="p-badge"><span class="p-badge-dot" style="background:#ffa200"></span>${newStats}</span>`;
        }
        const tagEl = card.querySelector('.p-tag');
        if (tagEl) tagEl.innerHTML = tagHtml;

        const nameEl = card.querySelector('.p-name');
        if (nameEl) nameEl.innerHTML = `${newAuthor} <div class="p-chk">✓</div>`;

        const avEl = card.querySelector('.p-av, .p-av-txt');
        if (avEl) {
          const initial = newAuthor ? newAuthor.charAt(0).toUpperCase() : 'P';
          const colors = [
            'linear-gradient(135deg,#ff2d55,#ff8c69)',
            'linear-gradient(135deg,#00aeff,#7932ec)',
            'linear-gradient(135deg,#ffa200,#ff2d55)',
            'linear-gradient(135deg,#7932ec,#23005c)',
            'linear-gradient(135deg,#05a112,#00aeff)'
          ];
          const colorIdx = initial.charCodeAt(0) % colors.length;
          const newAv = document.createElement('div');
          newAv.className = 'p-av-txt';
          newAv.style.background = colors[colorIdx];
          newAv.textContent = initial;
          avEl.replaceWith(newAv);
        }

        const descEl = card.querySelector('.p-desc');
        if (descEl) descEl.textContent = newDesc;

        modal.remove();
        saveState();
        
        if (typeof window.initProjectsPage === 'function') {
          window.initProjectsPage();
        }
      };
    };

    const openServiceModal = (card) => {
      toolbar.style.display = 'none';

      const title = card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : '';
      const desc = card.querySelector('p') ? card.querySelector('p').textContent.trim() : '';
      const bullets = Array.from(card.querySelectorAll('.svc-bullets li')).map(li => li.textContent.trim());

      const modal = document.createElement('div');
      modal.className = 'admin-edit-modal';
      modal.innerHTML = `
        <div class="admin-modal-content">
          <div class="admin-modal-header">Edit Service Card</div>
          
          <div class="admin-modal-field">
            <label>Service Title</label>
            <input type="text" id="svc-title" class="admin-modal-input" value="${title}">
          </div>

          <div class="admin-modal-field">
            <label>Service Description</label>
            <textarea id="svc-desc" class="admin-modal-textarea" rows="3">${desc}</textarea>
          </div>

          <div class="admin-modal-field">
            <label>Bullet Point 1</label>
            <input type="text" id="svc-bullet-0" class="admin-modal-input" value="${bullets[0] || ''}">
          </div>

          <div class="admin-modal-field">
            <label>Bullet Point 2</label>
            <input type="text" id="svc-bullet-1" class="admin-modal-input" value="${bullets[1] || ''}">
          </div>

          <div class="admin-modal-field">
            <label>Bullet Point 3</label>
            <input type="text" id="svc-bullet-2" class="admin-modal-input" value="${bullets[2] || ''}">
          </div>

          <div class="admin-modal-buttons">
            <button type="button" id="svc-cancel" class="admin-btn admin-btn-cancel">Cancel</button>
            <button type="button" id="svc-save" class="admin-btn admin-btn-save">Save Changes</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById('svc-cancel').onclick = () => modal.remove();

      document.getElementById('svc-save').onclick = () => {
        const newTitle = document.getElementById('svc-title').value;
        const newDesc = document.getElementById('svc-desc').value;
        const b0 = document.getElementById('svc-bullet-0').value;
        const b1 = document.getElementById('svc-bullet-1').value;
        const b2 = document.getElementById('svc-bullet-2').value;

        const h3 = card.querySelector('h3');
        if (h3) h3.textContent = newTitle;

        const p = card.querySelector('p');
        if (p) p.textContent = newDesc;

        const bulletList = card.querySelector('.svc-bullets');
        if (bulletList) {
          bulletList.innerHTML = `
            <li>${b0}</li>
            <li>${b1}</li>
            <li>${b2}</li>
          `;
        }

        modal.remove();
        saveState();
      };
    };
  };

  // Ensure DOM is fully ready before attaching UI
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachAdminUI);
  } else {
    attachAdminUI();
  }
}
})();

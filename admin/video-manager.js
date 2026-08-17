(function() {
  // Simple UUID polyfill if crypto.randomUUID is not available
  function uuidv4() {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, function(c) {
      return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
    });
  }

  // Generate a structural path string relative to a given root node
  function getRelativePath(videoNode, rootNode) {
    var path = [];
    var current = videoNode;
    while (current && current !== rootNode && current !== document.body) {
      var identifier = current.getAttribute('data-framer-name') || current.className || current.tagName;
      // Strip out volatile ssr-variant or hidden classes to ensure path matches across breakpoints
      if (typeof identifier === 'string') {
        identifier = identifier.replace(/hidden-[a-zA-Z0-9_-]+/g, '').replace(/ssr-variant/g, '').trim();
      }
      path.push(identifier);
      current = current.parentElement;
    }
    return path.join(' < ');
  }

  var VideoManager = {
    videos: [],

    scanVideos: function() {
      this.videos = [];
      var videoElements = document.querySelectorAll('video');
      
      videoElements.forEach(function(vid) {
        // 1. Assign permanent ID if missing
        var id = vid.getAttribute('data-ve-video-id');
        if (!id) {
          id = 'vid-' + uuidv4();
          vid.setAttribute('data-ve-video-id', id);
        }

        // 2. Identify Logical Component Container (the parent of desktop/tablet/mobile layer)
        var current = vid;
        var logicalContainer = null;
        var variantName = 'default';
        var friendlyName = 'Video';

        while (current && current !== document.body) {
          var framerName = current.getAttribute('data-framer-name');
          if (framerName) {
            var lowerName = framerName.toLowerCase();
            if (lowerName === 'desktop' || lowerName === 'tablet' || lowerName === 'mobile') {
              variantName = lowerName;
              logicalContainer = current.parentElement;
              // Grab a friendly name from the container if possible
              if (logicalContainer && logicalContainer.getAttribute('data-framer-name')) {
                friendlyName = logicalContainer.getAttribute('data-framer-name');
              } else if (logicalContainer && logicalContainer.parentElement && logicalContainer.parentElement.getAttribute('data-framer-name')) {
                friendlyName = logicalContainer.parentElement.getAttribute('data-framer-name');
              }
              break;
            } else if (friendlyName === 'Video') {
              friendlyName = framerName; // Fallback friendly name if no breakpoint found yet
            }
          }
          current = current.parentElement;
        }

        if (!logicalContainer) {
          logicalContainer = vid; // No responsive wrappers found, it is its own container
        }

        // The structural identity is the physical container DOM node + the relative path down to the video
        var relativePath = getRelativePath(vid, logicalContainer);
        
        this.videos.push({
          id: id,
          element: vid,
          containerNode: logicalContainer,
          relativePath: relativePath,
          variant: variantName,
          friendlyName: friendlyName,
          src: vid.getAttribute('src') || (vid.querySelector('source') ? vid.querySelector('source').getAttribute('src') : '')
        });
      }.bind(this));

      console.log('[VideoManager] Scanned ' + this.videos.length + ' videos.');
      return this.videos;
    },

    getVideoById: function(id) {
      // Always rescan to ensure we have fresh DOM elements, but IDs stay stable
      this.scanVideos();
      return this.videos.filter(function(v) { return v.id === id; })[0] || null;
    },

    getResponsiveVariants: function(videoObj) {
      // Find all videos that share the exact same physical logical container AND relative internal path
      return this.videos.filter(function(v) {
        return v.containerNode === videoObj.containerNode && v.relativePath === videoObj.relativePath;
      });
    },

    replaceSelected: function(id, newUrl) {
      var selected = this.getVideoById(id);
      if (!selected) {
        console.error('[VideoManager] Video ID ' + id + ' not found.');
        return { success: false, error: 'Video not found' };
      }

      var variants = this.getResponsiveVariants(selected);
      var replacedCount = 0;
      var replacedVariants = [];

      variants.forEach(function(v) {
        var el = v.element;
        if (!el || !document.body.contains(el)) return;

        // Apply URL to <video src>
        if (el.hasAttribute('src')) {
          el.setAttribute('src', newUrl);
        }
        // Apply URL to <source>
        var source = el.querySelector('source');
        if (source) {
          source.setAttribute('src', newUrl);
        }
        
        // If neither existed, set it on video
        if (!el.hasAttribute('src') && !source) {
          el.setAttribute('src', newUrl);
        }

        el.load();
        el.play().catch(function(){});
        
        replacedCount++;
        replacedVariants.push(v.variant);
      });

      return {
        success: true,
        replacedCount: replacedCount,
        variants: replacedVariants,
        friendlyName: selected.friendlyName
      };
    },

    validateBlobUrls: function() {
      this.scanVideos();
      var hasBlobs = false;
      this.videos.forEach(function(v) {
        if (v.src && v.src.indexOf('blob:') !== -1) hasBlobs = true;
        var poster = v.element.getAttribute('poster');
        if (poster && poster.indexOf('blob:') !== -1) hasBlobs = true;
      });
      return hasBlobs;
    }
  };

  window.VideoManager = VideoManager;
  
  // Initial scan on load
  if (document.readyState === 'complete') {
    window.VideoManager.scanVideos();
  } else {
    window.addEventListener('load', function() { window.VideoManager.scanVideos(); });
  }
})();

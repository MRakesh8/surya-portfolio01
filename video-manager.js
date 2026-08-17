(function() {
  function sanitize(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  var EXCLUDED_NAMES = [
    'desktop', 'tablet', 'mobile', 
    'mobile edited', 'mobile raw', 
    'edited', 'raw', 
    'default', 'primary', 'variant 2', 'variant 1'
  ];

  function getLogicalPath(node, rootNode) {
    var path = [];
    var current = node;
    while (current && current !== rootNode && current !== document.body) {
      var framerName = current.getAttribute('data-framer-name');
      if (framerName) {
        var lowerName = framerName.toLowerCase().trim();
        if (EXCLUDED_NAMES.indexOf(lowerName) === -1) {
          path.push(framerName);
        }
      }
      current = current.parentElement;
    }
    return path.reverse().join(' > ');
  }

  var VideoManager = {
    videos: [],

    scanVideos: function() {
      this.videos = [];
      var videoElements = document.querySelectorAll('video');
      var variantIndexCounters = {};
      var collisionMap = {};
      
      videoElements.forEach(function(vid) {
        var current = vid;
        var logicalContainer = null;
        var variantWrapper = null;
        var variantName = 'default';

        while (current && current !== document.body) {
          var framerName = current.getAttribute('data-framer-name');
          if (framerName) {
            var lowerName = framerName.toLowerCase();
            if (lowerName === 'desktop' || lowerName === 'tablet' || lowerName === 'mobile') {
              variantName = lowerName;
              variantWrapper = current;
              logicalContainer = current.parentElement;
              break;
            }
          }
          current = current.parentElement;
        }

        if (!logicalContainer) {
          logicalContainer = vid;
          variantWrapper = vid;
        }

        var logicalPath = getLogicalPath(vid, logicalContainer);
        var containerPath = getLogicalPath(logicalContainer, document.body);
        var baseIdentity = containerPath + '|' + logicalPath;

        // Track index within this specific variant wrapper for this specific base identity
        var indexKey = variantName + '|' + baseIdentity;
        if (variantIndexCounters[indexKey] === undefined) {
          variantIndexCounters[indexKey] = 0;
        } else {
          variantIndexCounters[indexKey]++;
        }
        var index = variantIndexCounters[indexKey];

        var logicalVideoId = 'v_' + sanitize(containerPath) + '_' + sanitize(logicalPath) + '_' + index;
        vid.setAttribute('data-ve-video-id', logicalVideoId);

        // Collision safety check
        var collisionKey = variantName + '|' + logicalVideoId;
        if (collisionMap[collisionKey]) {
          console.error("LOGICAL VIDEO ID COLLISION", {
            logicalVideoId: logicalVideoId,
            firstVideo: collisionMap[collisionKey].element,
            secondVideo: vid,
            containerPath: containerPath,
            logicalPath: logicalPath,
            index: index
          });
        }

        var videoObj = {
          logicalVideoId: logicalVideoId,
          element: vid,
          variantName: variantName,
          friendlyName: logicalPath || containerPath.split(' > ').pop() || 'Video',
          containerPath: containerPath,
          logicalPath: logicalPath,
          index: index,
          src: vid.getAttribute('src') || (vid.querySelector('source') ? vid.querySelector('source').getAttribute('src') : '')
        };

        collisionMap[collisionKey] = videoObj;
        this.videos.push(videoObj);
      }.bind(this));

      console.log('[VideoManager] Scanned ' + this.videos.length + ' deterministic videos.');
      return this.videos;
    },

    getVideoById: function(id) {
      this.scanVideos();
      for (var i = 0; i < this.videos.length; i++) {
        if (this.videos[i].logicalVideoId === id) {
          return this.videos[i];
        }
      }
      return null;
    },

    getResponsiveVariants: function(logicalVideoId) {
      var variants = [];
      for (var i = 0; i < this.videos.length; i++) {
        if (this.videos[i].logicalVideoId === logicalVideoId) {
          variants.push(this.videos[i]);
        }
      }
      return variants;
    },

    replaceSelected: function(id, newUrl) {
      var selected = this.getVideoById(id);
      if (!selected) {
        console.error('[VideoManager] Video ID ' + id + ' not found.');
        return { success: false, error: 'Video not found' };
      }

      var variants = this.getResponsiveVariants(id);
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
        replacedVariants.push(v.variantName);
      });

      return {
        success: true,
        replacedCount: replacedCount,
        variants: replacedVariants,
        friendlyName: selected.friendlyName,
        logicalVideoId: id
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

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

        var indexKey = variantName + '|' + baseIdentity;
        if (variantIndexCounters[indexKey] === undefined) {
          variantIndexCounters[indexKey] = 0;
        } else {
          variantIndexCounters[indexKey]++;
        }
        var index = variantIndexCounters[indexKey];

        // 1. Prioritize permanent Video ID if it exists in the DOM
        var logicalVideoId = vid.getAttribute('data-video-id');
        var isUnassigned = !logicalVideoId;
        
        // 2. Tracking ID for unassigned videos (so we can assign them later)
        var trackingId = logicalVideoId || ('temp_' + sanitize(containerPath) + '_' + sanitize(logicalPath) + '_' + index);
        
        if (logicalVideoId) {
          vid.setAttribute('data-ve-video-id', logicalVideoId);
        }

        // Collision safety check
        var collisionKey = variantName + '|' + trackingId;
        if (collisionMap[collisionKey]) {
          console.error("VIDEO TRACKING ID COLLISION", {
            trackingId: trackingId,
            firstVideo: collisionMap[collisionKey].element,
            secondVideo: vid
          });
        }

        var videoObj = {
          logicalVideoId: logicalVideoId,
          trackingId: trackingId,
          isUnassigned: isUnassigned,
          element: vid,
          variantName: variantName,
          friendlyName: (logicalVideoId || 'Unassigned Video') + ' (' + (logicalPath || containerPath.split(' > ').pop() || 'Video') + ')',
          containerPath: containerPath,
          logicalPath: logicalPath,
          index: index,
          src: vid.getAttribute('src') || (vid.querySelector('source') ? vid.querySelector('source').getAttribute('src') : '')
        };

        collisionMap[collisionKey] = videoObj;
        this.videos.push(videoObj);
      }.bind(this));

      console.log('[VideoManager] Scanned ' + this.videos.length + ' physical videos.');
      return this.videos;
    },

    getGroupedVideos: function() {
      this.scanVideos();
      var groups = {};
      this.videos.forEach(function(v) {
        var key = v.logicalVideoId || v.trackingId;
        if (!groups[key]) {
          groups[key] = {
            id: v.logicalVideoId,
            trackingId: v.trackingId,
            isUnassigned: v.isUnassigned,
            friendlyName: v.friendlyName.split(' (')[1].replace(')', '') || 'Video',
            src: v.src,
            variants: []
          };
        }
        if (groups[key].variants.indexOf(v.variantName) === -1) {
          groups[key].variants.push(v.variantName);
        }
      });
      var list = [];
      for (var k in groups) {
        list.push(groups[k]);
      }
      return list;
    },

    assignVideoId: function(trackingId, newId) {
      this.scanVideos();
      var assignedCount = 0;
      this.videos.forEach(function(v) {
        if (v.trackingId === trackingId && v.isUnassigned) {
          v.element.setAttribute('data-video-id', newId);
          v.element.setAttribute('data-ve-video-id', newId);
          assignedCount++;
        }
      });
      return assignedCount > 0;
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

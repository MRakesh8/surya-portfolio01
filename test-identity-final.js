const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

function sanitize(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

const EXCLUDED_NAMES = [
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
      if (!EXCLUDED_NAMES.includes(lowerName)) {
        path.push(framerName);
      }
    }
    current = current.parentElement;
  }
  return path.reverse().join(' > ');
}

function scanVideos() {
  var videos = [];
  var videoElements = document.querySelectorAll('video');
  var variantIndexCounters = {};
  
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

    // Combine for final logicalVideoId
    // We use a short hash to keep the DOM attribute clean
    var logicalVideoId = 'v_' + sanitize(containerPath) + '_' + sanitize(logicalPath) + '_' + index;

    videos.push({
      logicalVideoId: logicalVideoId,
      variantName: variantName,
      friendlyName: logicalPath || containerPath.split(' > ').pop(),
      containerPath: containerPath,
      logicalPath: logicalPath,
      index: index,
      src: vid.getAttribute('src') || (vid.querySelector('source') ? vid.querySelector('source').getAttribute('src') : '')
    });
  });

  return videos;
}

const inventory = scanVideos();
console.log(JSON.stringify(inventory, null, 2));

// Check for collisions
const idMap = {};
inventory.forEach(v => {
  const key = v.variantName + '|' + v.logicalVideoId;
  if (idMap[key]) {
    console.error("COLLISION DETECTED for ID:", v.logicalVideoId, "in variant:", v.variantName);
  }
  idMap[key] = true;
});

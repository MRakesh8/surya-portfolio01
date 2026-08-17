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
  'default', 'primary', 'variant 2'
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

    videos.push({
      variantName: variantName,
      containerPath: containerPath,
      logicalPath: logicalPath,
      src: vid.getAttribute('src') || (vid.querySelector('source') ? vid.querySelector('source').getAttribute('src') : '')
    });
  });

  return videos;
}

const inventory = scanVideos();
console.log(JSON.stringify(inventory, null, 2));

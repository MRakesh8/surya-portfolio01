const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

function getRelativePath(node, rootNode) {
  var path = [];
  var current = node;
  while (current && current !== rootNode && current !== document.body) {
    var identifier = current.getAttribute('data-framer-name') || current.className || current.tagName;
    if (typeof identifier === 'string') {
      identifier = identifier.replace(/hidden-[a-zA-Z0-9_-]+/g, '').replace(/ssr-variant/g, '').trim();
    }
    path.push(identifier);
    current = current.parentElement;
  }
  return path.join(' < ');
}

function sanitize(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
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

    // ALL videos in this variant wrapper
    var allVideosInVariant = Array.from(variantWrapper.querySelectorAll('video'));
    var rawIndexInVariant = allVideosInVariant.indexOf(vid);

    // Compute container path
    var containerPath = getRelativePath(logicalContainer, document.body);

    var logicalVideoId = 'v_' + sanitize(containerPath) + '_' + rawIndexInVariant;

    videos.push({
      logicalVideoId: logicalVideoId,
      variantName: variantName,
      rawIndexInVariant: rawIndexInVariant,
      src: vid.getAttribute('src') || (vid.querySelector('source') ? vid.querySelector('source').getAttribute('src') : '')
    });
  });

  return videos;
}

const inventory = scanVideos();
console.log(JSON.stringify(inventory, null, 2));

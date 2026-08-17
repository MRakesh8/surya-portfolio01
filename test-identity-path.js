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

    var pathInsideVariant = getRelativePath(vid, variantWrapper);
    var containerPath = getRelativePath(logicalContainer, document.body);

    videos.push({
      variantName: variantName,
      pathInsideVariant: pathInsideVariant,
      src: vid.getAttribute('src') || (vid.querySelector('source') ? vid.querySelector('source').getAttribute('src') : '')
    });
  });

  return videos;
}

const inventory = scanVideos();
console.log(JSON.stringify(inventory, null, 2));

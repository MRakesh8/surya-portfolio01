const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('1. Navigating to visual editor...');
  await page.goto('http://127.0.0.1:5173/admin/');
  
  // Wait for the iframe to appear
  const iframeElement = await page.waitForSelector('iframe[title="Visual Builder"]');
  const frame = await iframeElement.contentFrame();
  await frame.waitForLoadState('networkidle');

  console.log('2. Waiting for VideoManager initialization...');
  await frame.waitForFunction(() => window.VideoManager && window.VideoManager.videos.length > 0);

  // Extract initial videos
  const initialVideos = await frame.evaluate(() => {
    return window.VideoManager.videos.map(v => ({
      id: v.logicalVideoId,
      variant: v.variantName,
      path: v.path || v.logicalPath || v.containerPath,
      src: v.src
    }));
  });

  const uniqueLogicals = [...new Set(initialVideos.map(v => v.id))];
  
  const idA = uniqueLogicals[0];
  const idB = uniqueLogicals[1];
  const idC = uniqueLogicals[2];

  const beforeA = initialVideos.filter(v => v.id === idA);
  const beforeB = initialVideos.filter(v => v.id === idB);
  const beforeC = initialVideos.filter(v => v.id === idC);

  console.log('\nBEFORE REPLACEMENT:');
  console.log(`Video A (${idA}):`, beforeA.map(v => `${v.variant}=${v.src.split('/').pop()}`));
  console.log(`Video B (${idB}):`, beforeB.map(v => `${v.variant}=${v.src.split('/').pop()}`));
  console.log(`Video C (${idC}):`, beforeC.map(v => `${v.variant}=${v.src.split('/').pop()}`));

  // Spatial Selection Test
  console.log('\n3. Performing Spatial Selection on Video B...');
  const targetVideo = beforeB.find(v => v.variant === 'desktop');
  
  const box = await frame.evaluate((targetId) => {
    const el = window.VideoManager.getVideoById(targetId).element;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  }, idB);

  // Intercept the postMessage to verify ELEMENT_INFO
  const elementInfoPromise = page.evaluate(() => {
    return new Promise(resolve => {
      const handler = (e) => {
        if (e.data && e.data.type === 'ELEMENT_INFO') {
          window.removeEventListener('message', handler);
          resolve(e.data);
        }
      };
      window.addEventListener('message', handler);
    });
  });

  await page.mouse.dblclick(box.x + box.width/2, box.y + box.height/2);
  
  const elementInfo = await elementInfoPromise;
  console.log('ELEMENT_INFO received by React:', elementInfo);
  
  if (elementInfo.logicalVideoId !== idB) {
    console.error(`❌ Spatial selection failed. Expected ${idB}, got ${elementInfo.logicalVideoId}`);
  } else {
    console.log(`✅ Spatial selection passed. logicalVideoId=${idB}`);
  }

  // Click "Replace Video" in the context menu
  console.log('\n4. Triggering Replace Video...');
  await page.click('button:has-text("Replace Video")');

  // Wait for Media Library Modal
  await page.waitForSelector('text=Replace Video / Media');

  // Paste a test video link
  const TEST_URL = 'https://domain.com/TEST_REPLACEMENT_123.mp4';
  await page.fill('input[placeholder*="https://www.youtube.com"]', TEST_URL);
  
  console.log('5. Clicking Use Video Link...');
  await page.click('button:has-text("Use Video Link")');

  // Wait for replacement toast
  await page.waitForSelector('text=replaced successfully');

  console.log('\n6. Re-evaluating DOM state after replacement...');
  
  const afterVideos = await frame.evaluate(() => {
    window.VideoManager.scanVideos();
    return window.VideoManager.videos.map(v => ({
      id: v.logicalVideoId,
      variant: v.variantName,
      src: v.src
    }));
  });

  const afterA = afterVideos.filter(v => v.id === idA);
  const afterB = afterVideos.filter(v => v.id === idB);
  const afterC = afterVideos.filter(v => v.id === idC);

  console.log('\nAFTER REPLACEMENT:');
  console.log(`Video A (${idA}):`, afterA.map(v => `${v.variant}=${v.src.split('/').pop()}`));
  console.log(`Video B (${idB}):`, afterB.map(v => `${v.variant}=${v.src.split('/').pop()}`));
  console.log(`Video C (${idC}):`, afterC.map(v => `${v.variant}=${v.src.split('/').pop()}`));

  let passed = true;
  afterA.forEach(v => { if (v.src !== beforeA[0].src) passed = false; });
  afterB.forEach(v => { if (v.src !== TEST_URL) passed = false; });
  afterC.forEach(v => { if (v.src !== beforeC[0].src) passed = false; });

  if (passed) {
    console.log('\n✅ TEST PASSED: Only target logical video and its responsive variants changed.');
  } else {
    console.error('\n❌ TEST FAILED: Unintended videos changed or variants missed.');
  }

  await browser.close();
})();

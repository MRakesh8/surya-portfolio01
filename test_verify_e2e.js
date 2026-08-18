const { chromium } = require('playwright');

(async () => {
  console.log('Starting verification script...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Print console logs from the page
  page.on('console', msg => console.log('[Browser Console]', msg.type(), msg.text()));
  
  // Navigate to our running dev server
  const URL = 'http://localhost:5174/admin/';
  console.log(`1. Navigating to ${URL}...`);
  await page.addInitScript(() => {
    window.localStorage.setItem('scrollz_admin_auth', JSON.stringify({ email: 'admin@scrollz.com' }));
  });
  await page.goto(URL);
  
  // Wait for loading to finish and page to settle
  await page.waitForTimeout(3000);
  
  console.log('2. Verifying top toolbar buttons...');
  const toolbarText = await page.textContent('body');
  
  const expectedButtons = [
    'Home',
    'Projects',
    'Desktop',
    'Tablet',
    'Mobile',
    '🎬 Video ID Manager',
    'Undo',
    'Redo',
    'Default',
    'Save & Publish'
  ];
  
  for (const btn of expectedButtons) {
    if (toolbarText.includes(btn)) {
      console.log(`  ✅ Button found: "${btn}"`);
    } else {
      console.error(`  ❌ Missing button: "${btn}"`);
      process.exit(1);
    }
  }

  // Check iframe
  console.log('3. Accessing editor iframe preview...');
  const iframeElement = await page.waitForSelector('iframe[title="Visual Builder"]');
  const frame = await iframeElement.contentFrame();
  await frame.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('4. Verifying VID badges inside iframe...');
  
  const videoDetails = await frame.evaluate(() => {
    const vids = Array.from(document.querySelectorAll('video'));
    return vids.map(v => v.outerHTML);
  });
  console.log('Video elements outerHTML found in iframe:', videoDetails);

  const badgeTexts = await frame.$$eval('.ve-video-badge', elements => elements.map(el => el.textContent));
  console.log('Found badges:', badgeTexts);
  
  if (badgeTexts.length === 0) {
    console.error('  ❌ No video ID badges found inside the iframe.');
    // Let's print iframe body content to see what page is actually loaded
    const bodyHtml = await frame.evaluate(() => document.body.innerHTML.substring(0, 1000));
    console.log('Iframe Body HTML starts with:', bodyHtml);
    process.exit(1);
  }
  
  const validBadges = badgeTexts.filter(txt => txt.startsWith('🎬 VID-'));
  if (validBadges.length === badgeTexts.length) {
    console.log(`  ✅ All ${badgeTexts.length} badges are correctly prefixed with "🎬 " and contain "VID-"`);
  } else {
    console.error('  ❌ Badges do not follow the format "🎬 VID-XXX". Found:', badgeTexts);
    process.exit(1);
  }

  // Get initial sources of VID-001, VID-002, VID-003, VID-004
  const getSrcs = async (vid) => {
    return await frame.$$eval(`video[data-video-id="${vid}"]`, els => els.map(el => el.getAttribute('src') || el.querySelector('source')?.getAttribute('src') || ''));
  };

  const beforeSrc1 = await getSrcs('VID-001');
  const beforeSrc2 = await getSrcs('VID-002');
  const beforeSrc3 = await getSrcs('VID-003');
  const beforeSrc4 = await getSrcs('VID-004');
  
  console.log('Initial video sources:');
  console.log('  VID-001:', beforeSrc1);
  console.log('  VID-002:', beforeSrc2);
  console.log('  VID-003:', beforeSrc3);
  console.log('  VID-004:', beforeSrc4);

  console.log('5. Clicking "🎬 Video ID Manager" to open the drawer...');
  await page.click('button:has-text("🎬 Video ID Manager")');
  await page.waitForTimeout(1000);

  // Assert drawer is visible
  const drawerHeader = await page.textContent('h3');
  if (drawerHeader.includes('Video ID Manager')) {
    console.log('  ✅ Video ID Manager drawer is visible!');
  } else {
    console.error('  ❌ Video ID Manager drawer failed to open.');
    process.exit(1);
  }

  console.log('6. Verifying listed Video IDs in the drawer...');
  const listedIds = await page.$$eval('div', els => els.map(el => el.textContent).filter(t => t.startsWith('VID-')));
  console.log('Listed logical IDs in drawer:', [...new Set(listedIds)]);

  // Trigger replacement of VID-003 via the manager
  console.log('7. Replacing VID-003 (without double-click!)...');
  
  // Find the button directly inside the list card containing "VID-003"
  // Let's use Playwright locator's selectiveness
  const cardLocator = page.locator('div').filter({ hasText: /^VID-003$/ });
  // Wait, let's see what buttons are available
  const replaceBtn = page.locator('div').filter({ has: page.locator('text=/^VID-003$/') }).locator('button:has-text("Replace Video")').first();
  await replaceBtn.click();
  await page.waitForTimeout(1500);

  // Verify Media Modal opened
  const modalHeader = await page.textContent('h3');
  console.log('Modal header:', modalHeader);
  
  // Fill the video link input
  const TEST_URL = 'https://framerusercontent.com/assets/Rxn2rYDo8j18aGGQnD79Gr3Nezg.mp4?test=VID-003-replaced';
  console.log(`8. Inputting test replacement URL: ${TEST_URL}`);
  await page.fill('input[placeholder*="https://www.youtube.com"]', TEST_URL);
  
  console.log('9. Confirming media library selection...');
  await page.click('button:has-text("Use Video Link")');
  await page.waitForTimeout(3000);

  // Re-verify sources in the iframe DOM
  console.log('10. Re-evaluating DOM state inside iframe after replacement...');
  const afterSrc1 = await getSrcs('VID-001');
  const afterSrc2 = await getSrcs('VID-002');
  const afterSrc3 = await getSrcs('VID-003');
  const afterSrc4 = await getSrcs('VID-004');
  
  console.log('Updated video sources:');
  console.log('  VID-001:', afterSrc1);
  console.log('  VID-002:', afterSrc2);
  console.log('  VID-003:', afterSrc3);
  console.log('  VID-004:', afterSrc4);

  // Assertions
  let success = true;
  
  // VID-001 should NOT change
  if (JSON.stringify(beforeSrc1) !== JSON.stringify(afterSrc1)) {
    console.error('  ❌ Unintended change detected: VID-001 source was altered!');
    success = false;
  } else {
    console.log('  ✅ Verified: VID-001 remains unchanged.');
  }

  // VID-002 should NOT change
  if (JSON.stringify(beforeSrc2) !== JSON.stringify(afterSrc2)) {
    console.error('  ❌ Unintended change detected: VID-002 source was altered!');
    success = false;
  } else {
    console.log('  ✅ Verified: VID-002 remains unchanged.');
  }

  // VID-003 MUST have all its responsive variants updated to TEST_URL
  const allUpdated = afterSrc3.every(src => src === TEST_URL);
  if (allUpdated && afterSrc3.length > 0) {
    console.log(`  ✅ Verified: All responsive variants of VID-003 (count: ${afterSrc3.length}) were updated to the new URL!`);
  } else {
    console.error(`  ❌ Failed: VID-003 variants were not correctly updated. Found:`, afterSrc3);
    success = false;
  }

  // VID-004 should NOT change
  if (JSON.stringify(beforeSrc4) !== JSON.stringify(afterSrc4)) {
    console.error('  ❌ Unintended change detected: VID-004 source was altered!');
    success = false;
  } else {
    console.log('  ✅ Verified: VID-004 remains unchanged.');
  }

  if (success) {
    console.log('\n🎉 ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  } else {
    console.error('\n❌ SOME VERIFICATION CHECKS FAILED.');
    process.exit(1);
  }

  await browser.close();
})();

const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    const html = await page.content();
    require('fs').writeFileSync('localhost_dump.html', html);
    await browser.close();
    console.log('Successfully dumped html');
  } catch (err) {
    console.error('Error:', err);
  }
})();

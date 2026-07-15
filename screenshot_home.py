import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page.goto('https://tame-designer-769579.framer.app/', wait_until='networkidle')
        await page.wait_for_timeout(5000)
        await page.screenshot(path='C:\\Users\\rakes\\.gemini\\antigravity\\brain\\a4bc27ec-4385-4c43-9803-544ea315d3dc\\framer_home_ss.png', full_page=True)
        await browser.close()

asyncio.run(main())

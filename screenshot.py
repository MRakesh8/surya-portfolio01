import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page.goto('https://tame-designer-769579.framer.app/projects?service-s-opted-for=motion-graphics&editing-style=Professional', wait_until='networkidle')
        await page.wait_for_timeout(3000)
        await page.screenshot(path='C:\\Users\\rakes\\.gemini\\antigravity\\brain\\a53c58cb-d34c-4fe7-a0fb-856ce0f302e4\\framer_projects_ss.png', full_page=True)
        await browser.close()

asyncio.run(main())

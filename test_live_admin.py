import asyncio
from playwright.async_api import async_playwright

async def run_live_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        
        # Collect console logs
        page.on("console", lambda msg: print(f"[Browser Console] {msg.type}: {msg.text}"))
        
        print("Navigating to http://localhost:3000/admin#/")
        await page.goto("http://localhost:3000/admin#/", wait_until="load")
        await page.wait_for_timeout(3000)
        
        # Take screenshot of page
        await page.screenshot(path="test_admin_screen.png")
        print("Admin page loaded, screenshot saved to test_admin_screen.png")
        
        # Check iframe
        iframe_element = await page.wait_for_selector("iframe", timeout=10000)
        frame = await iframe_element.content_frame()
        print("Iframe connected:", frame is not None)
        
        if frame:
            await frame.wait_for_load_state("load")
            await page.wait_for_timeout(2000)
            
            # Find video inside iframe
            video = await frame.query_selector("video")
            print("Found video in iframe:", video is not None)
            
            if video:
                # Double click video
                await video.dblclick()
                await page.wait_for_timeout(1000)
                
                # Check context menu in parent page
                context_menu = await page.wait_for_selector("text=Replace Video", timeout=5000)
                print("Context menu open with Replace Video:", context_menu is not None)
                
                if context_menu:
                    # Click Replace Video
                    await context_menu.click()
                    await page.wait_for_timeout(1000)
                    
                    # Check media modal
                    modal = await page.wait_for_selector("text=Replace Video / Media", timeout=5000)
                    print("Media modal open:", modal is not None)
                    
                    if modal:
                        # Test Quick Sample Video
                        sample_btn = await page.wait_for_selector("text=📹 Sample Short Video", timeout=5000)
                        await sample_btn.click()
                        await page.wait_for_timeout(2000)
                        
                        # Verify video src updated
                        new_src = await video.get_attribute("src")
                        print("Updated video src:", new_src)
                        
                        # Check Undo button state
                        undo_btn = await page.query_selector("button[title='Undo']")
                        if undo_btn:
                            is_disabled = await undo_btn.get_attribute("disabled")
                            print("Undo button disabled attribute:", is_disabled)
                            if is_disabled is None:
                                print("Clicking Undo...")
                                await undo_btn.click()
                                await page.wait_for_timeout(1000)
                                undone_src = await video.get_attribute("src")
                                print("Src after Undo:", undone_src)
        
        await browser.close()
        print("Live test completed successfully!")

if __name__ == '__main__':
    asyncio.run(run_live_test())

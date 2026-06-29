import asyncio
from playwright.async_api import async_playwright
import time

async def run_verification():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 720})
        page = await context.new_page()

        print("Navigating to FocusBoard...")
        await page.goto("http://localhost:5173")

        await page.wait_for_selector("text=FocusBoard")

        print("Creating a new task...")
        await page.get_by_role("button", name="New Task").click()
        await page.get_by_placeholder("What needs to be done?").fill("Parent Task")

        print("Adding a subtask...")
        await page.get_by_placeholder("Add a subtask...").fill("Subtask 1")
        await page.get_by_placeholder("Add a subtask...").press("Enter")

        print("Saving the task...")
        await page.get_by_role("button", name="Create Task").click()

        await page.wait_for_selector("text=Parent Task")

        print("Dragging task to To Do column...")
        # Use a more specific locator for the task card in the Task List
        source = page.locator("div.bg-white.dark\\:bg-gray-800").filter(has_text="Parent Task").filter(has_text="Task List")
        # If that's too specific, let's just find the one with Parent Task that is not the header
        source = page.locator(".bg-white.dark\\:bg-gray-800.rounded-xl.p-4.shadow-sm").filter(has_text="Parent Task")
        target = page.get_by_text("To Do").first

        await source.drag_to(target)
        await page.wait_for_timeout(1000)

        print("Expanding subtasks...")
        # Find the card in the To Do column
        todo_column = page.locator("div").filter(has_text="To Do").locator("..")
        card_in_todo = todo_column.locator(".bg-white.dark\\:bg-gray-800.rounded-xl.p-4.shadow-sm").filter(has_text="Parent Task")

        await card_in_todo.get_by_role("button", name="Subtasks (0/1)").click()
        await page.wait_for_timeout(500)

        print("Opening subtask popover...")
        await card_in_todo.get_by_text("Subtask 1").click()

        await page.wait_for_selector(".fixed.inset-0.z-50")
        await page.screenshot(path="subtask_popover_opened.png")

        # Edit title
        print("Editing subtask title...")
        # The pencil icon is in the header
        await page.locator("h3:has-text('Subtask 1') + button").click()

        await page.locator("input[type='text']").fill("Updated Subtask Title")
        # Click save (the checkmark icon)
        await page.locator("button:has(svg.lucide-check)").first.click()

        # Edit URL
        print("Editing subtask URL...")
        # Find the "Link" text, then the pencil button next to it or after it
        await page.locator("div:has-text('Link') > button").click()

        await page.get_by_placeholder("https://...").fill("https://example.com")
        # Click save for URL
        await page.locator("button:has(svg.lucide-check)").click()

        await page.screenshot(path="subtask_edited.png")

        print("Verifying changes in popover...")
        await page.wait_for_selector("text=Updated Subtask Title")
        await page.wait_for_selector("text=example.com")

        print("Closing popover...")
        await page.locator("button:has(svg.lucide-x)").click()
        await page.wait_for_timeout(500)

        print("Verifying changes in task card...")
        await page.wait_for_selector("text=Updated Subtask Title")
        await page.screenshot(path="final_state.png")

        print("Verification successful!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_verification())

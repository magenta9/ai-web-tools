from playwright.sync_api import sync_playwright, expect
import time

def verify_compound_tool(page):
    # Register skipped (using mock auth)

    # Navigate to Compound Calculator
    page.goto("http://localhost:3000/compound")

    # Verify Title
    expect(page.get_by_text("复利计算器").first).to_be_visible()

    # Verify Inputs exist
    expect(page.get_by_text("起始金额")).to_be_visible()

    # Verify Results exist (should be visible immediately with default values)
    expect(page.get_by_text("计算结果")).to_be_visible()
    expect(page.get_by_text("期末总值")).to_be_visible()

    # Take screenshot
    page.screenshot(path="verification/compound_calculator.png", full_page=True)
    print("Screenshot taken")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_compound_tool(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_v3.png")
        finally:
            browser.close()

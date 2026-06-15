import { test, expect } from "@playwright/test";

test.describe("DroneWatch — smoke", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("loads the page", async ({ page }) => {
        await expect(page).toHaveTitle(/DroneWatch/i);
    });

    test("shows brand mark", async ({ page }) => {
        await expect(page.locator("header")).toBeVisible();
    });

    test("shows WS status indicator", async ({ page }) => {
        await expect(page.getByTestId("ws-status")).toBeVisible();
    });

    test("shows + NEW MISSION button", async ({ page }) => {
        await expect(
            page.getByRole("button", { name: /new mission/i })
        ).toBeVisible();
    });

    test("shows status bar labels", async ({ page }) => {
        const footer = page.locator("footer");
        await expect(footer).toBeVisible();
        await expect(footer.getByText("Elapsed")).toBeVisible();
        await expect(footer.getByText("Total Dist")).toBeVisible();
        await expect(footer.getByText("Missions")).toBeVisible();
    });
});

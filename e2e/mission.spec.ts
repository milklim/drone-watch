import { test, expect } from "@playwright/test";

test.describe("Mission panel", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("opens on + NEW MISSION click", async ({ page }) => {
        await page.getByRole("button", { name: /new mission/i }).click();
        await expect(page.getByTestId("mission-panel")).toBeVisible();
    });

    test("closes on ✕ button", async ({ page }) => {
        await page.getByRole("button", { name: /new mission/i }).click();
        await expect(page.getByTestId("mission-panel")).toBeVisible();

        await page.getByRole("button", { name: "✕" }).click();
        await expect(page.getByTestId("mission-panel")).not.toBeVisible();
    });

    test("has mission name input", async ({ page }) => {
        await page.getByRole("button", { name: /new mission/i }).click();
        await expect(page.getByTestId("mission-name-input")).toBeVisible();
    });
});

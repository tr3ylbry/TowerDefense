import { test, expect } from "@playwright/test";

test("Augie identity follows cards, stats, guide, keyboard placement and comparison", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  const card = page.locator('[data-tower="tars"]');
  await expect(card).toHaveAccessibleName("Augie, 100 credits. Precision armor-piercing rounds ignore Tank plating.");
  await page.locator("#guide-open").click();
  await expect(page.locator("#guide-dialog")).toContainText("Augie ignores plating");
  await expect(page.locator("#guide-dialog .alien-guide")).toContainText("Augie ignores it");
  await page.keyboard.press("Escape");
  await page.locator("#campaign-nav").click();
  await page.locator('[data-review="first-contact"]').click();
  await expect(page.locator("#campaign-dialog")).toContainText("bring Augie or plasma");
  await page.keyboard.press("Escape");
  await page.locator("#start").click();
  await page.keyboard.press("7");
  await expect(card).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#selected-detail")).toContainText("Augie");
  await page.locator("#crew-stats-toggle").click();
  await expect(page.locator("#crew-stats-title")).toHaveText("Augie");
  await expect(page.locator("#crew-stats")).toContainText("100%");
  await page.keyboard.press("Escape");
  await page.getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true }).click();
  await expect(page.getByRole("gridcell", { name: /^Lane 1, tile 1, Augie,/ })).toBeVisible();
  if (await page.locator("#art-toggle").count()) {
    await page.locator("#art-toggle").click();
    await expect(page.locator("#art-toggle")).toContainText("Original");
    await expect(page.getByRole("gridcell", { name: /^Lane 1, tile 1, Augie,/ })).toBeVisible();
  }
  expect(await page.locator("body").innerText()).not.toMatch(/\bTARS\b/);
  const labels = await page.locator("[aria-label]").evaluateAll(elements => elements.map(element => element.getAttribute("aria-label")));
  expect(labels.join("\n")).not.toMatch(/\bTARS\b/);
});

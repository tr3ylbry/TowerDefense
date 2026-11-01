import { test, expect } from "@playwright/test";

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
])
  test(`opening modes stay clear and reachable at ${viewport.width}x${viewport.height}`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("#start")).toBeEnabled();
    if (viewport.width !== 1280)
      await page.addStyleTag({ content: "html { zoom: 1.5; }" });
    await expect(page.locator("#mode-choice")).toContainText(
      "Standalone · no saved stars",
    );
    await page.locator("#campaign-entry").scrollIntoViewIfNeeded();
    await expect(page.locator("#campaign-entry")).toBeInViewport();
    await page.locator("#campaign-entry").press("Enter");
    await expect(page.locator("#campaign-dialog")).toBeVisible();
    await expect(page.locator("#campaign-progress")).toContainText(
      "0 / 6 missions complete",
    );
    await page.locator('[data-review="first-contact"]').click();
    await page.locator("#campaign-launch").click();
    await expect(page.locator("#start")).toBeFocused();
    await expect(page.locator("#mode-label")).toHaveText("Campaign");
    await expect(page.locator("#mode-choice")).toBeHidden();
    await page.locator("#map-open").click();
    await page.locator("#campaign-standalone").click();
    await expect(page.locator("#map-warning")).toContainText(
      "does not award campaign stars",
    );
    await page.locator('[data-map="canyon"]').click();
    await expect(page.locator("#mode-label")).toHaveText("Standalone");
    await expect(page.locator("#mode-choice")).toBeVisible();
    await page.screenshot({
      path: info.outputPath("opening-modes.png"),
      fullPage: true,
    });
    await page.locator("#start").click();
    await expect(page.locator("#mode-choice")).toBeHidden();
    await page.keyboard.press("p");
    await expect(page.locator("#mode-choice")).toBeHidden();
  });

test("replay guidance distinguishes improving shields from an already complete rating", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "ava-campaign",
      JSON.stringify({
        version: 1,
        best: {
          "first-contact": { stars: 2, shields: 2, duration: 100, kills: 32 },
          "canyon-escalation": {
            stars: 3,
            shields: 3,
            duration: 120,
            kills: 42,
          },
        },
      }),
    ),
  );
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  await page.locator("#campaign-entry").click();
  await expect(page.locator("#state-first-contact")).toContainText(
    "protect more shields",
  );
  await expect(page.locator("#state-canyon-escalation")).toContainText(
    "All three stars. Try a different formation",
  );
  await expect(page.locator('[data-review="canyon-escalation"]')).toBeEnabled();
  await page.locator('[data-review="canyon-escalation"]').click();
  await expect(page.locator("#briefing-title")).toBeFocused();
  await page.locator("#campaign-back").click();
  await expect(page.locator('[data-review="canyon-escalation"]')).toBeFocused();
});

test("real breaches announce shield loss, results describe replay, and replay clears that description", async ({
  page,
}, info) => {
  test.setTimeout(90_000);
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  await page.locator("#campaign-entry").click();
  await page.locator('[data-review="first-contact"]').click();
  await page.locator("#campaign-launch").click();
  await page.locator("#start").click();
  await expect(page.locator("#credit-balance")).toHaveAccessibleName(
    "230 credits available",
  );
  await page.keyboard.press("Enter");
  await expect(page.locator("#credit-balance")).toHaveAccessibleName(
    "180 credits available",
  );
  await page.locator("#speed").click();
  await expect(page.locator("#announcement")).toContainText(
    /Breach in lane \d\. 2 shields remain\./,
    { timeout: 45_000 },
  );
  await expect(page.locator("#status")).toHaveText("Signal lost", {
    timeout: 45_000,
  });
  await expect(page.locator("#start")).toBeFocused();
  await expect(page.locator("#start")).toHaveAccessibleDescription(
    /The signal went quiet.*0 shields remaining.*0\/3 stars.*Best: 0\/3/,
  );
  await expect(page.locator("#announcement")).toHaveText(
    "Mission lost. All outpost shields are gone.",
  );
  await page.screenshot({
    path: info.outputPath("described-result.png"),
    fullPage: true,
  });
  await page.locator("#start").press("Enter");
  await expect(page.locator("#start")).not.toHaveAttribute("aria-describedby");
  await expect(page.locator("#status")).toHaveText("Mission in progress");
  await page.keyboard.press("p");
});

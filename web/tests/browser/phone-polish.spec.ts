import { test, expect } from "@playwright/test";

test("phone navigation aligns, crew stats support tap/keyboard/hover, and both art rosters stay registered", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  await page.screenshot({ path: info.outputPath("phone-navigation.png") });
  const nav = page.locator(".site-header nav");
  const boxes = await nav.locator("button, a").evaluateAll((elements) =>
    elements.map((e) => {
      const r = e.getBoundingClientRect();
      return { x: r.x, y: r.y, height: r.height };
    }),
  );
  expect(boxes).toHaveLength(3);
  for (let i = 0; i < boxes.length; i++) {
    expect(boxes[i].height).toBeGreaterThanOrEqual(44);
    expect(Math.abs(boxes[i].y - boxes[0].y)).toBeLessThan(1);
    if (i) expect(boxes[i].x).toBeGreaterThan(boxes[i - 1].x);
  }
  await page.locator("#start").click();
  await page.locator("#pause").click();
  await page.locator('[data-tower="zeus"]').click();
  await page.locator("#crew-stats-toggle").press("Enter");
  const panel = page.locator("#crew-stats");
  await expect(panel).toBeVisible();
  await expect(panel.locator("h3")).toHaveText("Moon Zeus");
  await expect(panel.locator("dl")).toContainText(/Health\s*320/);
  await expect(panel.locator("dl")).toContainText(/Plating bypass\s*65%/);
  await expect(panel).toBeInViewport({ ratio: 1 });
  await page.screenshot({ path: info.outputPath("phone-unit-stats.png") });
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(page.locator('[data-tower="zeus"]')).toHaveAttribute("aria-pressed", "true");
  await page.locator("#crew-stats-toggle").click();
  await panel.getByRole("button", { name: "Close unit stats" }).click();
  await expect(page.locator("#crew-stats-toggle")).toBeFocused();
  await page.locator("#crew-stats-toggle").hover();
  await expect(panel).toBeVisible();
  await panel.hover();
  await expect(panel).toBeVisible();
  await page.keyboard.press("Escape");
  for (const original of [false, true]) {
    if (original) {
      await page.locator("#art-toggle").click();
      await expect(page.locator("html")).toHaveClass(/original-art/);
    }
    for (let i = 1; i <= 9; i++) {
      await page.keyboard.press(String(i));
      const card = page.locator('.crew-card[aria-pressed="true"]');
      await expect(card).toBeInViewport();
      const geometry = await card.evaluate((e) => {
        const outer = e.getBoundingClientRect();
        return [...e.querySelectorAll(".portrait, strong, .crew-price")].map((part) => {
          const r = part.getBoundingClientRect();
          return { x: r.x - outer.x, y: r.y - outer.y, right: r.right - outer.right, bottom: r.bottom - outer.bottom };
        });
      });
      for (const box of geometry) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(1);
        expect(box.bottom).toBeLessThanOrEqual(1);
      }
    }
    await page.screenshot({ path: info.outputPath(original ? "original-crew.png" : "expedition-crew.png"), fullPage: true });
  }
  await page.addStyleTag({ content: "html { zoom: 1.5; }" });
  await page.locator("#crew-stats-toggle").click();
  await expect(panel).toBeInViewport({ ratio: 1 });
  await expect(panel.getByRole("button", { name: "Close unit stats" })).toBeInViewport();
});

test("ambient music is deferred, actually plays, stops, retries, and remains paused after backgrounding", async ({ page }) => {
  const errors: string[] = [], requests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => requests.push(request.url()));
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      const observed = window as Window & { musicElements?: HTMLMediaElement[] };
      observed.musicElements ??= [];
      if (!observed.musicElements.includes(this)) observed.musicElements.push(this);
      return play.call(this);
    };
  });
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  expect(requests.some((url) => url.includes("orbital-drift.wav"))).toBe(false);
  await page.route("**/orbital-drift.wav*", (route) => route.abort());
  await page.locator("#music-toggle").click();
  await expect(page.locator("#music-toggle")).toHaveAccessibleName("Retry ambient music");
  await page.unroute("**/orbital-drift.wav*");
  await page.locator("#music-toggle").click();
  await expect(page.locator("#music-toggle")).toHaveAttribute("data-state", "playing");
  await expect.poll(() => page.evaluate(() => {
    const elements = (window as Window & { musicElements?: HTMLMediaElement[] }).musicElements!;
    return elements[0].currentTime;
  })).toBeGreaterThan(0.1);
  await page.locator("#music-toggle").click();
  await expect(page.locator("#music-toggle")).toHaveAttribute("data-state", "off");
  expect(await page.evaluate(() => (window as Window & { musicElements?: HTMLMediaElement[] }).musicElements![0].paused)).toBe(true);
  await page.locator("#music-toggle").click();
  await expect(page.locator("#music-toggle")).toHaveAttribute("data-state", "playing");
  // Browser visibility emulation only; no simulation state/clock edits.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("#music-toggle")).toHaveAccessibleName("Resume ambient music");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("#music-toggle")).toHaveAttribute("data-state", "paused");
  await page.locator("#music-toggle").click();
  await expect(page.locator("#music-toggle")).toHaveAttribute("data-state", "playing");
  expect(await page.evaluate(() => {
    const elements = (window as Window & { musicElements?: HTMLMediaElement[] }).musicElements!;
    return { count: elements.length, loop: elements[0].loop, volume: elements[0].volume };
  })).toEqual({ count: 1, loop: true, volume: 0.24 });
  await expect(page.locator("#sound-toggle")).toHaveAttribute("aria-pressed", "false");
  expect(errors).toEqual([]);
});

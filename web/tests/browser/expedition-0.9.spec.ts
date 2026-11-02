import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
test.use({
  video:
    process.env.AVA_RECORD_ANIMATION === "1"
      ? { mode: "on", size: { width: 1280, height: 900 } }
      : "off",
});

async function prepareFirstContact(page: Page, hard = false) {
  const mode = await page.locator("#mode-label").innerText();
  if (mode === "Standalone") await page.locator("#campaign-nav").click();
  else await page.locator("#map-open").click();
  await page.locator('[data-review="first-contact"]').click();
  await expect(page.getByLabel("Difficulty", { exact: true })).toHaveValue(
    "normal",
  );
  if (hard)
    await page.getByLabel("Difficulty", { exact: true }).selectOption("hard");
  await page.locator("#campaign-launch").click();
  await expect(page.locator("#start")).toBeFocused();
}

async function earnedArmorVictory(page: Page) {
  await page.locator("#start").click();
  await page.locator("#speed").click();
  const deadline = Date.now() + 100000;
  const slots = [
    ...Array.from({ length: 6 }, (_, row) => ({
      row,
      col: 0,
      kind: "astro",
      cost: 50,
    })),
    ...Array.from({ length: 6 }, (_, row) => ({
      row,
      col: 1,
      kind: "tars",
      cost: 100,
    })),
  ];
  while (Date.now() < deadline && (await page.locator("#overlay").isHidden())) {
    for (const slot of slots) {
      const cell = page.getByRole("gridcell", {
        name: new RegExp(`^Lane ${slot.row + 1}, tile ${slot.col + 1}, empty`),
      });
      if (!(await cell.count())) continue;
      if (Number(await page.locator("#credits").innerText()) < slot.cost) break;
      await page.locator(`[data-tower="${slot.kind}"]`).click();
      await cell.click();
      await expect(
        page.getByRole("gridcell", {
          name: new RegExp(
            `^Lane ${slot.row + 1}, tile ${slot.col + 1}, (Astro Joe|TARS)`,
          ),
        }),
      ).toBeVisible();
    }
    if (await page.locator("#call-wave").isEnabled())
      await page.locator("#call-wave").click();
    await page.waitForTimeout(180);
  }
  await expect(page.locator("#status")).toHaveText("Outpost secured");
}

test.describe("Sprinter visual integration", () => {
  test("joint poses animate, pause, change speed and respect reduced motion across three environments", async ({
    page,
  }, info) => {
    await page.goto("/tests/fixtures/animation-lab.html");
    await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
    const first = await page.locator("body").getAttribute("data-frames");
    await expect
      .poll(() => page.locator("body").getAttribute("data-frames"))
      .not.toBe(first);
    await page.locator("#pause").click();
    const paused = await page.locator("body").getAttribute("data-frames");
    await page.waitForTimeout(250);
    await expect(page.locator("body")).toHaveAttribute("data-frames", paused!);
    await page.locator("#speed").click();
    await expect(page.locator("#speed")).toHaveText("2×");
    await page.locator("#pause").click();
    await expect
      .poll(() => page.locator("body").getAttribute("data-frames"))
      .not.toBe(paused);
    await page.locator("#reduce").check();
    await expect(page.locator("body")).toHaveAttribute(
      "data-frames",
      "6,24,32",
    );
    await page.waitForTimeout(250);
    await expect(page.locator("body")).toHaveAttribute(
      "data-frames",
      "6,24,32",
    );
    await page.screenshot({
      path: info.outputPath("reduced-three-environments.png"),
      fullPage: true,
    });
    await page.locator("#reduce").uncheck();
    await page.locator("#speed").click();
    await page.waitForTimeout(2400);
    await page.screenshot({
      path: info.outputPath("animated-three-environments.png"),
      fullPage: true,
    });
  });
  test("real moving and attacking Sprinters survive comparison, motion changes and repeated restarts", async ({
    page,
  }, info) => {
    test.setTimeout(90000);
    const errors: string[] = [],
      atlasRequests: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (r.url().endsWith("sprinter-animation.webp"))
        atlasRequests.push(r.url());
    });
    await page.goto("/");
    await page.locator("#start").click();
    await page.locator('[data-tower="wall"]').click();
    for (let lane = 1; lane <= 6; lane++)
      await page
        .getByRole("gridcell", {
          name: `Lane ${lane}, tile 8, empty`,
          exact: true,
        })
        .click();
    await page.locator("#speed").click();
    await expect(page.locator("#wave-number")).toHaveText("2", {
      timeout: 30000,
    });
    await page.waitForTimeout(6500);
    await page.screenshot({
      path: info.outputPath("real-sprinter-combat.png"),
      fullPage: true,
    });
    await page.locator("#pause").click();
    const cells = await page
      .getByRole("gridcell")
      .evaluateAll((es) => es.map((e) => e.getAttribute("aria-label")));
    const credits = await page.locator("#credits").innerText();
    for (let cycle = 0; cycle < 2; cycle++) {
      await page.locator("#art-toggle").click();
      await expect(page.locator("html")).toHaveClass(/original-art/);
      await page.locator("#art-toggle").click();
      await expect(page.locator("html")).not.toHaveClass(/original-art/);
      expect(
        await page
          .getByRole("gridcell")
          .evaluateAll((es) => es.map((e) => e.getAttribute("aria-label"))),
      ).toEqual(cells);
      await expect(page.locator("#credits")).toHaveText(credits);
    }
    await page.locator("#motion-toggle").click();
    await expect(page.locator("#motion-toggle")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.locator("#pause").click();
    await page.waitForTimeout(500);
    await page.locator("#pause").click();
    for (let cycle = 0; cycle < 3; cycle++) {
      await page.locator("#restart").click();
      await page.locator("#restart-confirm").click();
      await expect(page.locator("#credits")).toHaveText("230");
      await expect(page.locator("canvas")).toHaveCount(1);
      if (cycle < 2) {
        await page.locator("#start").click();
        await page.locator("#pause").click();
      }
    }
    expect(atlasRequests).toHaveLength(1);
    expect(errors).toEqual([]);
  });
});

test("failed pilot atlas uses the existing retry path and defers other environments", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.route("**/sprinter-animation.webp", (r) => r.abort());
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Retry loading", exact: true }),
  ).toBeEnabled();
  await page.unroute("**/sprinter-animation.webp");
  await page
    .getByRole("button", { name: "Retry loading", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Begin mission", exact: true }),
  ).toBeEnabled();
  expect(
    requests.some(
      (r) => r.includes("sky-bridge.webp") || r.includes("/nest.webp"),
    ),
  ).toBe(false);
  await expect(page.locator("canvas")).toHaveCount(1);
});

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
])
  test(`Hard is opt-in and clearly distinguished from speed at ${viewport.width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("#start")).toBeEnabled();
    await expect(page.locator("#current-difficulty")).toBeHidden();
    await prepareFirstContact(page, true);
    await expect(page.locator("#overlay-title")).toHaveText(
      "First Contact · Hard",
    );
    await expect(page.locator("#overlay-body")).toContainText(
      "Results do not award or save campaign stars",
    );
    await expect(page.locator("#current-difficulty")).toBeVisible();
    await expect(page.locator("#speed")).toHaveText("1×");
    await page.screenshot({
      path: info.outputPath("hard-briefing.png"),
      fullPage: true,
    });
    await page.locator("#start").click();
    await page.locator("#speed").click();
    await page.locator("#pause").click();
    await expect(page.locator("#current-difficulty")).toBeVisible();
    await expect(page.locator("#speed")).toHaveText("2×");
    await page.locator("#restart").click();
    await page.locator("#restart-confirm").click();
    await expect(page.locator("#overlay-title")).toHaveText(
      "First Contact · Hard",
    );
    await prepareFirstContact(page);
    await expect(page.locator("#current-difficulty")).toBeHidden();
    await expect(page.locator("#overlay-title")).toHaveText("First Contact");
  });

test("earned Hard win and deliberate loss keep Normal progress isolated, then Normal can award stars", async ({
  page,
}) => {
  test.setTimeout(200000);
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  await prepareFirstContact(page, true);
  await earnedArmorVictory(page);
  await expect(page.locator("#overlay-title")).toHaveText(
    "First Contact · Hard secured.",
  );
  await expect(page.locator("#mission-rating")).toBeHidden();
  await expect(page.locator("#campaign-next")).toBeHidden();
  expect(
    await page.evaluate(() => localStorage.getItem("ava-campaign")),
  ).toBeNull();
  await page.locator("#start").click();
  await page.locator("#speed").click();
  await expect(page.locator("#status")).toHaveText("Signal lost", {
    timeout: 70000,
  });
  expect(
    await page.evaluate(() => localStorage.getItem("ava-campaign")),
  ).toBeNull();
  await page.locator("#campaign-return").click();
  await page.locator('[data-review="first-contact"]').click();
  await expect(page.getByLabel("Difficulty", { exact: true })).toHaveValue(
    "normal",
  );
  await page.locator("#campaign-launch").click();
  await earnedArmorVictory(page);
  await expect(page.locator("#mission-rating")).toContainText("3/3 stars");
  expect(
    JSON.parse(
      (await page.evaluate(() => localStorage.getItem("ava-campaign")))!,
    ).best["first-contact"].stars,
  ).toBe(3);
});

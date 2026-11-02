import { test, expect } from "@playwright/test";
import { slowRuntime } from "./slow-runtime";
test.beforeEach(slowRuntime);
test.use({
  video:
    process.env.AVA_RECORD_ANIMATION === "1"
      ? { mode: "on", size: { width: 1280, height: 900 } }
      : "off",
});

test("both anatomy pilots animate, pause and reduce motion on all environments", async ({
  page,
}, info) => {
  await page.goto("/tests/fixtures/aliens-animation-lab.html");
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
    "6,24,32,4,16,24",
  );
  await page.waitForTimeout(250);
  await expect(page.locator("body")).toHaveAttribute(
    "data-frames",
    "6,24,32,4,16,24",
  );
  await page.screenshot({
    path: info.outputPath("both-pilots-reduced.png"),
    fullPage: true,
  });
  await page.locator("#reduce").uncheck();
  await page.screenshot({
    path: info.outputPath("both-pilots.png"),
    fullPage: true,
  });
});

test("both pilots survive actual spawned combat, pause, art comparison, speed, reduced motion and restarts", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  const errors: string[] = [],
    atlases: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (/(sprinter|gargantua)-animation.webp$/.test(r.url()))
      atlases.push(r.url());
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
  await page.waitForTimeout(1200);
  await page.locator("#speed").click();
  const deadline = Date.now() + 90000;
  while (
    Date.now() < deadline &&
    (await page.locator("#wave-number").innerText()) !== "4"
  ) {
    if (await page.locator("#call-wave").isEnabled())
      await page.locator("#call-wave").click();
    for (let lane = 1; lane <= 6; lane++) {
      const cell = page.getByRole("gridcell", {
        name: `Lane ${lane}, tile 8, empty`,
        exact: true,
      });
      if (
        (await cell.count()) &&
        Number(await page.locator("#credits").innerText()) >= 35
      )
        await cell.click();
    }
    await page.waitForTimeout(200);
  }
  await expect(page.locator("#wave-number")).toHaveText("4");
  // Synchronize with the public schedule: software rendering can advance
  // fewer game seconds per real second. Earlier aliens can already be biting
  // a barrier when Gargantua arrives, so observe a real 100-point strike rather
  // than assuming its first contact is against an untouched 1100-point wall.
  await page.locator("#speed").click();
  await expect(page.locator("#incoming-summary")).toContainText("Gargantua", {
    timeout: 45000,
  });
  const heavyCell = page.getByRole("gridcell", { name: /^Lane 4, tile 8,/ });
  await page.locator('[data-tower="wall"]').click();
  const healthHistory: (number | null)[] = [];
  let previousHealth: number | null = null;
  let observedHeavyStrike = false;
  const contactDeadline = Date.now() + 60000;
  while (!observedHeavyStrike && Date.now() < contactDeadline) {
    const label = await heavyCell.getAttribute("aria-label");
    const match = label?.match(/Asteroid, (\d+) health$/);
    const health = match ? Number(match[1]) : null;
    if (health !== previousHealth) healthHistory.push(health);
    observedHeavyStrike =
      health !== null &&
      previousHealth !== null &&
      previousHealth - health === 100;
    previousHealth = health;
    if (observedHeavyStrike) break;
    for (let lane = 1; lane <= 6; lane++) {
      const empty = page.getByRole("gridcell", {
        name: `Lane ${lane}, tile 8, empty`,
        exact: true,
      });
      if (
        (await empty.count()) &&
        Number(await page.locator("#credits").innerText()) >= 35
      )
        await empty.click();
    }
    await page.waitForTimeout(75);
  }
  await info.attach("lane-4-health.json", {
    body: JSON.stringify(healthHistory),
    contentType: "application/json",
  });
  expect(
    observedHeavyStrike,
    "Public barrier health records a 100-point strike",
  ).toBe(true);
  await expect(page.locator("#speed")).toHaveText("1×");
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: info.outputPath("real-both-combat.png"),
    fullPage: true,
  });
  await page.locator("#pause").click();
  const cells = await page
    .getByRole("gridcell")
    .evaluateAll((es) => es.map((e) => e.getAttribute("aria-label")));
  const bank = await page.locator("#credits").innerText();
  await page.waitForTimeout(350);
  for (let cycle = 0; cycle < 2; cycle++) {
    await page.locator("#art-toggle").click();
    await expect(page.locator("html")).toHaveClass(/original-art/);
    await page.waitForTimeout(250);
    await page.locator("#art-toggle").click();
    await expect(page.locator("html")).not.toHaveClass(/original-art/);
    expect(
      await page
        .getByRole("gridcell")
        .evaluateAll((es) => es.map((e) => e.getAttribute("aria-label"))),
    ).toEqual(cells);
    await expect(page.locator("#credits")).toHaveText(bank);
  }
  await page.locator("#motion-toggle").click();
  await page.locator("#pause").click();
  await page.waitForTimeout(800);
  await page.locator("#pause").click();
  await page.locator("#motion-toggle").click();
  await page.locator("#speed").click();
  await page.locator("#pause").click();
  await page.waitForTimeout(800);
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
  expect(
    atlases.filter((r) => r.endsWith("sprinter-animation.webp")),
  ).toHaveLength(1);
  expect(
    atlases.filter((r) => r.endsWith("gargantua-animation.webp")),
  ).toHaveLength(1);
  expect(errors).toEqual([]);
});

test("failed Gargantua atlas blocks readiness, retries cleanly and keeps other environments deferred", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.route("**/gargantua-animation.webp", (r) => r.abort());
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Retry loading", exact: true }),
  ).toBeEnabled();
  await expect(page.locator("#start")).not.toHaveText("Begin mission");
  await page.unroute("**/gargantua-animation.webp");
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

test("phone actions use centered vector icons and landscape overview shows every lane", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  for (const selector of ["#campaign-nav", "#guide-open", "#start"]) {
    await expect(page.locator(`${selector} .action-arrow`)).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await expect(page.locator(selector)).not.toContainText("↗");
  }
  const centeredAction = async () => {
    const offset = await page.locator("#start").evaluate((button) => {
      const children = [...button.children].map((e) => e.getBoundingClientRect());
      const outer = button.getBoundingClientRect();
      const center = (children[0].left + children.at(-1)!.right) / 2;
      return Math.abs(center - (outer.left + outer.width / 2));
    });
    expect(offset).toBeLessThan(2);
  };
  await centeredAction();
  await page.locator("#start").click();
  for (const viewport of [
    { width: 667, height: 320 },
    { width: 844, height: 390 },
    { width: 852, height: 393 },
  ]) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator(".mission-bar")).toBeInViewport({ ratio: 1 });
    await expect(page.locator(".board-stack")).toBeInViewport({ ratio: 1 });
    const scroll = await page.locator(".battle-scroll").evaluate((e) => ({
      height: e.clientHeight,
      content: e.scrollHeight,
    }));
    expect(scroll.content - scroll.height).toBeLessThanOrEqual(1);
    for (let lane = 1; lane <= 6; lane++)
      await expect(
        page.getByRole("gridcell", {
          name: `Lane ${lane}, tile 9, empty`,
          exact: true,
        }),
      ).toBeInViewport({ ratio: 1 });
  }
  await page.screenshot({ path: info.outputPath("landscape-overview.png") });
  await page.locator("#field-zoom").click();
  await expect(page.locator("#field-zoom")).toHaveAccessibleName(
    "Show battlefield overview",
  );
  const enlarged = await page.locator(".board-stack").boundingBox();
  expect(enlarged!.width).toBeGreaterThanOrEqual(660);
  await page
    .getByRole("gridcell", { name: "Lane 6, tile 9, empty", exact: true })
    .click();
  await expect(
    page.getByRole("gridcell", {
      name: "Lane 6, tile 9, Astro Joe, 260 health",
      exact: true,
    }),
  ).toBeAttached();
  await page.locator("#field-zoom").click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#pause").click();
  await centeredAction();
  await expect(page.locator("#start")).toHaveAccessibleName("Resume mission");
});

import { test, expect } from "@playwright/test";
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
  test.setTimeout(110000);
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
  const deadline = Date.now() + 65000;
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
  // Gargantua is authored at +9 seconds in this wave, then walks into the
  // purchased barrier. This is elapsed real gameplay, never injected entities.
  await page.waitForTimeout(3500);
  // Replace earned-credit barriers before the heavy arrival; earlier enemies
  // may already have destroyed the opening line. Lane four is the authored
  // default-seed Gargantua lane, not an injected simulation fixture.
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
  await expect(
    page.getByRole("gridcell", {
      name: /^Lane 4, tile 8, Asteroid, (1000|900|800) health/,
    }),
  ).toBeAttached({ timeout: 10000 });
  await page.locator("#speed").click();
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

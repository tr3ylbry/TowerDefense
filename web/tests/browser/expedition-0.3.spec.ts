import { test, expect } from "@playwright/test";

test("defers comparison and other environments, then caches completed art transitions", async ({
  page,
}) => {
  const requests: string[] = [],
    textureRequests: string[] = [];
  page.on("request", (r) => {
    const url = new URL(r.url());
    if (url.protocol !== "http:") return;
    requests.push(url.pathname);
    // CSS may report a cache-hit request; count the renderer's actual image-loader batches.
    if (
      r.resourceType() === "xhr" &&
      /^\/art\/.+\.(png|webp)$/.test(url.pathname)
    )
      textureRequests.push(url.pathname);
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Begin mission", exact: true }),
  ).toBeEnabled();
  expect(requests).not.toContain("/art/astro-joe-idle.png");
  expect(requests).not.toContain("/art/tank-walk.png");
  expect(requests).not.toContain("/art/stage-two.webp");
  expect(requests).not.toContain("/art/stage-three.webp");
  await page.locator("#start").click();
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
    .click();
  await page.locator("#pause").click();
  const bank = await page.locator("#credits").innerText();
  await page.locator("#art-toggle").click();
  await expect(page.locator("html")).toHaveClass(/original-art/);
  await expect(page.locator("#asset-dialog")).not.toBeVisible();
  expect(requests).toContain("/art/astro-joe-idle.png");
  const count = textureRequests.length;
  await page.locator("#art-toggle").click();
  await expect(page.locator("html")).not.toHaveClass(/original-art/);
  await page.locator("#art-toggle").click();
  await expect(page.locator("html")).toHaveClass(/original-art/);
  expect(textureRequests.length).toBe(count);
  await expect(page.locator("#credits")).toHaveText(bank);
  await expect(
    page.getByRole("gridcell", { name: /Lane 1, tile 1, Astro Joe/ }),
  ).toBeAttached();
  expect(errors).toEqual([]);
});

test("slow artwork pauses live play and commits the style only after the required batch finishes", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route("**/art/astro-joe-idle.png", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Begin mission", exact: true })
    .click();
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
    .click();
  await page.locator("#art-toggle").click();
  await expect(page.locator("#asset-dialog")).toBeVisible();
  const bank = await page.locator("#credits").innerText();
  await page.waitForTimeout(600);
  await expect(page.locator("#credits")).toHaveText(bank);
  await expect(page.locator("html")).not.toHaveClass(/original-art/);
  await expect(page.locator("#battle-grid")).toHaveJSProperty("inert", true);
  release();
  await expect(page.locator("html")).toHaveClass(/original-art/);
  await expect(page.locator("#asset-dialog")).not.toBeVisible();
  await expect(page.locator("#battle-grid")).toHaveJSProperty("inert", false);
  await expect(
    page.getByRole("gridcell", { name: /Lane 1, tile 1, Astro Joe/ }),
  ).toBeVisible();
});

test("failed comparison can cancel or retry without resetting a paused mission", async ({
  page,
}) => {
  let fail = true;
  await page.route("**/art/astro-joe-idle.png", (route) =>
    fail ? route.abort() : route.continue(),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Begin mission", exact: true })
    .click();
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
    .click();
  await page.locator("#pause").click();
  const bank = await page.locator("#credits").innerText();
  await page.locator("#art-toggle").click();
  await expect(
    page.getByRole("heading", { name: "Artwork did not arrive." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Keep current mission", exact: true })
    .click();
  await expect(page.locator("html")).not.toHaveClass(/original-art/);
  await expect(page.locator("#credits")).toHaveText(bank);
  await page.locator("#art-toggle").click();
  await expect(
    page.getByRole("button", { name: "Retry artwork", exact: true }),
  ).toBeVisible();
  fail = false;
  await page
    .getByRole("button", { name: "Retry artwork", exact: true })
    .click();
  await expect(page.locator("html")).toHaveClass(/original-art/);
  await expect(page.locator("#credits")).toHaveText(bank);
  await expect(page.locator("#pause")).toHaveAttribute(
    "aria-label",
    "Resume mission",
  );
  await expect(
    page.getByRole("gridcell", { name: /Lane 1, tile 1, Astro Joe/ }),
  ).toBeAttached();
});

test("failed destination resources preserve the existing map and a retry prepares a fresh destination", async ({
  page,
}) => {
  let fail = true;
  await page.route("**/art/stage-two.webp", (route) =>
    fail ? route.abort() : route.continue(),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Begin mission", exact: true })
    .click();
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
    .click();
  await page.locator("#map-open").click();
  await page.locator('[data-map="bridge"]').click();
  await expect(
    page.getByRole("heading", { name: "Artwork did not arrive." }),
  ).toBeVisible();
  await expect(page.locator("#location-name")).toHaveText("The Canyon");
  await page
    .getByRole("button", { name: "Keep current mission", exact: true })
    .click();
  await expect(
    page.getByRole("gridcell", { name: /Lane 1, tile 1, Astro Joe/ }),
  ).toBeVisible();
  fail = false;
  await page.locator("#map-open").click();
  await page.locator('[data-map="bridge"]').click();
  await expect(page.locator("#asset-dialog")).not.toBeVisible();
  await expect(page.locator("#location-name")).toHaveText("Sky Bridge");
  await expect(page.locator("#credits")).toHaveText("230");
  await expect(page.locator("#start")).toHaveText(/Begin mission/);
});

test("first-play guidance distinguishes firing coverage, income timing and salvage value", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#overlay-body")).toContainText(
    "Cover all six lanes",
  );
  await page
    .getByRole("button", { name: "Begin mission", exact: true })
    .click();
  await page.locator('[data-tower="bush"]').click();
  await expect(page.locator("#selected-detail")).toContainText(
    "Gross payback 18s",
  );
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
    .click();
  await expect(page.locator("#coverage-status")).toContainText(
    "0/6 lanes firing",
  );
  await expect(page.locator("#supply-status")).toContainText("1 income unit");
  await page.locator('[data-tower="astro"]').click();
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 2, empty", exact: true })
    .click();
  await expect(page.locator("#coverage-status")).toContainText(
    "1/6 lanes firing",
  );
  await page.locator('[data-tower="falcon"]').click();
  await expect(page.locator("#selected-detail")).toContainText(
    /Need \d+ more credits/,
  );
  await page.locator("#salvage").click();
  await page
    .getByRole("gridcell", { name: /Lane 1, tile 1, Money Bush/ })
    .focus();
  await expect(page.locator("#selected-detail")).toContainText(
    "Refund 24 credits",
  );
  await page.keyboard.press("Enter");
  await expect(page.locator("#announcement")).toContainText("for 24 credits");
});

test.describe("emulated touch", () => {
  test.use({ hasTouch: true });
  test("phone targets, far-cell placement, pan, landscape and reduced motion remain usable", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page
      .getByRole("button", { name: "Begin mission", exact: true })
      .tap();
    for (const id of [
      "art-toggle",
      "speed",
      "pause",
      "field-zoom",
      "map-open",
      "salvage",
    ]) {
      const rect = await page.locator(`#${id}`).boundingBox();
      expect(rect?.width, `${id} touch width`).toBeGreaterThanOrEqual(44);
      expect(rect?.height, `${id} touch height`).toBeGreaterThanOrEqual(44);
    }
    await page.locator("#field-zoom").tap();
    await page
      .getByRole("gridcell", { name: "Lane 6, tile 9, empty", exact: true })
      .tap();
    await expect(
      page.getByRole("gridcell", { name: /Lane 6, tile 9, Astro Joe/ }),
    ).toBeVisible();
    expect(
      await page.locator(".battle-scroll").evaluate((el) => el.scrollLeft),
    ).toBeGreaterThan(0);
    await page.locator("#field-zoom").tap();
    await page.locator('[data-tower="falcon"]').tap();
    await expect(page.locator("#selected-detail")).toContainText(
      "Millennium Falcon",
    );
    await page.locator("#motion-toggle").tap();
    await expect(page.locator("html")).toHaveClass(/reduced-motion/);
    await page.setViewportSize({ width: 844, height: 390 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.locator("#pause").tap();
    await expect(page.locator("#start")).toHaveText(/Resume mission/);
    await page.locator("#pause").tap();
    await page.locator("#restart").tap();
    await page.locator("#restart-confirm").tap();
    await expect(page.locator("#credits")).toHaveText("230");
    expect(errors).toEqual([]);
  });
});

test("audio can be enabled and disabled by a user gesture", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  await page.locator("#sound-toggle").click();
  await expect(page.locator("#sound-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page
    .getByRole("button", { name: "Begin mission", exact: true })
    .click();
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
    .click();
  await page.locator("#sound-toggle").click();
  await expect(page.locator("#sound-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  expect(errors).toEqual([]);
});

test("mission receipts explain actual spending and reset with the mission", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Begin mission", exact: true })
    .click();
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
    .click();
  await page.locator("#speed").click();
  await expect(
    page.getByRole("button", { name: "Play again", exact: true }),
  ).toBeVisible({ timeout: 35000 });
  await expect(page.locator("#mission-receipt")).toBeVisible();
  await page.locator("#mission-receipt summary").click();
  await expect(page.locator("#receipt-summary")).toContainText("1 deployed");
  await expect(page.locator("#receipt-summary")).toContainText("50 spent");
  await expect(page.locator("#receipt-sources")).toContainText(
    "Started with 230.",
  );
  await page.locator("#start").click();
  await expect(page.locator("#mission-receipt")).not.toBeVisible();
  await expect(page.locator("#credits")).toHaveText("230");
});

test("repeated presentation and mission lifecycles retain one canvas and working controls", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Begin mission", exact: true })
    .click();
  for (let cycle = 0; cycle < 3; cycle++) {
    await page.locator("#pause").click();
    await page.locator("#art-toggle").click();
    await expect(page.locator("html")).toHaveClass(/original-art/);
    await page.locator("#art-toggle").click();
    await expect(page.locator("html")).not.toHaveClass(/original-art/);
    await page.locator("#motion-toggle").click();
    await page.locator("#motion-toggle").click();
    await page.locator("#pause").click();
    await page
      .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
      .click();
    await page.locator("#restart").click();
    await page.locator("#restart-confirm").click();
    await page.locator("#start").click();
  }
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator("#credits")).toHaveText("230");
  await page.screenshot({ path: info.outputPath("engine-presentation.png") });
  expect(errors).toEqual([]);
});

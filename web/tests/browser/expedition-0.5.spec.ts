import { test, expect } from "@playwright/test";
import { TOWERS } from "../../src/game/content";
import type { TowerKind } from "../../src/game/content";
import { EXPEDITION_TOWERS, EXPEDITION_ENEMIES } from "../../src/game/art";

test("ordinary dialogs never resume a mission after backgrounding", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#start").click();
  for (const [opener, dialog, closer] of [
    ["#play-guide", "#guide-dialog", "[aria-label='Close field guide']"],
    ["#map-open", "#map-dialog", "[aria-label='Close destinations']"],
    ["#restart", "#restart-dialog", "#restart-cancel"],
    ["#audio-mix", "#audio-settings", "[aria-label='Close Audio Volume controls']"],
    ["#credits-open", "#credits-dialog", "[aria-label='Close credits']"],
  ]) {
    if (opener === "#credits-open") await page.locator("#focus-toggle").click();
    await page.locator(opener).click();
    await expect(page.locator(dialog)).toBeVisible();
    const credits = await page.locator("#credits").innerText();
    // Emulate document visibility, not the authoritative game state or clock.
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: false,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.locator(dialog).locator(closer).click();
    await expect(page.locator("#status")).toHaveText("Mission paused");
    await page.waitForTimeout(300);
    await expect(page.locator("#credits")).toHaveText(credits);
    await page.locator("#pause").click();
    await expect(page.locator("#status")).toHaveText("Mission in progress");
  }
  await page.locator("#guide-open").click();
  // The close handler also guards visibility at the actual point of resumption.
  await page.evaluate(() =>
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    }),
  );
  await page.locator("#guide-dialog").press("Escape");
  await expect(page.locator("#status")).toHaveText("Mission paused");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("#status")).toHaveText("Mission paused");
});

test("slow initial artwork reports file progress and keeps play disabled until ready", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/art/expedition/money-tree.webp", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#start")).toBeDisabled();
  await expect(page.locator("#start")).toContainText("Loading artwork");
  await expect(page.locator("#map-open")).toBeDisabled();
  await expect(page.locator("#art-toggle")).toBeDisabled();
  release();
  await expect(page.locator("#start")).toHaveText(/Begin mission/);
  await expect(page.locator("#start")).toBeEnabled();
});

test("complete illustrated roster defers school sheets and preserves acid restrictions across all scenery", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) =>
    requests.push(new URL(request.url()).pathname),
  );
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  for (const art of [
    ...Object.values(EXPEDITION_TOWERS),
    ...Object.values(EXPEDITION_ENEMIES),
  ])
    expect(requests).toContain(`/art/${art.file}`);
  expect(
    requests.some((url) => /-(idle|fire|walk|attack|die)\.png$/.test(url)),
  ).toBe(false);
  expect(requests).not.toContain("/art/expedition/sky-bridge.webp");
  expect(requests).not.toContain("/art/expedition/nest.webp");
  for (const [map, blocked] of [
    ["canyon", 0],
    ["bridge", 12],
    ["nest", 16],
  ] as const) {
    await page.locator("#map-open").click();
    await page.locator(`[data-map="${map}"]`).click();
    await page.locator("#start").click();
    await expect(page.locator(".blocked-cell")).toHaveCount(blocked);
    const restrictions = await page
      .locator(".blocked-cell")
      .evaluateAll((cells) =>
        cells.map((cell) => cell.getAttribute("aria-label")),
      );
    if (blocked) {
      await page.locator(".blocked-cell").first().click();
      await expect(page.locator("#announcement")).toContainText(
        "Acid pool. Defenders cannot deploy on this tile.",
      );
      await expect(page.locator("#credits")).toHaveText("230");
    }
    await page.locator("#pause").click();
    const bank = await page.locator("#credits").innerText();
    await page.locator("#art-toggle").click();
    await expect(page.locator("html")).toHaveClass(/original-art/);
    expect(
      await page
        .locator(".blocked-cell")
        .evaluateAll((cells) =>
          cells.map((cell) => cell.getAttribute("aria-label")),
        ),
    ).toEqual(restrictions);
    await page.locator("#art-toggle").click();
    await expect(page.locator("html")).not.toHaveClass(/original-art/);
    await expect(page.locator("#credits")).toHaveText(bank);
    await expect(page.locator("#status")).toHaveText("Mission paused");
  }
  for (const unit of Object.values(TOWERS))
    expect(requests).toContain(`/art/${unit.sprite}-idle.png`);
});

test("phone controls and the complete roster remain reachable under enlarged page content", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  // CSS zoom is a repeatable layout stress test, not a native mobile text-size claim.
  await page.addStyleTag({ content: "html { zoom: 1.5; }" });
  await expect(page.locator("#start")).toBeEnabled();
  const widths = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
  const controlsFit = await page.evaluate(() => {
    const board = document
      .querySelector(".board-stack")!
      .getBoundingClientRect();
    const start = document.querySelector("#start")!.getBoundingClientRect();
    const strip = document
      .querySelector(".threat-strip")!
      .getBoundingClientRect();
    const zoomButton = document.querySelector("#field-zoom")!;
    const zoom = zoomButton.getBoundingClientRect();
    return {
      start: start.top >= board.top && start.bottom <= board.bottom,
      enlarge: zoom.left >= strip.left && zoom.right <= strip.right,
      enlargeLabel: zoomButton.scrollWidth <= zoomButton.clientWidth,
    };
  });
  expect(controlsFit).toEqual({
    start: true,
    enlarge: true,
    enlargeLabel: true,
  });
  for (const [kind, unit] of Object.entries(TOWERS)) {
    await page.locator(`[data-tower="${kind}"]`).click();
    await expect(page.locator("#selected-detail")).toContainText(unit.name);
  }
  await page.screenshot({
    path: info.outputPath("phone-enlarged-content.png"),
    fullPage: true,
  });
  await page.locator('[data-tower="astro"]').click();
  await page.locator("#start").click();
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
    .click();
  await page.locator("#pause").click();
  await expect(page.locator("#status")).toHaveText("Mission paused");
  await page.locator("#restart").click();
  await page.locator("#restart-confirm").click();
  await expect(page.locator("#credits")).toHaveText("230");
});

for (const map of ["canyon", "bridge", "nest"] as const) {
  test(`all nine illustrated defenders form a winning mixed deployment on ${map}`, async ({
    page,
  }, info) => {
    test.setTimeout(150_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.goto("/");
    if (map !== "canyon") {
      await page.locator("#map-open").click();
      await page.locator(`[data-map="${map}"]`).click();
    }
    await page.locator("#start").click();
    await page.locator("#speed").click();
    const buy = async (kind: TowerKind, row: number, col?: number) => {
      await expect
        .poll(async () => Number(await page.locator("#credits").innerText()), {
          timeout: 30_000,
        })
        .toBeGreaterThanOrEqual(TOWERS[kind].cost);
      await expect(page.locator("#status")).toHaveText("Mission in progress");
      await page.locator(`[data-tower="${kind}"]`).click();
      await page
        .getByRole("gridcell", {
          name:
            col === undefined
              ? new RegExp(`^Lane ${row}, tile [0-9]+, empty$`)
              : `Lane ${row}, tile ${col}, empty`,
          exact: col !== undefined,
        })
        .first()
        .click();
    };
    await buy("bush", 1, map === "nest" ? 3 : 1);
    await buy("bush", 2, map === "nest" ? 3 : 1);
    for (let row = 1; row <= 6; row++)
      await buy("astro", row, map === "nest" ? 1 : row <= 3 ? 2 : 1);
    for (let row = 1; row <= 6; row++)
      await buy(
        "zeus",
        row,
        map === "nest" ? [5, 4, 4, 4, 3, 3][row - 1] : row <= 3 ? 3 : 2,
      );
    await buy("tars", 6);
    await buy("tree", map === "nest" ? 4 : 3, map === "nest" ? 3 : 1);
    await buy("falcon", 3);
    await buy("explosive", 5);
    await buy("startrell", 2);
    await buy("wall", 1);
    for (const unit of Object.values(TOWERS))
      await expect(
        page
          .getByRole("gridcell", { name: new RegExp(`, ${unit.name},`) })
          .first(),
      ).toBeAttached();
    await page.screenshot({
      path: info.outputPath(`${map}-mixed-expedition.png`),
      fullPage: true,
    });
    await page.locator("#pause").click();
    const deployment = await page
      .locator(".field-cell")
      .evaluateAll((cells) =>
        cells.map((cell) => cell.getAttribute("aria-label")),
      );
    expect(deployment).toHaveLength(54);
    const credits = await page.locator("#credits").innerText();
    await page.locator("#art-toggle").click();
    await expect(page.locator("html")).toHaveClass(/original-art/);
    expect(
      await page
        .locator(".field-cell")
        .evaluateAll((cells) =>
          cells.map((cell) => cell.getAttribute("aria-label")),
        ),
    ).toEqual(deployment);
    await page.locator("#art-toggle").click();
    await expect(page.locator("html")).not.toHaveClass(/original-art/);
    await expect(page.locator("#credits")).toHaveText(credits);
    await page.locator("#pause").click();
    await expect(page.locator("#status")).toHaveText("Outpost secured", {
      timeout: 90_000,
    });
    await page.locator("#mission-receipt summary").click();
    await expect(page.locator("#receipt-summary")).toContainText("20 deployed");
    await expect(page.locator("#receipt-spent")).toHaveText("1865");
    expect(
      Number(await page.locator("#receipt-growth").innerText()),
    ).toBeGreaterThan(0);
    const transactions = await page
      .locator("#receipt-sources tbody td")
      .allTextContents();
    expect(
      transactions.reduce(
        (total, value) => total + Number(value.replace("−", "-")),
        230,
      ),
    ).toBe(Number(await page.locator("#receipt-balance").innerText()));
    expect(errors).toEqual([]);
  });
}

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { TOWERS, isBlocked } from "../../src/game/content";
import type { TowerKind } from "../../src/game/content";
import { CAMPAIGN_ORDER, MISSIONS } from "../../src/game/missions";
import type { MissionId } from "../../src/game/missions";

async function openBoard(page: Page) {
  const campaign = await page.locator("#map-open").innerText();
  if (campaign.includes("Mission control"))
    await page.locator("#map-open").click();
  else if (await page.locator("#campaign-nav").isVisible())
    await page.locator("#campaign-nav").click();
  else {
    await page.locator("#map-open").click();
    await page.locator("#campaign-switch").click();
  }
  await expect(page.locator("#campaign-dialog")).toBeVisible();
}
async function prepare(page: Page, id: MissionId) {
  await page.locator(`[data-review="${id}"]`).click();
  await expect(page.locator("#briefing-title")).toHaveText(MISSIONS[id].title);
  await expect(page.locator("#briefing-title")).toBeFocused();
  await page.locator("#campaign-launch").click();
  await expect(page.locator("#asset-dialog")).not.toBeVisible();
  await expect(page.locator("#location-name")).toHaveText(MISSIONS[id].title);
  await expect(page.locator("#start")).toBeFocused();
}
const saved = (ids: readonly MissionId[]) => ({
  version: 1,
  best: Object.fromEntries(
    ids.map((id) => [id, { stars: 3, shields: 3, duration: 100, kills: 33 }]),
  ),
});
async function fixture(page: Page, ids: readonly MissionId[]) {
  await page.addInitScript((data) => {
    localStorage.setItem("ava-campaign", JSON.stringify(data));
  }, saved(ids));
}

test("campaign board exposes six missions, lock reasons, briefings and keyboard navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  await openBoard(page);
  await expect(page.locator("[data-mission-card]")).toHaveCount(6);
  await expect(page.locator("[data-review]:disabled")).toHaveCount(5);
  await expect(page.locator("#state-canyon-escalation")).toContainText(
    "Complete First Contact",
  );
  await expect(page.locator("#campaign-progress")).toContainText(
    "0 / 6 missions complete",
  );
  await page.locator('[data-review="first-contact"]').press("Enter");
  await expect(page.locator("#briefing-title")).toBeFocused();
  await page.locator("#campaign-back").press("Enter");
  await expect(page.locator('[data-review="first-contact"]')).toBeFocused();
  await prepare(page, "first-contact");
  await expect(page.locator("#overlay-title")).toHaveText("First Contact");
  expect(
    await page.evaluate(() => localStorage.getItem("ava-campaign")),
  ).toBeNull();
  await page.locator("#start").press("Enter");
  await expect(
    page.getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#credits")).toHaveText("180");
  await page.keyboard.press("p");
  await expect(page.locator("#status")).toHaveText("Mission paused");
});

test("public-control expedition completes all six missions, persists stars, replays and preserves a lost replay", async ({
  page,
}, info) => {
  test.setTimeout(1_200_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const artRequests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/art/")) artRequests.push(r.url());
  });
  await page.setViewportSize({ width: 1000, height: 1000 });
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  await openBoard(page);
  for (const [index, id] of CAMPAIGN_ORDER.entries()) {
    const before = artRequests.length;
    await prepare(page, id);
    if (index === 1) expect(artRequests.slice(before)).toEqual([]); // Same Canyon textures and thumbnails are reused.
    await page.locator("#start").click();
    await page.locator("#speed").click();
    const map = MISSIONS[id].environment;
    const columns = Array.from({ length: 6 }, (_, row) =>
      Array.from({ length: 9 }, (_, col) => col).filter(
        (col) => !isBlocked(map, row, col),
      ),
    );
    const buy = async (kind: TowerKind, row: number, col: number) => {
      await expect
        .poll(async () => Number(await page.locator("#credits").innerText()), {
          timeout: 45000,
        })
        .toBeGreaterThanOrEqual(TOWERS[kind].cost);
      await expect(page.locator("#status")).toHaveText("Mission in progress");
      await page.locator(`[data-tower="${kind}"]`).click();
      await page
        .getByRole("gridcell", {
          name: `Lane ${row + 1}, tile ${col + 1}, empty`,
          exact: true,
        })
        .click();
    };
    for (let row = 0; row < 2; row++) await buy("bush", row, columns[row][1]);
    for (const [rank, kind] of (["astro", "zeus", "tars"] as const).entries())
      for (let row = 0; row < 6; row++) {
        const legal = columns[row].filter(
          (col) => !(row < 2 && col === columns[row][1]),
        );
        await buy(kind, row, legal[rank]);
      }
    await expect(page.locator("#status")).toHaveText("Outpost secured", {
      timeout: 180000,
    });
    await expect(page.locator("#mission-rating")).toContainText(
      "3/3 stars · Best: 3/3",
    );
    await expect(page.locator("#mode-label")).toHaveText("Campaign");
    await expect(page.locator("#start")).toHaveAccessibleDescription(
      /3 shields remaining.*3\/3 stars/,
    );
    if (index < 5)
      await expect(page.locator("#campaign-next")).toHaveText(
        `Next: ${MISSIONS[CAMPAIGN_ORDER[index + 1]].title}`,
      );
    await expect(page.locator("#overlay-title")).toHaveText(
      `${MISSIONS[id].title} complete.`,
    );
    if (index === 0) {
      for (const viewport of [
        { width: 390, height: 844 },
        { width: 844, height: 390 },
      ]) {
        await page.setViewportSize(viewport);
        expect(
          await page
            .locator("#overlay")
            .evaluate((frame) => getComputedStyle(frame).overflowY),
        ).toBe("auto");
        for (const control of [
          "#start",
          "#campaign-next",
          "#campaign-return",
        ]) {
          await page.locator(control).scrollIntoViewIfNeeded();
          await expect(page.locator(control)).toBeInViewport();
        }
      }
      await page.setViewportSize({ width: 1000, height: 1000 });
    }
    await page.locator("#mission-receipt summary").click();
    const transactions = await page
      .locator("#receipt-sources tbody td")
      .allTextContents();
    expect(
      transactions.reduce((n, v) => n + Number(v.replace("−", "-")), 230),
    ).toBe(Number(await page.locator("#receipt-balance").innerText()));
    await page.screenshot({
      path: info.outputPath(`${id}-victory.png`),
      fullPage: true,
    });
    const progress = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("ava-campaign")!),
    );
    expect(Object.keys(progress.best)).toHaveLength(index + 1);
    expect(progress.best[id].stars).toBe(3);
    await expect(page.locator("canvas")).toHaveCount(1);
    const enlarged =
      index === 0
        ? await page.addStyleTag({ content: "html { zoom: 1.5; }" })
        : null;
    if (index === 0) {
      await page.setViewportSize({ width: 390, height: 844 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.locator("#campaign-next").scrollIntoViewIfNeeded();
      await expect(page.locator("#campaign-next")).toBeInViewport();
      await page.screenshot({
        path: info.outputPath("campaign-phone-result.png"),
        fullPage: true,
      });
    }
    if (index < 5) {
      await page.locator("#campaign-next").click();
      await expect(page.locator("#briefing-title")).toHaveText(
        MISSIONS[CAMPAIGN_ORDER[index + 1]].title,
      );
      if (enlarged) {
        await enlarged.evaluate((style) =>
          style.parentNode?.removeChild(style),
        );
        await page.setViewportSize({ width: 1000, height: 1000 });
      }
      await page.locator("#campaign-back").click();
      await expect(
        page.locator(`[data-review="${CAMPAIGN_ORDER[index + 1]}"]`),
      ).toBeEnabled();
    } else {
      await expect(page.locator("#campaign-next")).toBeHidden();
      await page.locator("#campaign-return").click();
    }
  }
  await expect(page.locator("#campaign-progress")).toContainText(
    "6 / 6 missions complete · 18 / 18 stars",
  );
  await page.screenshot({
    path: info.outputPath("chapter-complete-board.png"),
    fullPage: true,
  });
  await page.reload();
  await expect(page.locator("#start")).toBeEnabled();
  await openBoard(page);
  await expect(page.locator("#campaign-progress")).toContainText(
    "18 / 18 stars",
  );
  await prepare(page, "first-contact");
  await page.locator("#start").click();
  await page.locator("#speed").click();
  await expect(page.locator("#status")).toHaveText("Signal lost", {
    timeout: 45000,
  });
  await expect(page.locator("#mission-rating")).toContainText(
    "0/3 stars · Best: 3/3",
  );
  await expect(page.locator("#campaign-next")).toBeHidden();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("ava-campaign")!).best["first-contact"]
          .stars,
    ),
  ).toBe(3);
  expect(errors).toEqual([]);
});

test("active campaign navigation is explicit and backgrounded dialogs never auto-resume", async ({
  page,
}) => {
  await fixture(page, ["first-contact"]);
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  await openBoard(page);
  await prepare(page, "first-contact");
  await page.locator("#start").click();
  await page.keyboard.press("Enter");
  await openBoard(page);
  await expect(page.locator("#campaign-active-note")).toContainText(
    "is paused",
  );
  const bank = await page.locator("#credits").innerText();
  await page.locator('[data-review="canyon-escalation"]').click();
  await expect(page.locator("#campaign-launch")).toContainText(
    "Abandon current mission",
  );
  await page.locator("#campaign-dialog").press("Escape");
  await expect(page.locator("#credits")).toHaveText(bank);
  await expect(page.locator("#status")).toHaveText("Mission in progress");
  await openBoard(page);
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
  await page.locator("#campaign-standalone").click();
  await page.locator("#map-dialog").press("Escape");
  await expect(page.locator("#status")).toHaveText("Mission paused");
  await openBoard(page);
  await prepare(page, "canyon-escalation");
  await expect(page.locator("#credits")).toHaveText("230");
  await expect(page.locator("#status")).toHaveText("Awaiting your command");
});

test("campaign reset requires confirmation and isolates motion and other browser data", async ({
  page,
}, info) => {
  test.setTimeout(90_000);
  await fixture(page, ["first-contact", "canyon-escalation"]);
  await page.addInitScript(() => {
    localStorage.setItem("ava-reduced-motion", "true");
    localStorage.setItem("unrelated-demo", "keep");
  });
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  await openBoard(page);
  await page.locator("#campaign-reset").click();
  await expect(page.locator("#campaign-reset-cancel")).toBeFocused();
  await page.locator("#campaign-reset-dialog").press("Escape");
  await expect(page.locator("#campaign-progress")).toContainText(
    "2 / 6 missions complete",
  );
  await prepare(page, "first-contact");
  await page.locator("#start").click();
  await page.locator("#speed").click();
  await expect(page.locator("#status")).toHaveText("Signal lost", {
    timeout: 45_000,
  });
  await expect(page.locator("#mission-rating")).toContainText("Best: 3/3");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page
      .locator("#overlay")
      .evaluate((frame) => getComputedStyle(frame).overflowY),
  ).toBe("auto");
  for (const control of ["#start", "#campaign-return"]) {
    await page.locator(control).scrollIntoViewIfNeeded();
    await expect(page.locator(control)).toBeInViewport();
  }
  await page.screenshot({
    path: info.outputPath("campaign-phone-collapsed-defeat.png"),
    fullPage: true,
  });
  await page.locator("#campaign-return").click();
  await page.locator("#campaign-reset").click();
  await page.locator("#campaign-reset-confirm").click();
  await expect(page.locator("#campaign-reset")).toBeFocused();
  await expect(page.locator("#campaign-progress")).toContainText("0 / 6");
  expect(
    await page.evaluate(() => ({
      campaign: localStorage.getItem("ava-campaign"),
      motion: localStorage.getItem("ava-reduced-motion"),
      other: localStorage.getItem("unrelated-demo"),
    })),
  ).toEqual({ campaign: null, motion: "true", other: "keep" });
  await page.locator("#campaign-dialog").press("Escape");
  await expect(page.locator("#mission-rating")).toContainText("Best: 0/3");
});

test("blocked storage warns without interrupting campaign deployment", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked for regression");
      },
    }),
  );
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  await expect(page.locator("#save-warning")).toContainText(
    "saving is unavailable",
  );
  await openBoard(page);
  await expect(page.locator("#campaign-save-warning")).toContainText(
    "stays in this tab",
  );
  await prepare(page, "first-contact");
  await page.locator("#start").click();
  await page.keyboard.press("Enter");
  await expect(page.locator("#credits")).toHaveText("180");
  await page.locator("#pause").click();
  await expect(page.locator("#save-warning")).toContainText(
    "saving is unavailable",
  );
});

test("partial corruption recovers valid stars and preserves the damaged original", async ({
  page,
}) => {
  const raw = JSON.stringify({
    version: 1,
    best: {
      "first-contact": { stars: 2, shields: 2, duration: 80, kills: 33 },
      invalid: { stars: 5 },
    },
  });
  await page.addInitScript(
    (raw) => localStorage.setItem("ava-campaign", raw),
    raw,
  );
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  await openBoard(page);
  await expect(page.locator("#campaign-progress")).toContainText(
    "1 / 6 missions complete · 2 / 18 stars",
  );
  await expect(page.locator("#campaign-save-warning")).toContainText(
    "Recovered valid",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("ava-campaign-recovery")),
  ).toBe(raw);
});

test("mission transitions retain the current campaign on failed artwork, support retry and stay paused after absence", async ({
  page,
}) => {
  await fixture(page, CAMPAIGN_ORDER.slice(0, 5));
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  await openBoard(page);
  await prepare(page, "canyon-escalation");
  await page.locator("#start").click();
  await page.keyboard.press("Enter");
  const bank = await page.locator("#credits").innerText();
  await page.route("**/art/expedition/nest.webp", (route) => route.abort());
  await openBoard(page);
  await page.locator('[data-review="heart-of-the-swarm"]').click();
  await page.locator("#campaign-launch").click();
  await expect(page.locator("#asset-retry")).toBeVisible();
  await page.locator("#asset-cancel").click();
  await expect(page.locator("#location-name")).toHaveText("Canyon Escalation");
  await expect(page.locator("#credits")).toHaveText(bank);
  await openBoard(page);
  await page.locator('[data-review="heart-of-the-swarm"]').click();
  await page.locator("#campaign-launch").click();
  await expect(page.locator("#asset-retry")).toBeVisible();
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
  await page.unroute("**/art/expedition/nest.webp");
  await page.locator("#asset-retry").click();
  await expect(page.locator("#location-name")).toHaveText("Heart of the Swarm");
  await expect(page.locator("#status")).toHaveText("Awaiting your command");
  await expect(page.locator(".blocked-cell")).toHaveCount(16);
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 844, height: 390 },
])
  test(`campaign phone ${viewport.width}x${viewport.height} supports cards, enlarged content, briefing and reset`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("#start")).toBeEnabled();
    await page.addStyleTag({ content: "html { zoom: 1.5; }" });
    await openBoard(page);
    await expect(page.locator("[data-review]:disabled")).toHaveCount(5);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const overflow = await page
      .locator("#campaign-dialog")
      .evaluate((dialog) => ({
        fits: dialog.scrollWidth <= dialog.clientWidth,
        scrolls: dialog.scrollHeight > dialog.clientHeight,
        inViewport:
          dialog.getBoundingClientRect().top >= 0 &&
          dialog.getBoundingClientRect().bottom <= innerHeight,
      }));
    expect(overflow).toEqual({ fits: true, scrolls: true, inViewport: true });
    await page.screenshot({
      path: info.outputPath("campaign-phone.png"),
      fullPage: true,
    });
    await page.locator('[data-review="first-contact"]').click();
    await expect(page.locator("#briefing-title")).toBeFocused();
    const launch = await page
      .locator("#campaign-launch")
      .evaluate((button) => ({
        height: button.getBoundingClientRect().height,
        fit: button.scrollWidth <= button.clientWidth,
      }));
    expect(launch.height).toBeGreaterThanOrEqual(66);
    expect(launch.fit).toBe(true);
    await page.locator("#campaign-reset").click();
    await expect(page.locator("#campaign-reset-dialog")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator("#campaign-reset-cancel").click();
    await page.locator("#campaign-launch").click();
    await expect(page.locator("#location-name")).toHaveText("First Contact");
  });

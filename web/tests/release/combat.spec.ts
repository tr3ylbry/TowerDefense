import { test, expect } from "@playwright/test";
import { TOWERS } from "../../src/game/content";
import type { TowerKind } from "../../src/game/content";
for (const {map, hard} of [
  {map:"canyon",hard:false}, {map:"bridge",hard:false}, {map:"nest",hard:false},
  {map:"canyon",hard:true},
] as const) {
  test(`release mixed roster wins with all five new projectile families on ${map}${hard ? " Hard" : " Normal"}`, async ({
    page,
  }, info) => {
    test.setTimeout(150_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.goto("/");
    if (hard) {
      await page.locator("#campaign-nav").click();
      await page.locator('[data-review="first-contact"]').click();
      await expect(page.getByLabel("Difficulty", {exact:true})).toHaveValue("normal");
      await page.getByLabel("Difficulty", {exact:true}).selectOption("hard");
      await page.locator("#campaign-launch").click();
    } else if (map !== "canyon") {
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
    // Expedition-only: compare stable public state while paused, without offering Original art.
    expect(await page.locator("#art-toggle").count()).toBe(0);
    await page.locator("#motion-toggle").click();
    for (const viewport of [{width:390,height:844},{width:844,height:390}]) {
      await page.setViewportSize(viewport);
      await expect(page.locator("canvas")).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.screenshot({path:info.outputPath(`${map}-${hard ? "hard" : "normal"}-reduced-${viewport.width}.png`),fullPage:true});
    }
    await page.setViewportSize({width:1280,height:1000});
    await page.locator("#motion-toggle").click();
    await expect(page.locator("#credits")).toHaveText(credits);
    expect(await page.locator(".field-cell").evaluateAll(cells => cells.map(cell => cell.getAttribute("aria-label")))).toEqual(deployment);
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
    if (hard) {
      expect(await page.evaluate(() => localStorage.getItem("ava-campaign"))).toBeNull();
      await expect(page.locator("#overlay-title")).toHaveText("First Contact · Hard secured.");
      await expect(page.locator("#mission-rating")).toBeHidden();
      await expect(page.locator("#campaign-next")).toBeHidden();
    }
    expect(errors).toEqual([]);
  });
}

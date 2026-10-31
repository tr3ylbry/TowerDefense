import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

async function expectCrewLayout(page: Page) {
  for (const width of [1280, 900, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const cards = await page.locator(".crew-card").evaluateAll((elements) => {
      const rect = (element: Element) => {
        const r = element.getBoundingClientRect();
        return {
          left: r.left,
          top: r.top,
          right: r.right,
          bottom: r.bottom,
          height: r.height,
        };
      };
      return elements.map((card) => ({
        card: rect(card),
        image: rect(card.querySelector(".portrait")!),
        name: rect(card.querySelector(".crew-info strong")!),
        price: rect(card.querySelector(".crew-price")!),
        cost: rect(card.querySelector(".crew-cost")!),
        textFits: [".crew-info strong", ".crew-cost"].every((selector) => {
          const element = card.querySelector(selector)!;
          return element.scrollWidth <= element.clientWidth;
        }),
      }));
    });
    expect(cards).toHaveLength(9);
    const first = cards[0];
    for (const item of cards) {
      expect(item.textFits).toBe(true);
      expect(Math.abs(item.card.height - first.card.height)).toBeLessThan(1);
      expect(
        Math.abs(
          item.name.top - item.card.top - (first.name.top - first.card.top),
        ),
      ).toBeLessThan(1);
      expect(
        Math.abs(
          item.cost.top - item.card.top - (first.cost.top - first.card.top),
        ),
      ).toBeLessThan(1);
      expect(item.image.right).toBeLessThanOrEqual(item.price.left);
      expect(item.name.top).toBeGreaterThanOrEqual(
        Math.max(item.image.bottom, item.price.bottom),
      );
      for (const part of [item.image, item.name, item.price, item.cost]) {
        expect(part.left).toBeGreaterThanOrEqual(item.card.left);
        expect(part.right).toBeLessThanOrEqual(item.card.right);
        expect(part.top).toBeGreaterThanOrEqual(item.card.top);
        expect(part.bottom).toBeLessThanOrEqual(item.card.bottom);
      }
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 });
}

test("late legal deployment explains passed direct fire, supports rescue, and clears on restart", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#start").click();
  // Earn the setup credits with the public 2× control, then test at normal speed.
  await page.locator("#speed").click();
  await expect
    .poll(async () => Number(await page.locator("#credits").innerText()), {
      timeout: 30000,
    })
    .toBeGreaterThanOrEqual(350);
  await page.locator("#speed").click();
  // This live-region message may correctly be replaced by the next wave notice.
  // Observe its emission rather than assuming it remains the latest announcement.
  const placementFeedback = page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        const announcement = document.querySelector("#announcement")!;
        const observer = new MutationObserver(() => {
          const text = announcement.textContent ?? "";
          if (text.includes("Deployment is still allowed")) {
            observer.disconnect();
            resolve(text);
          }
        });
        observer.observe(announcement, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }),
  );
  for (let row = 1; row <= 6; row++)
    await page
      .getByRole("gridcell", {
        name: `Lane ${row}, tile 9, empty`,
        exact: true,
      })
      .click();
  await expect(page.locator("#passed-threat")).toBeVisible();
  await expect(page.locator("#coverage-status")).toContainText("lanes armed");
  await expect(page.locator("#coverage-status")).toContainText("Past guns");
  expect(await placementFeedback).toContain("Deployment is still allowed");
  await expect(
    page.getByRole("gridcell", { name: /Lane 6, tile 9, Astro Joe/ }),
  ).toBeVisible();
  await expect(page.locator("#direction-help")).toHaveAttribute("open", "");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const explanation = page.locator("#direction-help summary");
  expect((await explanation.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.locator("#direction-help summary").click();
  await expect(page.locator("#direction-help")).not.toHaveAttribute("open", "");
  await explanation.press("Enter");
  await expect(page.locator("#direction-help")).toHaveAttribute("open", "");
  await explanation.press("Enter");
  await expect(page.locator("#direction-help")).not.toHaveAttribute("open", "");
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
    .click();
  await expect(page.locator("#passed-summary")).not.toContainText("L1:");
  await page.locator("#pause").click();
  const advice = await page.locator("#passed-summary").innerText();
  await page.waitForTimeout(400);
  await expect(page.locator("#passed-summary")).toHaveText(advice);
  await page.locator("#restart").click();
  await page.locator("#restart-confirm").click();
  await expect(page.locator("#passed-threat")).toBeHidden();
  await expect(page.locator("#direction-help")).not.toHaveAttribute("open", "");
});

test("Nest advertises paired relays before an optional early call", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#map-open").click();
  await page.locator('[data-map="nest"]').click();
  await page.locator("#start").click();
  await page.locator("#speed").click();
  for (let row = 1; row <= 6; row++) {
    await expect
      .poll(async () => Number(await page.locator("#credits").innerText()))
      .toBeGreaterThanOrEqual(50);
    await page
      .getByRole("gridcell", {
        name: `Lane ${row}, tile 1, empty`,
        exact: true,
      })
      .click();
  }
  await expect(page.locator("#call-wave")).toBeEnabled();
  await page.locator("#call-wave").click();
  await expect(page.locator("#wave-tactic")).toContainText("Paired lane relay");
  await expect(page.locator("#wave-tactic")).toContainText("hold a reserve");
  await page.locator("#pause").click();
  await expect(page.locator("#call-wave")).toBeDisabled();
});

test("new defender illustrations defer their school sheets and preserve deployments across comparison", async ({
  page,
}, info) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(new URL(r.url()).pathname));
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  for (const name of ["money-bush", "asteroid", "moon-zeus"]) {
    expect(requests).toContain(`/art/expedition/${name}.webp`);
    expect(requests).not.toContain(`/art/${name}-idle.png`);
  }
  await expectCrewLayout(page);
  await page
    .locator(".crew-list")
    .screenshot({ path: info.outputPath("crew-cards-expedition.png") });
  await page.locator("#start").click();
  for (const [kind, row] of [
    ["bush", 1],
    ["wall", 2],
    ["zeus", 3],
  ] as const) {
    await page.locator(`[data-tower="${kind}"]`).click();
    await page
      .getByRole("gridcell", {
        name: `Lane ${row}, tile 1, empty`,
        exact: true,
      })
      .click();
  }
  await page.locator("#pause").click();
  const credits = await page.locator("#credits").innerText();
  await page.locator("#art-toggle").click();
  await expect(page.locator("html")).toHaveClass(/original-art/);
  await expectCrewLayout(page);
  await page
    .locator(".crew-list")
    .screenshot({ path: info.outputPath("crew-cards-original.png") });
  for (const name of ["money-bush", "asteroid", "moon-zeus"])
    expect(requests).toContain(`/art/${name}-idle.png`);
  await page.locator("#art-toggle").click();
  await expect(page.locator("html")).not.toHaveClass(/original-art/);
  await expect(page.locator("#credits")).toHaveText(credits);
  await expect(
    page.getByRole("gridcell", { name: /Lane 3, tile 1, Moon Zeus/ }),
  ).toBeAttached();
});

test("backgrounding during a slow transition requires explicit resume even after returning", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route("**/art/astro-joe-idle.png", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/");
  await page.locator("#start").click();
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
    .click();
  // Hold on the visible label while normal telemetry updates. Replacing the
  // label node between pointer-down/up used to discard this click in WebKit.
  const pauseText = (await page.locator("#pause span").boundingBox())!;
  await page.mouse.move(
    pauseText.x + pauseText.width / 2,
    pauseText.y + pauseText.height / 2,
  );
  await page.mouse.down();
  await page.waitForTimeout(1200);
  await page.mouse.up();
  await expect(page.locator("#status")).toHaveText("Mission paused");
  await page.locator("#pause").click();
  await expect(page.locator("#status")).toHaveText("Mission in progress");
  await page.locator("#art-toggle").click();
  await expect(page.locator("#asset-dialog")).toBeVisible();
  const bank = await page.locator("#credits").innerText();
  // Emulate the browser visibility API, not game state or game-clock manipulation.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  release();
  await expect(page.locator("#asset-dialog")).toBeHidden();
  await expect(page.locator("#status")).toHaveText("Mission paused");
  await page.waitForTimeout(600);
  await expect(page.locator("#credits")).toHaveText(bank);
  await expect(page.locator("#battle-grid")).toHaveJSProperty("inert", true);
  await page.locator("#pause").click();
  await expect(page.locator("#status")).toHaveText("Mission in progress");
});

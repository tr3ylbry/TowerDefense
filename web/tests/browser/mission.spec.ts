import { test, expect } from "@playwright/test";

test.afterEach(async ({ page }, info) => {
  if (info.status !== info.expectedStatus && !page.isClosed()) {
    console.info(
      "Mission failure context",
      await page.evaluate(() => ({
        status: document.querySelector("#status")?.textContent,
        announcement: document.querySelector("#announcement")?.textContent,
        overlay: document.querySelector("#overlay-title")?.textContent,
        gridInert: document.querySelector<HTMLElement>("#battle-grid")?.inert,
        visibility: document.visibilityState,
      })),
    );
  }
});

test("deploy, pause without income, salvage, and restart through real controls", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Begin mission" }).click();
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
    .click();
  await expect(
    page.getByRole("gridcell", { name: /Lane 1, tile 1, Astro Joe/ }),
  ).toBeVisible();
  await expect(page.locator("#credits")).toHaveText("180");
  await page
    .getByRole("button", { name: "Pause mission", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Take a breath, trooper." }),
  ).toBeVisible();
  await page.waitForTimeout(5500);
  await expect(page.locator("#credits")).toHaveText("180");
  await page
    .getByRole("button", { name: "Resume mission", exact: true })
    .last()
    .click();
  await expect(page.locator("#credits")).toHaveText("180");
  await page.getByRole("button", { name: /Salvage a defender/ }).click();
  await page
    .getByRole("gridcell", { name: /Lane 1, tile 1, Astro Joe/ })
    .click();
  await expect(page.locator("#credits")).toHaveText("200");
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await page.getByRole("button", { name: "Restart mission" }).click();
  await expect(
    page.getByRole("button", { name: "Begin mission" }),
  ).toBeVisible();
  await expect(page.locator("#credits")).toHaveText("230");
  await expect(
    page.getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true }),
  ).toBeAttached();
  expect(errors).toEqual([]);
});

test("keyboard crew selection and arrow-key placement", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin mission" }).click();
  await page.keyboard.press("2");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("gridcell", { name: /Lane 2, tile 2, Money Bush/ }),
  ).toBeVisible();
  await page.keyboard.press("p");
  await expect(
    page.getByRole("heading", { name: "Take a breath, trooper." }),
  ).toBeVisible();
});

test("fits a narrow viewport and persists reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Begin mission" }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Reduce decorative animation" })
    .click();
  await expect(page.locator("html")).toHaveClass(/reduced-motion/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/reduced-motion/);
  await page.getByRole("button", { name: "Begin mission" }).click();
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
    .click();
  await expect(
    page.getByRole("gridcell", { name: /Lane 1, tile 1, Astro Joe/ }),
  ).toBeVisible();
});

test("offers retry when an art resource fails to load", async ({ page }) => {
  await page.route("**/art/astro-joe-idle.png", (route) => route.abort());
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "We lost the transmission." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Retry loading" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Switch to double speed" }).click();
  await expect(
    page.getByRole("heading", { name: "We lost the transmission." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Change destination" }).click();
  await page
    .getByRole("button", { name: "Choose Sky Bridge", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Retry loading" }),
  ).toBeEnabled();
});

test("plays both restored maps, blocks acid placement, and resets a live mission safely", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Begin mission" }),
  ).toBeEnabled();
  await expect(page.locator("[data-tower]")).toHaveCount(9);
  await page.getByRole("button", { name: "Change destination" }).click();
  await page
    .getByRole("button", { name: "Choose Sky Bridge", exact: true })
    .click();
  await expect(page.locator("#location-name")).toHaveText("Sky Bridge");
  await page.getByRole("button", { name: "Begin mission" }).click();
  await expect(page.locator(".blocked-cell")).toHaveCount(12);
  await page
    .getByRole("gridcell", {
      name: "Lane 1, tile 4, acid pool, deployment blocked",
      exact: true,
    })
    .click();
  await expect(page.locator("#announcement")).toContainText("Acid pool");
  await expect(page.locator("#credits")).toHaveText("230");
  await page.keyboard.press("7");
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
    .click();
  await expect(
    page.getByRole("gridcell", { name: /Lane 1, tile 1, TARS/ }),
  ).toBeVisible();
  await page.keyboard.press("5");
  await page
    .getByRole("gridcell", { name: "Lane 2, tile 1, empty", exact: true })
    .click();
  await expect(
    page.getByRole("gridcell", { name: /Lane 2, tile 1, Explosive Astro Joe/ }),
  ).toBeVisible();
  await expect(page.locator("#credits")).toHaveText("45");
  await page.getByRole("button", { name: "Change destination" }).click();
  await expect(page.locator("#map-warning")).toContainText(
    "resets your current deployment",
  );
  await page.getByRole("button", { name: "Keep current destination" }).click();
  await expect(page.locator("#overlay")).toBeHidden();
  await expect(page.locator("#credits")).toHaveText("45");
  await page.getByRole("button", { name: "Change destination" }).click();
  await page
    .getByRole("button", { name: "Choose The Nest", exact: true })
    .click();
  await expect(page.locator("#location-name")).toHaveText("The Nest");
  await expect(page.locator("#credits")).toHaveText("230");
  await expect(
    page.getByRole("gridcell", { name: /Lane 1, tile 1, TARS/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Begin mission" }).click();
  await expect(page.locator(".blocked-cell")).toHaveCount(16);
  expect(errors).toEqual([]);
});

test("deploys the expanded crew and selects the Falcon on The Nest", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Begin mission" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Change destination" }).click();
  await page
    .getByRole("button", { name: "Choose The Nest", exact: true })
    .click();
  await page.getByRole("button", { name: "Begin mission" }).click();
  await page.keyboard.press("8");
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
    .click();
  await expect(
    page.getByRole("gridcell", { name: /Lane 1, tile 1, Money Tree/ }),
  ).toBeVisible();
  await page.keyboard.press("6");
  await page
    .getByRole("gridcell", { name: "Lane 2, tile 1, empty", exact: true })
    .click();
  await expect(
    page.getByRole("gridcell", { name: /Lane 2, tile 1, Startrell Cluggins/ }),
  ).toBeVisible();
  await page.keyboard.press("9");
  await expect(page.locator('[data-tower="falcon"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("#status")).toHaveText("Mission in progress");
  await page
    .getByRole("gridcell", { name: "Lane 3, tile 1, empty", exact: true })
    .click();
  await expect(page.locator("#announcement")).toContainText(
    "more credits for Millennium Falcon",
  );
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await page.getByRole("button", { name: "Restart mission" }).click();
  await expect(page.locator("#location-name")).toHaveText("The Nest");
  await expect(page.locator("#credits")).toHaveText("230");
  expect(errors).toEqual([]);
});

test("field guide documents all six original invaders and resumes the game", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin mission" }).click();
  await page.getByRole("button", { name: "Field guide" }).click();
  await expect(page.locator(".alien-guide article")).toHaveCount(6);
  for (const name of [
    "Little Green Men",
    "Grunt",
    "Sprinter",
    "ManHunter",
    "Tank",
    "Gargantua",
  ])
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  await page.getByRole("button", { name: "Back to the frontier" }).click();
  await expect(page.locator("#overlay")).toBeHidden();
});

test("restored roster and destinations fit a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Begin mission" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Change destination" }).click();
  await page
    .getByRole("button", { name: "Choose The Nest", exact: true })
    .click();
  await page.getByRole("button", { name: "Begin mission" }).click();
  await page.locator('[data-tower="startrell"]').click();
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
    .click();
  await expect(
    page.getByRole("gridcell", { name: /Lane 1, tile 1, Startrell Cluggins/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("focused desktop controls fit the viewport and the art comparison preserves play", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Begin mission", exact: true })
    .click();
  await expect(page.locator("body")).toHaveClass(/focused-play/);
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator("#wave-forecast")).toContainText(
    "6 Little Green Men",
  );
  const layout = await page.evaluate(() => {
    const deck = document
      .querySelector(".crew-details")!
      .getBoundingClientRect();
    const roster = document.querySelector(".crew-list")!;
    return {
      bottom: deck.bottom,
      height: innerHeight,
      allCrewVisible: roster.scrollWidth <= roster.clientWidth + 1,
    };
  });
  expect(layout.bottom).toBeLessThanOrEqual(layout.height);
  expect(layout.allCrewVisible).toBe(true);
  await page
    .getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Show original art", exact: true })
    .click();
  await expect(page.locator("html")).toHaveClass(/original-art/);
  await expect(
    page.getByRole("gridcell", { name: /Lane 1, tile 1, Astro Joe/ }),
  ).toBeVisible();
  await expect(page.locator("#credits")).toHaveText("180");
  await page
    .getByRole("button", { name: "Show expedition art", exact: true })
    .click();
  await expect(page.locator("html")).not.toHaveClass(/original-art/);
  await page.getByRole("button", { name: "Field guide", exact: true }).click();
  await expect(page.locator(".alien-guide")).toContainText(
    "Plating absorbs 80%",
  );
  await page.getByRole("button", { name: "Back to the frontier" }).click();
  await page
    .getByRole("button", { name: "Leave focused view", exact: true })
    .click();
  await expect(page.locator(".site-header")).toBeVisible();
  expect(errors).toEqual([]);
});

test("phone overview shows the entire field and scrolls the crew to keyboard selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Begin mission", exact: true })
    .click();
  const bounds = await page.locator(".board-stack").boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  await page.keyboard.press("7");
  await expect(page.locator("#selected-detail")).toContainText(
    "Piercing rounds ignore Tank plating",
  );
  const crew = await page.locator('[data-tower="tars"]').boundingBox();
  expect(crew!.x).toBeGreaterThanOrEqual(0);
  expect(crew!.x + crew!.width).toBeLessThanOrEqual(390);
  const details = await page.locator(".crew-details").boundingBox();
  expect(details!.y + details!.height).toBeLessThanOrEqual(844);
  await page
    .getByRole("gridcell", { name: "Lane 6, tile 9, empty", exact: true })
    .click();
  await expect(
    page.getByRole("gridcell", { name: /Lane 6, tile 9, TARS/ }),
  ).toBeVisible();
});

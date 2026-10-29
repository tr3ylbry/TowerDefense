import { test, expect } from "@playwright/test";

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
});

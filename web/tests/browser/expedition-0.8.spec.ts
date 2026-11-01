import { test, expect } from "@playwright/test";

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
])
  test(`wave decisions remain clear and time controls centered at ${viewport.width}x${viewport.height}`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("#start")).toBeEnabled();
    if (viewport.width !== 1280)
      await page.addStyleTag({ content: "html { zoom: 1.5; }" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("#start").click();
    await expect(page.locator("#wave-risk")).toHaveText(
      "First contact keeps its preparation period.",
    );
    await expect(page.locator("#wave-timing")).toBeHidden();
    for (let lane = 1; lane <= 4; lane++)
      await page
        .getByRole("gridcell", {
          name: `Lane ${lane}, tile 1, empty`,
          exact: true,
        })
        .click();
    await page.locator("#speed").click();
    await expect(page.locator("#speed")).toHaveText("2×");
    await expect(page.locator("#call-wave")).toBeEnabled({ timeout: 20000 });
    await expect(page.locator("#wave-timing")).toContainText(
      /Call available · Wait \d+s, or call: 3s lead \(~\d+s sooner\)/,
    );
    await expect(page.locator("#wave-risk")).toContainText(
      /still on field: incoming hostiles will overlap survivors/,
    );
    await expect(page.locator("#call-wave")).toHaveAccessibleName(
      /Call wave 2 early for \d+ credits/,
    );
    await expect(page.locator("#call-wave")).toHaveAccessibleDescription(
      /Wait.*overlap survivors/,
    );
    await page.locator("#call-wave").scrollIntoViewIfNeeded();
    await expect(page.locator("#call-wave")).toBeInViewport();
    const bounds = await page.locator("#call-wave").boundingBox();
    expect(bounds!.width).toBeGreaterThanOrEqual(44);
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
    expect(bounds!.height).toBeLessThan(120);
    // Read-only layout check, including the anonymous glyph text node on mobile.
    for (const id of ["speed", "pause"]) {
      const geometry = await page.locator(`#${id}`).evaluate((button) => {
        const boxes = [...button.childNodes].flatMap((node) => {
          if (
            node instanceof HTMLElement &&
            getComputedStyle(node).display === "none"
          )
            return [];
          if (!node.textContent?.trim()) return [];
          const range = document.createRange();
          range.selectNodeContents(node);
          return [range.getBoundingClientRect()];
        });
        const outer = button.getBoundingClientRect();
        return {
          outerCenter: outer.x + outer.width / 2,
          innerCenter:
            (Math.min(...boxes.map((b) => b.left)) +
              Math.max(...boxes.map((b) => b.right))) /
            2,
        };
      });
      expect(
        Math.abs(geometry.outerCenter - geometry.innerCenter),
      ).toBeLessThan(2);
    }
    await page.screenshot({
      path: info.outputPath("wave-choice.png"),
      fullPage: true,
    });
    await page.locator("#call-wave").press("Enter");
    await expect(page.locator("#announcement")).toContainText(
      /Wave 2 called.*Remaining waves moved about \d+s earlier/,
    );
    await expect(page.locator("#call-wave")).toBeDisabled();
    await expect(page.locator("#incoming-summary")).toContainText(/L[1-6]/);
    await expect(page.locator("#battle-grid [tabindex='0']")).toBeFocused();
    await page.keyboard.press("p");
    await expect(page.locator("#wave-risk")).toHaveText(
      "Resume or begin the mission to call a wave.",
    );
    const announcement = await page.locator("#announcement").textContent();
    await page.waitForTimeout(1200);
    await expect(page.locator("#announcement")).toHaveText(announcement!);
    await expect(page.locator("#speed")).toHaveText("2×");
    await expect(page.locator("#pause")).toHaveAccessibleName("Resume mission");
  });

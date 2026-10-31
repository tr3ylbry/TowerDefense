// Bounded presentation diagnostic; does not read or modify the simulation.
import { firefox, chromium, webkit } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const engine = process.argv[2] ?? "firefox";
const browserType = { firefox, chromium, webkit }[engine];
if (!browserType) throw new Error(`Unsupported engine: ${engine}`);
const output =
  process.env.AVA_LAYOUT_OUTPUT ?? join(tmpdir(), "ava-layout-probe");
await mkdir(output, { recursive: true });
const browser = await browserType.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(process.env.AVA_TEST_URL ?? "http://127.0.0.1:4173/");
  await page.waitForFunction(
    () => {
      const start = document.querySelector("#start");
      return start && !start.disabled;
    },
    undefined,
    { timeout: 20000 },
  );
  await page.addStyleTag({ content: "html { zoom: 1.5; }" });
  const result = await page.evaluate(() => {
    const bounds = (element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        tag: element.tagName,
        id: element.id,
        className:
          typeof element.className === "string" ? element.className : "svg",
        left: box.left,
        right: box.right,
        top: box.top,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
        font: style.font,
        overflow: style.overflowX,
        minWidth: style.minWidth,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      };
    };
    const clipped = (element) => {
      for (
        let parent = element.parentElement;
        parent && parent !== document.body;
        parent = parent.parentElement
      )
        if (
          ["hidden", "scroll", "auto", "clip"].includes(
            getComputedStyle(parent).overflowX,
          )
        )
          return true;
      return false;
    };
    const selected = [
      ".site-header",
      ".location",
      ".mission-bar",
      ".telemetry",
      ".crew-details",
      "#selected-detail",
      ".mission-heading",
      ".mission-overlay",
      ".board-stack",
      ".battle-scroll",
      "#start",
      ".threat-strip",
      "#field-zoom",
    ].map((selector) => ({
      selector,
      ...bounds(document.querySelector(selector)),
    }));
    return {
      viewport: innerWidth,
      scroll: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      root: bounds(document.documentElement),
      offenders: [...document.querySelectorAll("body *")]
        .filter((element) => {
          const box = element.getBoundingClientRect();
          return box.width && box.right > innerWidth + 0.5 && !clipped(element);
        })
        .map(bounds),
      selected,
    };
  });
  await writeFile(
    join(output, `${engine}-layout.json`),
    JSON.stringify(result, null, 2) + "\n",
  );
  await page.screenshot({
    path: join(output, `${engine}-layout.png`),
    fullPage: true,
  });
  console.log(
    JSON.stringify({
      engine,
      width: result.viewport,
      document: result.scroll,
      offenders: result.offenders.map((item) => item.id || item.tag),
    }),
  );
} finally {
  await browser.close();
}

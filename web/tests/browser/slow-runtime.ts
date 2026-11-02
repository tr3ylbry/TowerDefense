import type { Page } from "@playwright/test";

/** Optional diagnostic profile; no fake game clock or simulation state. */
export async function slowRuntime({
  page,
  browserName,
}: {
  page: Page;
  browserName: string;
}) {
  const rate = Number(process.env.AVA_TEST_CPU_RATE ?? 1);
  if (browserName === "chromium" && Number.isFinite(rate) && rate > 1) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate });
  }
}

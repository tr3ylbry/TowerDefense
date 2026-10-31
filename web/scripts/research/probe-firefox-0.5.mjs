// A bounded local environment probe; no browser preferences/security flags changed.
import { firefox } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const output = new URL(
  "../../reports/expedition-0.5/performance/",
  import.meta.url,
);
await mkdir(output, { recursive: true });
const result = {
  engine: "Playwright Firefox",
  date: new Date().toISOString(),
  platform: process.platform,
  architecture: process.arch,
  executable: firefox.executablePath(),
  securitySettingsChanged: false,
};
let browser;
try {
  browser = await firefox.launch({ headless: true, timeout: 20000 });
  const page = await browser.newPage();
  await page.goto(process.env.AVA_PERF_URL ?? "http://127.0.0.1:4174/");
  await page
    .getByRole("button", { name: "Begin mission", exact: true })
    .waitFor({ timeout: 20000 });
  result.outcome = "local startup passed";
  result.browserVersion = browser.version();
} catch (error) {
  result.outcome = browser
    ? "failed during page creation/startup"
    : "failed before page creation";
  result.diagnostic = String(error).includes("Could not find profile folder")
    ? "Could not find profile folder."
    : String(error).slice(0, 3000);
} finally {
  await browser?.close();
  await writeFile(
    new URL("local-firefox.json", output),
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result));
}

import { test, expect } from "@playwright/test";
import candidate from "../../scripts/release/candidate.json" with { type: "json" };
import { releaseFiles } from "../../scripts/release/assets";
import { observeMusic, readMusic } from "../browser/music-probe";

for (const viewport of [{width:1280,height:900},{width:390,height:844},{width:844,height:390}]) {
  test(`release resources, semantics and left aligned controls at ${viewport.width}x${viewport.height}`,async({page},info)=>{
    test.setTimeout(90_000);
    await page.setViewportSize(viewport);
    await page.emulateMedia({reducedMotion:'no-preference'});
    const requests:string[]=[],errors:string[]=[],badResponses:string[]=[];
    page.on('request',r=>requests.push(r.url()));
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400)badResponses.push(r.url());});
    await page.goto('/'); await expect(page.locator('#start')).toBeEnabled();
    const build=await (await page.request.get('/build-info.json')).json();
    expect(build.distribution).toBe(`expedition-only-${candidate.identifier}`);
    expect(build.dirtyAtBuild).toBe(false);
    expect(build.sourceRevision).toMatch(/^[a-f0-9]{40}$/);
    await expect(page.locator('#art-toggle')).toHaveCount(0);
    await expect(page.locator('.crew-card')).toHaveCount(9);
    await expect(page.getByRole('gridcell')).toHaveCount(54);
    await expect(page.locator('#credit-balance')).toHaveAttribute('aria-label','230 credits available');
    await expect(page.locator('#integrity')).toHaveAttribute('aria-label','3 shields remaining');
    for(const id of ['sound-toggle','music-toggle','focus-toggle','motion-toggle']) {
      const button=page.locator(`#${id}`); await expect(button).toHaveAttribute('aria-pressed','false');
      const off=await button.evaluate(e=>getComputedStyle(e).color);
      await button.click(); await expect(button).toHaveAttribute('aria-pressed','true');
      await expect(button).not.toHaveAttribute('aria-busy','true');
      await expect(button).toHaveCSS('color','rgb(147, 215, 189)');
      await button.click(); await expect(button).toHaveAttribute('aria-pressed','false');
      await expect(button).toHaveCSS('color',off);
    }
    const location=await page.locator('.location').boundingBox();
    const tools=await page.locator('.mission-tools').boundingBox();
    if(tools!.y>=location!.y+location!.height-1)expect(Math.abs(tools!.x-location!.x)).toBeLessThanOrEqual(1);
    for(const map of ['canyon','bridge','nest']) {
      await page.locator('#map-open').click(); await page.locator(`[data-map="${map}"]`).click();
      await expect(page.locator('#asset-dialog')).not.toBeVisible();
      await expect(page.locator('#start')).toBeEnabled();
    }
    await page.locator('#guide-open:visible, #play-guide:visible').first().click();
    await expect(page.locator('#guide-dialog [data-art-enemy]')).toHaveCount(6);
    await page.keyboard.press('Escape');
    await page.locator('#credits-open').click();
    await expect(page.locator('#credits-dialog')).toContainText('Adrian Bao, Mauricio Herrera, Trey Bryant, and Tim Lukau');
    await expect(page.locator('#credits-dialog')).not.toContainText('Use the art switch');
    await page.keyboard.press('Escape');
    await page.locator('#start').click();
    await page.getByRole('gridcell',{name:'Lane 1, tile 1, empty',exact:true}).click();
    await expect(page.locator('#credits')).toHaveText('180');
    await page.locator('#crew-stats-toggle').press('Enter'); await expect(page.locator('#crew-stats')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.locator('#audio-mix').click();await expect(page.locator('#status')).toHaveText('Mission paused');
    await expect(page.locator('#fx-volume')).toHaveValue('65');await expect(page.locator('#music-volume')).toHaveValue('65');
    await page.keyboard.press('Escape');await expect(page.locator('#audio-mix')).toBeFocused();
    await expect(page.locator('#status')).toHaveText('Mission in progress');
    await page.locator('#salvage').click();await page.getByRole('gridcell',{name:/^Lane 1, tile 1, Astro Joe/}).click();
    await expect(page.locator('#announcement')).toContainText('20 credits');
    await page.locator('#salvage').click();
    for(const selector of ['#sound-toggle','#music-toggle','#audio-mix','#salvage','#pause','#speed']) {
      const box=await page.locator(selector).boundingBox();expect(box!.width).toBeGreaterThanOrEqual(44);expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({path:info.outputPath('release-controls.png'),fullPage:true});
    const allowed=new Set(releaseFiles().map(f=>`/${f}`));allowed.add('/art/manifest.json');
    for(const raw of requests) {
      const url=new URL(raw);
      expect(url.origin,raw).toBe(new URL(page.url()).origin);
      // Phaser decodes the authored SVGs through same-origin native image Blob URLs.
      // These are local image decodes, not HTTP requests to unapproved asset paths.
      if(url.protocol==='blob:')continue;
      const path=url.pathname;
      expect(path==='/'||allowed.has(path)||/^\/assets\/[\w-]+\.(css|js)$/.test(path),path).toBe(true);
    }
    expect(errors).toEqual([]);expect(badResponses).toEqual([]);
    await info.attach('actual-runtime-requests',{body:JSON.stringify([...new Set(requests)],null,2),contentType:'application/json'});
  });
}

test('release projectile loading failure retries without historical fallback or missing controls',async({page})=>{
  let fail=true; const paths:string[]=[];
  page.on('request',r=>paths.push(new URL(r.url()).pathname));
  await page.route('**/art/expedition/projectiles/zeus.svg',route=>fail?route.abort():route.continue());
  await page.goto('/');
  await expect(page.locator('#overlay-title')).toHaveText('We lost the transmission.');
  await expect(page.locator('#art-toggle')).toHaveCount(0);
  fail=false;await page.locator('#start').click();await expect(page.locator('#start')).toContainText('Begin mission');
  await expect(page.locator('#start')).toBeEnabled();
  expect(paths.some(p=>/^\/art\/projectile-/.test(p))).toBe(false);
});

test('release music and FX controls retain separate off/default states and single-source playback',async({page})=>{
  await observeMusic(page);await page.goto('/');await expect(page.locator('#start')).toBeEnabled();
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('#music-toggle')).toHaveAttribute('aria-pressed','false');
  expect((await readMusic(page)).created).toBe(0);
  await page.locator('#music-toggle').click();await expect.poll(async()=>(await readMusic(page)).active).toBe(1);
  await page.locator('#sound-toggle').click();await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed','true');
  await page.locator('#music-toggle').click();await expect.poll(async()=>(await readMusic(page)).active).toBe(0);
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed','true');
  await page.locator('#music-toggle').click();await expect.poll(async()=>(await readMusic(page)).active).toBe(1);
  expect(await readMusic(page)).toMatchObject({contexts:1,buffers:1,loop:true});
});

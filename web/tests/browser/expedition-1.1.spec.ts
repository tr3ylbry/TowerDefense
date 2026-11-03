import {observeMusic,readMusic,expectDecodedLoop} from "./music-probe";
import { test, expect } from "@playwright/test";
import { slowRuntime } from "./slow-runtime";
test.beforeEach(slowRuntime);

test("initial delivery uses right-sized defenders and retains all six atlases without guide or audio downloads", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(new URL(r.url()).pathname));
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  expect(requests.filter((url) => /-animation.webp$/.test(url))).toHaveLength(6);
  expect(requests.some((url) => /\/(scout|grunt|sprinter|manhunter|plated-crawler|gargantua).webp$/.test(url))).toBe(false);
  expect(requests.some((url) => /orbital-drift|sky-bridge|\/nest.webp/.test(url))).toBe(false);
  const portraits = await page.locator(".crew-card .portrait").evaluateAll(async (elements) =>
    Promise.all(elements.map(async (element) => {
      const url = getComputedStyle(element).backgroundImage.slice(5, -2);
      const image = new Image(); image.src = url; await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    })),
  );
  expect(portraits).toHaveLength(9);
  for (const size of portraits) expect(Math.max(...size)).toBe(192);
  await page.locator("#guide-open").click();
  await expect(page.locator("#guide-dialog")).toBeVisible();
  await expect.poll(() => requests.filter((url) => /\/(scout|grunt|sprinter|manhunter|plated-crawler|gargantua).webp$/.test(url)).length).toBe(6);
});

test("Mix owns only its running pause across rapid reopen, native Escape, destination changes and absence", async ({ page }) => {
  await page.goto("/");
  await page.locator("#start").click();
  for (let cycle = 0; cycle < 3; cycle++) {
    await page.locator("#audio-mix").click();
    await expect(page.locator("#status")).toHaveText("Mission paused");
    // Public DOM actions in one event turn reproduce a queued native-close race.
    // No simulation state or clock is modified.
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>("#audio-settings [data-close]")!.click();
      document.querySelector<HTMLButtonElement>("#audio-mix")!.click();
    });
    await expect(page.locator("#audio-settings")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#overlay")).toBeHidden();
    await expect(page.locator("#audio-mix")).toBeFocused();
  }
  await page.locator("#pause").click();
  await page.locator("#audio-mix").click();
  await page.locator("#audio-settings [data-close]").click();
  await expect(page.locator("#status")).toHaveText("Mission paused");
  await page.locator("#start").click();
  await page.locator("#audio-mix").click();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("#status")).toHaveText("Mission paused");
  await page.locator("#map-open").click();
  await page.locator('[data-map="bridge"]').click();
  await expect(page.locator("#start")).toHaveAccessibleName("Begin mission");
  await page.locator("#audio-mix").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#start")).toHaveAccessibleName("Begin mission");
});

test("a pending music download can be canceled and retried with one active audio source across restart and destination changes", async ({ page }) => {
  test.setTimeout(60000);
  await observeMusic(page);
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  let requested = false;
  await page.route("**/orbital-drift.wav*", async (route) => { requested = true; await held; if (!route.request().failure()) await route.continue(); });
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  await page.locator("#music-toggle").click();
  await expect.poll(() => requested).toBe(true);
  await expect(page.locator("#music-toggle")).toHaveAttribute("data-state", "starting");
  await page.locator("#music-toggle").click();
  release();
  await expect(page.locator("#music-toggle")).toHaveAttribute("data-state", "off");
  await expect.poll(async () => (await readMusic(page)).active).toBe(0);
  await page.locator("#music-toggle").click();
  await expect(page.locator("#music-toggle")).toHaveAttribute("data-state", "playing");
  await expect.poll(async () => (await readMusic(page)).time).toBeGreaterThan(0.1);
  await page.locator("#start").click();
  await page.locator("#pause").click();
  const before = (await readMusic(page)).time;
  await expect.poll(async () => (await readMusic(page)).time).toBeGreaterThan(before + 0.1);
  await page.locator("#restart").click();
  await page.locator("#restart-confirm").click();
  await page.locator("#map-open").click();
  await page.locator('[data-map="nest"]').click();
  await expect(page.locator("#start")).toBeEnabled();
  await expect(page.locator("#music-toggle")).toHaveAttribute("data-state", "playing");
  for (let cycle = 0; cycle < 3; cycle++) {
    await page.locator("#music-toggle").click();
    await expect.poll(async () => (await readMusic(page)).active).toBe(0);
    await page.locator("#music-toggle").click();
    await expect(page.locator("#music-toggle")).toHaveAttribute("data-state", "playing");
  }
  const loop = await readMusic(page);
  expect(loop).toMatchObject({active:1,contexts:1,buffers:1,loop:true});
  expectDecodedLoop(loop);
});

test("Unit Stats stays nonmodal during play and keyboard Salvage gives only a valid refund", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/");
  await page.locator("#start").click();
  await page.locator('[data-tower="astro"]').click();
  const cell = page.getByRole("gridcell", { name: "Lane 1, tile 1, empty", exact: true });
  await cell.click();
  await page.locator("#crew-stats-toggle").press("Enter");
  await expect(page.locator("#crew-stats")).toBeVisible();
  await expect(page.locator("#overlay")).toBeHidden();
  await expect(page.locator("#crew-stats dl")).toContainText(/Health\s*260/);
  await page.keyboard.press("Escape");
  await expect(page.locator("#crew-stats-toggle")).toBeFocused();
  await page.keyboard.press("x");
  await expect(page.locator("#salvage")).toHaveAttribute("aria-pressed", "true");
  const bank = Number(await page.locator("#credits").innerText());
  await page.getByRole("gridcell", { name: "Lane 1, tile 2, empty", exact: true }).click();
  await expect(page.locator("#announcement")).toContainText(/Choose a deployed defender/);
  await page.getByRole("gridcell", { name: /^Lane 1, tile 1, Astro Joe/ }).click();
  await expect.poll(async () => Number(await page.locator("#credits").innerText())).toBeGreaterThanOrEqual(bank + 20);
  await expect(page.locator("#announcement")).toContainText("20 credits");
  await expect(cell).toBeVisible();
  await page.keyboard.press("x");
  await expect(page.locator("#salvage")).toHaveAttribute("aria-pressed", "false");
});

for (const viewport of [{width:320,height:568},{width:768,height:1024}])
  test(`compact and tablet controls remain reachable with enlarged text at ${viewport.width}x${viewport.height}`, async ({page},info) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('#start')).toBeEnabled();
    await page.addStyleTag({content:'html { zoom: 1.5; } :root { font-family: Verdana, sans-serif; }'});
    await page.locator('#start').click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    for(const selector of viewport.width<=700?['#salvage','#field-zoom']:['#salvage']) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await expect(page.locator(selector)).toBeInViewport();
      const box=await page.locator(selector).boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    await page.locator('#audio-mix').click();
    await expect(page.locator('#audio-settings')).toBeInViewport({ratio:1});
    await expect(page.getByRole('slider',{name:'FX Volume',exact:true})).toHaveAttribute('aria-valuetext','65%');
    await page.getByRole('slider',{name:'Music Volume',exact:true}).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#music-volume')).toHaveValue('66');
    await page.keyboard.press('Escape');
    await expect(page.locator('#audio-mix')).toBeFocused();
    await page.keyboard.press('9');
    await expect(page.locator('[data-tower="falcon"]')).toBeInViewport();
    await page.locator('#crew-stats-toggle').press('Enter');
    await expect(page.locator('#crew-stats')).toBeInViewport({ratio:1});
    await page.keyboard.press('Escape');
    await page.locator('#art-toggle').click();
    await expect(page.locator('html')).toHaveClass(/original-art/);
    await page.keyboard.press('9');
    await expect(page.locator('[data-tower="falcon"]')).toBeInViewport();
    await page.locator('#play-guide').click();
    const guide=page.locator('#guide-dialog');
    expect(await guide.evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true);
    await page.keyboard.press('Escape');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await page.screenshot({path:info.outputPath('enlarged-controls.png'),fullPage:true});
  });

test('Orbital Drift repeats on the sample clock across two real loop boundaries without new sources or downloads',async({page},info)=>{
  test.setTimeout(60000);
  await observeMusic(page);
  const requests:string[]=[];page.on('request',r=>{if(r.url().includes('orbital-drift.wav'))requests.push(r.url());});
  await page.goto('/');await expect(page.locator('#start')).toBeEnabled();
  await page.locator('#music-toggle').click();
  await expect(page.locator('#music-toggle')).toHaveAttribute('data-state','playing');
  const integrity=await page.evaluate(async()=>{
    const record=window.observedMusic![0],buffer=record.source.buffer!;
    const offline=new OfflineAudioContext(1,buffer.length*2,buffer.sampleRate);
    const source=offline.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(offline.destination);source.start();
    const rendered=(await offline.startRendering()).getChannelData(0),input=buffer.getChannelData(0);
    let error=0,seamEnergy=0;
    for(let i=0;i<rendered.length;i++)error=Math.max(error,Math.abs(rendered[i]-input[i%input.length]));
    for(let i=buffer.length-512;i<buffer.length+512;i++)seamEnergy+=rendered[i]**2;
    return {framesPerLoop:buffer.length,sampleRate:buffer.sampleRate,duration:buffer.duration,maxRepeatError:error,seamRms:Math.sqrt(seamEnergy/1024)};
  });
  expectDecodedLoop(integrity);expect(integrity.maxRepeatError).toBeLessThan(.00001);expect(integrity.seamRms).toBeGreaterThan(.001);
  await expect.poll(async()=> (await readMusic(page)).time,{timeout:40000}).toBeGreaterThan(30.1);
  const loop = await readMusic(page);
  expect(loop).toMatchObject({created:1,active:1,contexts:1,buffers:1,loop:true});
  expectDecodedLoop(loop);
  expect(requests).toHaveLength(1);
  await expect(page.locator('#music-toggle')).toHaveAttribute('data-state','playing');
  await info.attach('loop-integrity.json',{body:JSON.stringify(integrity),contentType:'application/json'});
});

test('FX and Music recover independently from real output suspension and honor rapid latest-intent taps',async({page})=>{
  await observeMusic(page);
  await page.addInitScript(()=>{
    const contexts:AudioContext[]=[],gains:GainNode[]=[];
    (window as Window & {fxContexts?:AudioContext[];channelGains?:GainNode[]}).fxContexts=contexts;
    (window as Window & {channelGains?:GainNode[]}).channelGains=gains;
    const oscillator=AudioContext.prototype.createOscillator,gain=AudioContext.prototype.createGain;
    AudioContext.prototype.createOscillator=function(){if(!contexts.includes(this))contexts.push(this);return oscillator.call(this);};
    AudioContext.prototype.createGain=function(){const node=gain.call(this);gains.push(node);return node;};
  });
  await page.goto('/');await expect(page.locator('#start')).toBeEnabled();
  await page.locator('#music-toggle').click();await expect(page.locator('#music-toggle')).toHaveAttribute('data-state','playing');
  await page.locator('#sound-toggle').click();await expect(page.locator('#sound-toggle')).toHaveAttribute('data-state','on');
  await page.evaluate(async()=>{await (window as Window & {fxContexts?:AudioContext[]}).fxContexts![0].suspend();});
  await expect(page.locator('#sound-toggle')).toHaveAccessibleName('Resume sound effects');
  await expect(page.locator('#music-toggle')).toHaveAttribute('data-state','playing');
  await page.locator('#sound-toggle').click();await expect(page.locator('#sound-toggle')).toHaveAttribute('data-state','on');
  await page.evaluate(async()=>{await (window.observedMusic!.at(-1)!.source.context as AudioContext).suspend();});
  await expect(page.locator('#music-toggle')).toHaveAttribute('data-state','paused');
  await expect(page.locator('#sound-toggle')).toHaveAttribute('data-state','on');
  await page.locator('#music-toggle').click();await expect(page.locator('#music-toggle')).toHaveAttribute('data-state','playing');
  for(let cycle=0;cycle<3;cycle++){
    await page.evaluate(()=>{
      for(let tap=0;tap<2;tap++){
        document.querySelector<HTMLButtonElement>('#music-toggle')!.click();
        document.querySelector<HTMLButtonElement>('#sound-toggle')!.click();
      }
    });
    await expect(page.locator('#music-toggle')).toHaveAttribute('data-state','playing');
    await expect(page.locator('#sound-toggle')).toHaveAttribute('data-state','on');
    expect(await readMusic(page)).toMatchObject({active:1,contexts:1,buffers:1});
  }
  await page.evaluate(async()=>{await (window as Window & {fxContexts?:AudioContext[]}).fxContexts![0].suspend();});
  await expect(page.locator('#sound-toggle')).toHaveAttribute('data-state','paused');
  await page.evaluate(()=>{const button=document.querySelector<HTMLButtonElement>('#sound-toggle')!;button.click();button.click();});
  await expect(page.locator('#sound-toggle')).toHaveAttribute('data-state','off');
  await page.locator('#sound-toggle').click();await expect(page.locator('#sound-toggle')).toHaveAttribute('data-state','on');
  await page.locator('#audio-mix').click();
  await page.locator('#fx-volume').fill('0');await page.locator('#music-volume').fill('0');
  await expect.poll(()=>page.evaluate(()=>(window as Window & {channelGains?:GainNode[]}).channelGains!.slice(0,2).every(g=>g.gain.value<.001))).toBe(true);
  await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>(window as Window & {fxContexts?:AudioContext[]}).fxContexts!.length)).toBe(1);
  expect(await readMusic(page)).toMatchObject({active:1,contexts:1,buffers:1});
});

for (const touch of [false, true]) {
  test.describe(touch ? 'touch toggle appearance' : 'pointer toggle appearance', () => {
    test.use({ hasTouch: touch, viewport: { width: touch ? 390 : 1280, height: 844 } });
    test('enabled highlights follow state after repeated taps without moving the pointer', async ({ page }) => {
      // This deliberately repeats every toolbar control; hosted touch actions
      // can each take a second. Bound individual actions without truncating the sequence.
      test.setTimeout(90_000);
      page.setDefaultTimeout(15_000);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.goto('/');
      await expect(page.locator('#start')).toBeEnabled();
      await expect(page.locator('#map-open-label')).toHaveText('Change Destination');
      for (const [selector,label] of [['#art-toggle','Expedition Art'],['#sound-toggle','Effects Off'],['#music-toggle','Music Off'],['#motion-toggle','Reduced Motion']])
        await expect(page.locator(`${selector} span`)).toHaveText(label);
      const activate = async (selector: string) => {
        const button = page.locator(selector);
        if (touch) await button.tap();
        else await button.click();
      };
      for (const selector of ['#sound-toggle', '#music-toggle', '#focus-toggle', '#art-toggle', '#motion-toggle']) {
        const button = page.locator(selector);
        await expect(button).toHaveAttribute('aria-pressed', 'false');
        const offColor = await button.evaluate(e => getComputedStyle(e).color);
        for (let cycle = 0; cycle < 2; cycle++) {
          await activate(selector);
          await expect(button).toHaveAttribute('aria-pressed', 'true');
          await expect(button).not.toHaveAttribute('aria-busy', 'true');
          await expect(button).toHaveCSS('color', 'rgb(147, 215, 189)');
          await activate(selector);
          await expect(button).toHaveAttribute('aria-pressed', 'false');
          await expect(button).toHaveCSS('color', offColor);
        }
      }
      await page.locator('#start').click();
      for (const selector of touch ? ['#salvage', '#field-zoom'] : ['#salvage']) {
        const button = page.locator(selector);
        const offBackground = await button.evaluate(e => getComputedStyle(e).backgroundColor);
        await activate(selector);
        await expect(button).toHaveAttribute('aria-pressed', 'true');
        await expect(button).not.toHaveCSS('background-color', offBackground);
        await activate(selector);
        await expect(button).toHaveAttribute('aria-pressed', 'false');
        await expect(button).toHaveCSS('background-color', offBackground);
      }
      await page.locator('#sound-toggle').focus();
      await page.keyboard.press('Tab');
      await expect(page.locator('#music-toggle')).toBeFocused();
      await expect(page.locator('#music-toggle')).toHaveCSS('outline-style', 'solid');
    });
  });
}

test('dialog action rows and close icons stay centered on desktop, phone and landscape', async ({ page }, info) => {
  test.setTimeout(90000);
  const centered = async (selector: string) => {
    const group = page.locator(selector);
    await group.scrollIntoViewIfNeeded();
    const geometry = await group.evaluate(element => {
      const bounds = element.getBoundingClientRect();
      const rows: {top:number;bottom:number;left:number;right:number}[] = [];
      const items: {left:number;right:number}[] = [];
      for (const child of [...element.children]) {
        const rect = child.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        items.push({left:rect.left,right:rect.right});
        // Same-row buttons can differ in height or move vertically on hover.
        const row = rows.find(r => Math.min(r.bottom, rect.bottom) > Math.max(r.top, rect.top));
        if (row) {
          row.top = Math.min(row.top, rect.top); row.bottom = Math.max(row.bottom, rect.bottom);
          row.left = Math.min(row.left, rect.left); row.right = Math.max(row.right, rect.right);
        } else rows.push({top:rect.top,bottom:rect.bottom,left:rect.left,right:rect.right});
      }
      return {left:bounds.left,right:bounds.right,center:bounds.left+bounds.width/2,rows,items};
    });
    expect(geometry.rows.length).toBeGreaterThan(0);
    for (const row of geometry.rows) expect(Math.abs((row.left+row.right)/2-geometry.center)).toBeLessThan(1);
    for (const item of geometry.items) {
      expect(item.left).toBeGreaterThanOrEqual(geometry.left - 1);
      expect(item.right).toBeLessThanOrEqual(geometry.right + 1);
    }
  };
  for (const viewport of [{width:1280,height:900},{width:390,height:844},{width:844,height:390}]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('#start')).toBeEnabled();
    await page.locator('#map-open').click();
    await centered('#map-dialog .dialog-actions');
    const mixedHeight = await page.addStyleTag({content:'#map-dialog #campaign-switch { min-height: 64px; }'});
    await page.locator('#campaign-switch').hover();
    await centered('#map-dialog .dialog-actions');
    await mixedHeight.evaluate(element => element.parentNode?.removeChild(element));
    const close = page.locator('#map-dialog .dialog-close');
    await expect(close).toHaveCSS('align-items','center');
    await expect(close).toHaveCSS('justify-items','center');
    if(viewport.width===390) await page.screenshot({path:info.outputPath('centered-destinations.png')});
    await page.keyboard.press('Escape');
    await page.locator('#guide-open').click();
    await centered('#guide-dialog .dialog-actions');
    if(viewport.width===390) await page.screenshot({path:info.outputPath('centered-field-guide.png')});
    await page.keyboard.press('Escape');
    await page.locator('#credits-open').click();
    await centered('#credits-dialog .dialog-actions');
    await page.keyboard.press('Escape');
    await page.locator('#campaign-nav').click();
    await centered('#campaign-dialog .campaign-footer');
    await page.locator('[data-review="first-contact"]').click();
    await centered('#campaign-dialog .dialog-actions');
    await page.locator('#campaign-reset').click();
    await centered('#campaign-reset-dialog .dialog-actions');
    await page.locator('#campaign-reset-cancel').click();
    await page.keyboard.press('Escape');
    await page.locator('#start').click();
    await page.locator('#restart').click();
    await centered('#restart-dialog .dialog-actions');
    await page.locator('#restart-cancel').click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
});

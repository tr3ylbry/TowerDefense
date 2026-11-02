import {test,expect} from '@playwright/test';

test('all six illustrated aliens walk and attack on every environment with stable pause and reduced motion',async({page},info)=>{
 await page.goto('/tests/fixtures/roster-animation-lab.html');
 await expect(page.locator('body')).toHaveAttribute('data-ready','true');
 const first=await page.locator('body').getAttribute('data-frames');
 await expect.poll(()=>page.locator('body').getAttribute('data-frames')).not.toBe(first);
 await page.locator('#pause').click();
 const paused=await page.locator('body').getAttribute('data-frames');
 await page.waitForTimeout(200);
 await expect(page.locator('body')).toHaveAttribute('data-frames',paused!);
 await page.locator('#reduce').check();
 await expect(page.locator('body')).toHaveAttribute('data-frames','4,16,24,4,16,24,6,24,32,4,16,24,4,16,24,4,16,24');
 await page.screenshot({path:info.outputPath('six-aliens-reduced.png'),fullPage:true});
 await page.locator('#reduce').uncheck();
 await page.screenshot({path:info.outputPath('six-aliens-motion.png'),fullPage:true});
 await page.locator('#speed').click();
 await expect(page.locator('#speed')).toHaveText('2×');
 await page.locator('#pause').click();
 await expect.poll(()=>page.locator('body').getAttribute('data-frames')).not.toBe(paused);
});

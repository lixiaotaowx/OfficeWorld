const { chromium } = require('C:/Users/Administrator/AppData/Roaming/npm/node_modules/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    page.on('pageerror', error => console.log('PAGE ERROR', error.message));
    await page.goto('http://127.0.0.1:5199/test/screen-fit.html');
    await page.waitForFunction(() => document.querySelector('#report').textContent.startsWith('['), { timeout: 90000 });
    await page.locator('#front').click();
    await page.screenshot({ path: 'Build/screen-fit-after.png' });
    const result = await page.evaluate(() => {
      const { THREE, asset } = window.screenFitAudit;
      const results = [];
      asset.traverse(o => {
        if (!o.name.startsWith('seatScreen_')) return;
        const box = new THREE.Box3().setFromObject(o);
        results.push({ name: o.name, fitted: o.userData.fittedInset, width: o.geometry.parameters.width,
          height: o.geometry.parameters.height, center: box.getCenter(new THREE.Vector3()).toArray(),
          canvas: [o.material.map.image.width, o.material.map.image.height] });
      });
      return results;
    });
    fs.writeFileSync('Build/screen-fit-after.json', JSON.stringify(result, null, 2));
    assert.equal(result.length, 9);
    for (const screen of result) {
      assert.equal(screen.fitted, true);
      assert.ok(Math.abs(screen.width - .655656558) < 1e-5);
      assert.ok(Math.abs(screen.height - .391921246) < 1e-5);
      assert.ok(Math.abs(screen.width / screen.height / (screen.canvas[0] / screen.canvas[1]) - 1) < .001);
    }
    const surface = JSON.parse(await page.locator('#report').innerText());
    for (const seat of surface) for (const gap of seat.samples) assert.ok(Math.abs(gap - .001) < 1e-5);
    const ratios = [];
    for (const [button, width, height] of [['wide',960,540],['classic',800,600],['portrait',540,960]]) {
      await page.evaluate(([w,h]) => window.screenFitAudit.preview(w,h), [width,height]);
      const fit = await page.evaluate(() => {
        const mesh = window.screenFitAudit.monitors.meshFor(0);
        const canvas = mesh.material.map.image, context = canvas.getContext('2d');
        const data = context.getImageData(0,0,canvas.width,canvas.height).data;
        let minX=canvas.width,minY=canvas.height,maxX=-1,maxY=-1;
        for(let y=0;y<canvas.height;y++) for(let x=0;x<canvas.width;x++) {
          const i=(y*canvas.width+x)*4;
          if(data[i]===16 && data[i+1]===26 && data[i+2]===23) continue;
          minX=Math.min(x,minX);maxX=Math.max(x,maxX);minY=Math.min(y,minY);maxY=Math.max(y,maxY);
        }
        return { canvas:[canvas.width,canvas.height], content:[minX,minY,maxX+1,maxY+1] };
      });
      const scale=Math.min(fit.canvas[0]/width,fit.canvas[1]/height);
      assert.ok(Math.abs(fit.content[2]-fit.content[0]-width*scale)<2);
      assert.ok(Math.abs(fit.content[3]-fit.content[1]-height*scale)<2);
      ratios.push({source:[width,height],...fit});
      await page.screenshot({path:`Build/screen-fit-${button}.png`});
    }
    for (const seat of ['b','manager']) {
      await page.locator(`#${seat}`).click();
      await page.locator('#side').click();
      await page.screenshot({path:`Build/screen-fit-${seat}-side.png`});
    }
    fs.writeFileSync('Build/screen-fit-validation.json', JSON.stringify({screens:result,surface,ratios},null,2));
    console.log('PASS: nine measured insets, 81 surface samples at 1mm, pixel bounds for 16:9 / 4:3 / portrait',JSON.stringify(ratios));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

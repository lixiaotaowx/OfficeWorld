const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const b=await chromium.launch({headless:true,channel:'msedge'});const p=await b.newPage({viewport:{width:1500,height:950}});p.on('pageerror',e=>console.log('ERROR',e.message));await p.goto('http://127.0.0.1:5188/');await p.getByText('待机 · 点击地面或 WASD 行走',{exact:true}).waitFor();await p.getByLabel('选择角色').selectOption('man');await p.waitForTimeout(2000);await p.getByRole('button',{name:'坐到 1 号工位',exact:true}).click();await p.waitForTimeout(12000);console.log(await p.locator('.actor-controls').innerText());await p.screenshot({path:'Design/OfficeConcept/Web_Avatar_Debug.png'});await b.close();
})();

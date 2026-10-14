// Hidden native window: no user cursor movement or changes to running clients.
const assert = require('node:assert/strict');
const {app, BrowserWindow, session} = require('electron');
const {writeFileSync} = require('node:fs');
const path = require('node:path');
const {createDockWindow} = require('../../dock-window.cjs');
const result = path.resolve(__dirname, '../../../Build/dock-hover-native-result.json');
app.setPath('userData', path.join(app.getPath('temp'), 'office-dock-hover-regression'));

app.whenReady().then(async () => {
  let dock;
  try {
    const display = {bounds:{x:0,y:0,width:1920,height:1080},
      workArea:{x:0,y:0,width:1920,height:1040}};
    let point = {x:0,y:0};
    dock = createDockWindow({electron:{}, session,
      BrowserWindow: class {
        constructor(options) {
          const window = new BrowserWindow(options);
          window.showInactive = () => {}; // Keep the test window hidden.
          return window;
        }
      },
      screen:{getPrimaryDisplay:()=>display, getCursorScreenPoint:()=>point},
      anchor:'left', size:{width:156,height:250},
      zOrder:{start(){},stop(){},sync:()=>true,watching:()=>false},
      url:'data:text/html,<body style="margin:0;background:transparent"><div id="strip" style="position:absolute;bottom:0;left:0;width:156px;height:40px;background:green"></div></body>',
    });
    const window = dock.ensure();
    await new Promise(resolve => window.webContents.once('did-finish-load',resolve));
    dock.applyLayout({expanded:false,width:156,cardPx:0});
    const bounds = window.getBounds();
    const rect = await window.webContents.executeJavaScript('JSON.stringify(document.getElementById("strip").getBoundingClientRect())');
    const koffi = require('koffi');
    const getStyle = koffi.load('user32.dll').func('long __stdcall GetWindowLongW(void *hWnd, int nIndex)');
    const hwnd = window.getNativeWindowHandle().readBigUInt64LE();
    const transparent = () => Boolean(getStyle(hwnd,-20)&0x20);
    const strip = {x:0,y:bounds.height-40,width:156,height:40};
    for(let i=0;i<10;i++) {
      point = {x:bounds.x+20,y:bounds.y+30};
      dock.applyLayout({expanded:true,width:156,cardPx:0,hitRegions:[strip]});
      assert.equal(transparent(),true,'unpainted preview space passes through');
      dock.applyLayout({expanded:true,width:156,cardPx:200,
        hitRegions:[strip,{x:0,y:10,width:330,height:190}]});
      assert.equal(transparent(),false,'visible preview accepts input');
      assert.deepEqual(window.getBounds(),bounds,'hover and measurement never resize native window');
      assert.equal(await window.webContents.executeJavaScript('JSON.stringify(document.getElementById("strip").getBoundingClientRect())'),rect);
      dock.applyLayout({expanded:false,width:156,cardPx:0,hitRegions:[strip]});
      assert.equal(transparent(),true,'closing preview restores pass-through');
      assert.deepEqual(window.getBounds(),bounds);
    }
    writeFileSync(result,JSON.stringify({passed:true,cycles:10,bounds,at:new Date().toISOString()},null,2));
  } finally {dock?.destroy(); app.quit();}
}).catch(error=>{
  writeFileSync(result,JSON.stringify({passed:false,error:String(error)}));
  console.error(error);app.exit(1);
});

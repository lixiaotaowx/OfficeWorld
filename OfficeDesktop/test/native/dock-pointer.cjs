// Run explicitly with Electron, never with node --test. No visible window,
// cursor movement, user permissions, or changes to a running client.
const assert = require('node:assert/strict');
const { app, BrowserWindow } = require('electron');
const { createDockPointer } = require('../../dock-pointer.cjs');
const { writeFileSync } = require('node:fs');
const path = require('node:path');
const result = path.resolve(__dirname,'../../../Build/dock-pointer-native-result.json');
app.whenReady().then(async () => {
  const window = new BrowserWindow({ show:false, transparent:true, frame:false,
    width:320,height:480,webPreferences:{sandbox:true,contextIsolation:true,nodeIntegration:false} });
  let pointer;
  try {
    const koffi = require('koffi');
    const user32 = koffi.load('user32.dll');
    const getStyle = user32.func('long __stdcall GetWindowLongW(void *hWnd, int nIndex)');
    const hwnd = window.getNativeWindowHandle().readBigUInt64LE();
    const transparent = () => Boolean(getStyle(hwnd,-20) & 0x20);
    let point;
    const bounds = window.getBounds();
    pointer = createDockPointer({screen:{getCursorScreenPoint:()=>point},getWindow:()=>window});
    point={x:bounds.x+100,y:bounds.y+100};
    pointer.update([{x:0,y:440,width:320,height:40},{x:220,y:10,width:80,height:24}]);
    assert.equal(transparent(),true,'Windows window style passes through greeting');
    point={x:bounds.x+230,y:bounds.y+20}; pointer.sync();
    assert.equal(transparent(),false,'Windows window accepts answer-button clicks');
    point={x:bounds.x+100,y:bounds.y+460}; pointer.sync();
    assert.equal(transparent(),false,'strip remains interactive without forwarded mousemove');
    point={x:bounds.x+100,y:bounds.y+130}; pointer.sync();
    assert.equal(transparent(),true,'leaving controls restores native pass-through');
    console.log('Windows 原生通过：装饰区 WS_EX_TRANSPARENT，按钮/头像区恢复鼠标输入。');
    writeFileSync(result, JSON.stringify({passed:true,at:new Date().toISOString()}));
  } finally { pointer?.stop(); window.destroy(); app.quit(); }
}).catch(error=>{
  writeFileSync(result, JSON.stringify({passed:false,error:String(error),at:new Date().toISOString()}));
  console.error(error);app.exit(1);
});

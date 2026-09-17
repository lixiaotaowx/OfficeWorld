// 离开电脑就停掉工位预览的采集流，好让显示器按电源计划熄灭。
//
// Windows 上"正在采集桌面"会让 Chromium 申请 DISPLAY 常亮（实测 powercfg /requests
// 显示 `Native desktop capture`），于是无论电源计划里设的是几分钟关屏，屏幕都不会熄。
// 用户要求：「离开就暂停采集 不要耽误息屏」（2026-09-17）。所以只要系统空闲时间超过
// 阈值，就把常驻采集流停掉；人一回来（下一次取帧）自动重新附着。
//
// 阈值必须**不大于**操作系统的关屏超时，否则我们仍然会把关屏往后拖。
const AWAY_PAUSE_SECONDS = 60;

function createPreviewIdleGate(dependencies = {}) {
  const powerMonitor = dependencies.powerMonitor
    || require('electron').powerMonitor;
  const awaySeconds = dependencies.awaySeconds ?? AWAY_PAUSE_SECONDS;
  const onChange = dependencies.onChange || (() => {});
  let paused = false;

  /** 系统空闲秒数；读不到就当 0（宁可继续采集，也不要莫名停掉别人的预览）。 */
  const idleSeconds = () => {
    try {
      const value = Number(powerMonitor?.getSystemIdleTime?.());
      return Number.isFinite(value) && value >= 0 ? value : 0;
    } catch {
      return 0;
    }
  };

  /** 重新判断一次；状态翻转时通知调用方（用来停流）。 */
  const check = () => {
    const next = idleSeconds() >= awaySeconds;
    if (next !== paused) {
      paused = next;
      try { onChange(paused); } catch { /* 停流失败不影响判断 */ }
    }
    return paused;
  };

  return { check, paused: () => paused, idleSeconds, awaySeconds };
}

module.exports = { createPreviewIdleGate, AWAY_PAUSE_SECONDS };

// 麦克风音量表：把"我这只在说话"变成头像条静音按钮外面那一圈波纹
// （用户 2026-10-14：「状态栏静音按钮需要一个声音波纹来看麦的音量」）。
//
// 这里全是纯函数：取音量的那部分在 `useMicLevel.ts`。分成两个文件是因为
// 这两件事的坑完全不同 —— 一个是"数值怎么算"，一个是"Analyser 什么时候建、什么时候收"。

/** 取样间隔（毫秒）。声音看着要跟手，60ms 大约 16fps，够了；再快只是白烧 CPU。 */
export const MIC_POLL_MS = 60;

/**
 * 底噪线（时域 RMS，0..1）：低于它就当"没在说话"。
 *
 * 实测安静房间 + 普通耳麦的 RMS 大约 0.002～0.006，说话 0.03 起。0.008 正好卡在中间 ——
 * 再低会有底噪波纹（看着像坏了），再高就会把轻声吞掉。
 */
export const MIC_FLOOR = 0.008;

/** 换算增益。见 `waveHeight`：正常说话 ≈ 0.05 时落到 0.45 左右。 */
const MIC_GAIN = 4;

/**
 * 原始音量 → 0..1 的波纹高度。
 *
 * `raw` 是**时域样本的均方根**（0..1，安静 0.002～0.006、正常说话约 0.03～0.12）。先掐掉
 * 底噪，再放大 4 倍开方：0.03 → 0.35、0.05 → 0.45、0.08 → 0.57。别改成线性 —— 线性下
 * 正常说话只有 0.1 出头，整条波纹全挤在底部，看不出音量变化。
 */
export function waveHeight(raw: unknown): number {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= MIC_FLOOR) return 0;
  return clamp01(Math.sqrt((value - MIC_FLOOR) * MIC_GAIN));
}

/**
 * 波纹的"落"比"起"慢（自己说话时的自然观感：音一出口立刻亮，音停了余一点）。
 * 释放约 `1 / release` 次取样，所以 60ms 一取样、释放 0.16 ≈ 0.4 秒落下去。
 */
export function smoothLevel(previous: number, next: number, release = 0.16): number {
  const was = clamp01(previous);
  const now = clamp01(next);
  if (now >= was) return now;
  return clamp01(was + (now - was) * release);
}

/**
 * 低于这个值就当"没在说话"。波纹停在 0 才让小窗彻底安静 ——
 * 有一点底噪就画一圈浅波纹，看着像坏了。
 */
export const MIC_SILENT = 0.04;

/** 画波纹用的最终高度：静音或缺席一律 0，否则按四舍五入到 0.01（省得每帧都推一个没变的数）。 */
export function meterLevel(level: unknown, micOn: boolean): number {
  if (!micOn) return 0;
  const value = clamp01(Number(level) || 0);
  if (value < MIC_SILENT) return 0;
  return Math.round(value * 100) / 100;
}

/** 时域样本的均方根，0..1（`AnalyserNode.getByteTimeDomainData` 的静音基准是 128）。 */
export function trackRms(samples: Uint8Array): number {
  let sum = 0;
  for (const sample of samples) {
    const value = (sample - 128) / 128;
    sum += value * value;
  }
  return Math.sqrt(sum / samples.length);
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

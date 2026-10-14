import { meterLevel } from './micLevel';

/**
 * 静音按钮外面那圈"声音波纹"（用户 2026-10-14：「状态栏静音按钮需要一个声音波纹来看麦的
 * 音量」）。
 *
 * 画法是一圈跟着音量长大的**描边**（不是第二层发光/阴影）：小窗是透明无边框窗口，
 * box-shadow 那种软边在任务栏背景上会和条子的圆角糊在一起，看不出"多大"。
 * 静音时整圈不画 —— 那正是"没在收音"最直接的表示。
 */
export default function DockMicWave({ level }: { level?: number }) {
  const size = 20 + Math.round(meterLevel(level, true) * 22);
  return <svg className="dock-mic-wave" viewBox="0 0 44 44" width={size} height={size} aria-hidden="true">
    <circle cx="22" cy="22" r="20" />
  </svg>;
}

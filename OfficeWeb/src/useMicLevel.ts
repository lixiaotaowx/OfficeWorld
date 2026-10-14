import { useEffect, useRef, useState } from 'react';
import { MIC_POLL_MS, meterLevel, smoothLevel, trackRms, waveHeight } from './micLevel';

/**
 * 量我这只麦克风的音量，给头像条上的静音按钮画波纹
 * （用户 2026-10-14：「状态栏静音按钮需要一个声音波纹来看麦的音量」）。
 *
 * 小窗自己不碰媒体（连 socket 都没有），所以音量只能在**主窗口**这里量，再把一个 0..1
 * 的数推进小窗状态里。
 *
 * 几个必须记住的点：
 *   * 用**原生 AnalyserNode**，不用 LiveKit 的 `createAudioAnalyser`：那个要一个
 *     `LocalAudioTrack` 包装对象，而我们手里（`media.activeMic()`）只有底层的
 *     `MediaStreamTrack`。用原生就要自己管 AudioContext 的开关。
 *   * 每次都必须 `close()` 掉 AudioContext。浏览器同时能开的上下文很少，一通电话漏一个，
 *     几通之后 `createMediaStreamSource` 就再也建不出来（波纹永远不动）。
 *   * 轨道换了（切房间、重新授权麦克风、换设备）要**重建**：轨道被换掉之后旧 Analyser 量
 *     的是一条死轨，读数永远停在最后一帧，看起来就是"波纹冻住了"。
 *   * 没在通话、或麦克风没开时直接返回 0 并停掉取样 —— 静音还画波纹等于骗人。
 *   * `activeMic` 是 `media.current` 上的箭头函数引用，**不放进 effect 依赖**（依赖一个
 *     每次渲染都可能变的函数会让取样每帧重启），走 ref 取最新那个。
 */
export function useMicLevel(activeMic: () => MediaStreamTrack | null,
  micOn: boolean, live: boolean): number {
  const [level, setLevel] = useState(0);
  const readMic = useRef(activeMic);
  readMic.current = activeMic;
  useEffect(() => {
    if (!live || !micOn) { setLevel(0); return; }
    let stopped = false;
    let track: MediaStreamTrack | null = null;
    let audio: AudioContext | undefined;
    let analyser: AnalyserNode | undefined;
    let data: Uint8Array | undefined;
    let shown = 0;
    let pushed = 0;
    const detach = () => {
      analyser = undefined;
      data = undefined;
      const closing = audio;
      audio = undefined;
      void closing?.close().catch(() => undefined);
    };
    /** 建（或重建）当前这条轨的 Analyser；建不出来就当没有音量。 */
    const attach = () => {
      const next = readMic.current();
      if (next === track) return;
      detach();
      track = next;
      shown = 0;
      if (!track) return;
      try {
        audio = new AudioContext();
        const source = audio.createMediaStreamSource(new MediaStream([track]));
        analyser = audio.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        data = new Uint8Array(analyser.fftSize);
      } catch { detach(); }
    };
    attach();
    const timer = setInterval(() => {
      if (stopped) return;
      // 通话里换了麦克风：读数会冻在最后一帧，所以每次取样顺手核对一次轨道。
      if (readMic.current() !== track) attach();
      let raw = 0;
      if (analyser && data) {
        analyser.getByteTimeDomainData(data);
        raw = waveHeight(trackRms(data));
      }
      shown = smoothLevel(shown, raw);
      const next = meterLevel(shown, !!analyser);
      // 只有数值真的变了才 setState：安静时一直推 0 会让主窗口每 60ms 白渲染一次。
      if (next === pushed) return;
      pushed = next;
      setLevel(next);
    }, MIC_POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
      setLevel(0);
      detach();
    };
  }, [live, micOn]);
  return level;
}

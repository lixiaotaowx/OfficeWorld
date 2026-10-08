import { useState } from 'react';

/** 视频链接的封面缩略图。
 *
 *  封面由服务端解析并代理（见 `build-cover.mjs`：平台接口没有 CORS、图床认 Referer），
 *  页面只请求本站的 `?cover=`。点一下就是"放大观看"——打开宝箱视频播放器。
 *  解析不到封面时退回原来的类型符号，条目本身仍然好端端地在那儿。 */
export function ChestCover({ value, title, platform, onOpen }:
  { value: string; title: string; platform: string; onOpen: () => void }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="chest-glyph" aria-hidden="true">↗</span>;
  return <button type="button" className="chest-cover" aria-label={`放大观看：${title}`}
    title={`${platform} · 点击放大观看`} onClick={onOpen}>
    <img src={`/api/build?cover=${encodeURIComponent(value)}`} alt="" loading="lazy"
      onError={() => setFailed(true)} />
    <span className="chest-cover-play" aria-hidden="true">▶</span>
  </button>;
}

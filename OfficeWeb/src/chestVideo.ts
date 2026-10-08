export type ChestVideo = { platform: string; embed?: string; message?: string; portrait?: boolean };
export function chestVideo(value: string): ChestVideo | null {
  let url: URL;
  try { url = new URL(value); } catch { return null; }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  const belongs = (domain: string) => host === domain || host.endsWith('.' + domain);
  if (belongs('bilibili.com')) {
    const player = new URL('https://player.bilibili.com/player.html');
    const bv = url.pathname.match(/\/(BV[0-9A-Za-z]{10})(?:\/|$)/)?.[1] || url.searchParams.get('bvid');
    const av = url.pathname.match(/\/av(\d+)(?:\/|$)/)?.[1] || url.searchParams.get('aid');
    const episode = url.pathname.match(/\/ep(\d+)(?:\/|$)/)?.[1];
    if (bv && /^BV[0-9A-Za-z]{10}$/.test(bv)) player.searchParams.set('bvid', bv);
    else if (av && /^\d+$/.test(av)) player.searchParams.set('aid', av);
    else if (episode) player.searchParams.set('episodeId', episode);
    else return { platform: 'B站', message: '请使用具体视频页面的链接。' };
    for (const key of ['p', 't']) {
      const n = url.searchParams.get(key);
      if (n && /^\d{1,8}$/.test(n)) player.searchParams.set(key, n);
    }
    player.searchParams.set('autoplay', '0');
    return { platform: 'B站', embed: player.href };
  }
  if (belongs('douyin.com') || belongs('iesdouyin.com')) {
    const vid = url.pathname.match(/\/(?:video|share\/video)\/(\d+)(?:\/|$)/)?.[1]
      || url.searchParams.get('modal_id') || url.searchParams.get('vid');
    if (vid && /^\d{10,25}$/.test(vid)) return { platform: '抖音', portrait: true,
      embed: `https://open.douyin.com/player/video?vid=${vid}&autoplay=0` };
    return { platform: '抖音', message: '请使用具体视频页面的完整链接。' };
  }
  if (belongs('xiaohongshu.com') || host === 'xhslink.com') return {
    platform: '小红书', message: '小红书内嵌播放尚未接入，请打开原页观看。' };
  if (host === 'b23.tv') return { platform: 'B站', message: '请打开短链接，复制视频页面的完整地址。' };
  return null;
}

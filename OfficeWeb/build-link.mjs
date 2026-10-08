const hosts = new Set(['b23.tv','www.bilibili.com','m.bilibili.com','bilibili.com',
  'v.douyin.com','www.douyin.com','douyin.com','www.iesdouyin.com','iesdouyin.com']);
function checked(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.port || url.username || url.password || !hosts.has(url.hostname))
    throw Error('不支持此视频链接');
  return url;
}
export async function resolveBuildLink(value, fetcher = fetch) {
  let url = checked(value);
  if (!['b23.tv','v.douyin.com'].includes(url.hostname)) throw Error('仅解析视频短链接');
  const signal = AbortSignal.timeout(6000);
  for (let i = 0; i < 5; i++) {
    const response = await fetcher(url, { redirect: 'manual', signal });
    await response.body?.cancel();
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw Error('短链接未返回视频地址');
      url = checked(new URL(location, url).href);
    } else {
      if (!response.ok) throw Error('暂时无法解析视频链接');
      return url.href;
    }
  }
  throw Error('短链接跳转过多，请使用完整视频地址');
}

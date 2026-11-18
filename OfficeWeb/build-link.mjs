/** Normalize supported public video links without requesting arbitrary URLs. */
export function videoLink(value) {
  let url;
  try { url = new URL(String(value)); } catch { return null; }
  if (url.protocol !== 'https:' || url.port || url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)) {
    const id = host === 'youtu.be' ? url.pathname.slice(1).split('/')[0]
      : url.pathname === '/watch' ? url.searchParams.get('v')
        : url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)\/?$/)?.[1];
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    return { platform: 'youtube', id, url: `https://www.youtube.com/watch?v=${id}` };
  }
  if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
    const id = url.pathname.match(/^\/(?:video\/)?(\d+)\/?$/)?.[1];
    if (id) return { platform: 'vimeo', id, url: `https://vimeo.com/${id}` };
  }
  return null;
}
export async function resolveBuildLink(value) {
  const link = videoLink(value);
  if (!link) throw Error('Unsupported video link');
  return link.url;
}

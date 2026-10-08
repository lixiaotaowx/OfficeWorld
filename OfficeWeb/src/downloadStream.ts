// 把一条 HTTP 流按块搬过来——聊天下载（`/api/chat/files/:id`）用的就是它。
//
// 单独一个模块的原因有两个：`fileTransfer.ts` 已经贴着 500 行上限；而且
// "怎么搬一条流" 和 "这条传输在通道里是什么状态" 本来就是两件事，分开更好测。

/** 服务器已经没有这一份了（聊天附件只保留 7 天），重试也没用。 */
export class DownloadGoneError extends Error {}

export interface StreamResult {
  /** 实际收下的字节数。 */
  received: number;
  /** 服务器在 `Content-Length` 里声明的大小；没有就是 0。 */
  declared: number;
}

/**
 * 拉 `url`，把每一块交给 `onChunk`（会 await，所以天然带背压：写盘慢就会把读取拖慢）。
 *
 * `timeoutMs` 是**整条请求**的期限（`AbortSignal.timeout` 的语义），所以要按文件大小给
 * （见 `fileTransferRules.downloadTimeoutMs`）——写死一个值会让大文件永远下不完。
 */
export async function streamResponse(input: {
  url: string;
  timeoutMs?: number;
  onChunk: (bytes: Uint8Array) => void | Promise<void>;
  /** 拿到响应头、还没开始读正文时回调一次：调用方据此校正进度条的总量。 */
  onStart?: (info: { declared: number }) => void;
  /** 测试用；缺省是全局 `fetch`。 */
  fetchImpl?: typeof fetch;
}): Promise<StreamResult> {
  const doFetch = input.fetchImpl || fetch;
  const response = await doFetch(input.url, {
    credentials: 'same-origin',
    ...(input.timeoutMs ? { signal: AbortSignal.timeout(input.timeoutMs) } : {}),
  });
  if (response.status === 404 || response.status === 410) {
    throw new DownloadGoneError('服务器上的副本已过期（只保留 7 天）');
  }
  if (!response.ok) throw Error(`文件下载失败（HTTP ${response.status}），请重试`);
  const declared = Number(response.headers.get('content-length')) || 0;
  input.onStart?.({ declared });
  const reader = response.body?.getReader();
  if (!reader) throw Error('这个浏览器不支持流式下载，请换用桌面客户端');
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value?.length) continue;
    await input.onChunk(value);
    received += value.length;
  }
  return { received, declared };
}

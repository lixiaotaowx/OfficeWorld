import { useEffect, useRef, useState } from "react";
import type { ChatAttachment, Message } from "./types";
import type { FileTransferRow } from "./fileTransferRules";
import { formatBytes, percentOf, statusText } from "./fileTransferRules";
import { PREFETCH_MAX_BYTES } from "./chatAttachments";
import type { FileTransfers } from "./useFileTransfers";
import "./chat-files.css";

export interface ChatFileActions {
  onFile: (file: File, progress: (percent: number) => void, recipientId?: string) => Promise<boolean>;
  loadFile: (file: ChatAttachment) => Promise<Blob>;
  /**
   * 文件直传那条通道（用户 2026-09-21：「整理一下聊天框里面的文件下载，要带进度条，
   * 要软件内设置好下载位置，下载好了也还是有几个按钮 打开等，复用」）。
   * 聊天下载**完全复用**它：同一个接收文件夹、同一份进度、同一个任务栏进度条、
   * 同一张卡片和同样的「打开 / 打开文件夹」。
   */
  files: FileTransfers;
}
interface Props extends ChatFileActions {
  privateChat?: boolean;
  messages: Message[];
  accountId: string;
  connected: boolean;
  text: string;
  onText: (text: string) => void;
  onSend: (event: React.FormEvent) => void;
}

// Preview only raster formats identified from bytes. HTML/SVG and documents
// remain downloads and cannot execute as same-origin content.
async function imageType(blob: Blob) {
  const bytes = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  if (bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  const signature = String.fromCharCode(...bytes);
  if (signature.startsWith("GIF87a") || signature.startsWith("GIF89a")) return "image/gif";
  if (signature.startsWith("RIFF") && signature.slice(8) === "WEBP") return "image/webp";
  return "";
}

/** 这一条附件在传输通道里的记录（没下过就是 undefined）。行 id 就是附件 id。 */
function transferRow(files: FileTransfers, id: string): FileTransferRow | undefined {
  return files.rows.find(row => row.id === id);
}

export function AttachmentView({ file, loadFile, files, own }: {
  own: boolean; file: ChatAttachment; loadFile: ChatFileActions["loadFile"]; files: FileTransfers;
}) {
  const [url, setUrl] = useState("");
  const [image, setImage] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const loader = useRef(loadFile);
  loader.current = loadFile;
  const row = transferRow(files, file.id);
  // 只对小附件做后台预取（图片预览 + 离线可看）。大文件点了「下载」才走传输通道，
  // 否则打开一次聊天就会静默拉几个 GB（用户 2026-09-21 把上限提到 2 GB 之后这条尤其重要）。
  const previewable = file.size <= PREFETCH_MAX_BYTES;
  useEffect(() => {
    if (!previewable) { setUrl(""); setImage(false); setError(""); return; }
    let disposed = false, objectUrl = "";
    setError(""); setUrl("");
    void loader.current(file).then(async blob => {
      const mime = await imageType(blob);
      if (disposed) return;
      objectUrl = URL.createObjectURL(mime ? blob.slice(0, blob.size, mime) : blob);
      setImage(!!mime); setUrl(objectUrl);
    }).catch(e => { if (!disposed) setError(e.message); });
    return () => { disposed = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [file.id, retry, previewable]);
  const downloading = row?.status === 'receiving';
  const done = row?.status === 'done';
  const state = row ? statusText(row) : (url ? '已保存到本机' : previewable ? (error || '正在接收并保存…') : '');
  return <div className="chat-attachment">
    {url && image && <button type="button" className="chat-image" onClick={() => dialog.current?.showModal()}>
      <img src={url} alt={file.name} loading="lazy" />
    </button>}
    <span className="chat-filename">{file.name}</span>
    <small>{formatBytes(file.size)}{(!url || !own) && state && <> · {state}</>}</small>
    {/* 下载进度：和头像直传同一条被限流的进度（用户要"带进度条"）。 */}
    {downloading && <div className={`chat-file-bar ${row?.status}`} role="progressbar"
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percentOf(row!) * 100)}>
      <i style={{ width: `${Math.max(2, Math.round(percentOf(row!) * 100))}%` }} />
    </div>}
    <div className="chat-file-actions">
      {!done && !downloading && <button type="button" onClick={() => files.downloadAttachment({
        id: file.id, name: file.name, size: file.size,
        url: `/api/chat/files/${encodeURIComponent(file.id)}`,
      })}>{row?.status === 'failed' ? '重新下载' : '下载'}</button>}
      {done && <button type="button" onClick={() => files.open(file.id)}>打开</button>}
      {done && (row?.path || row?.folder) &&
        <button type="button" onClick={() => files.reveal(file.id)}>打开文件夹</button>}
      {downloading && <button type="button" onClick={() => files.cancel(file.id)}>取消</button>}
      {!done && !downloading && url && <a href={url} download={file.name}>另存一份</a>}
      {!done && !downloading && previewable && error &&
        <button type="button" onClick={() => setRetry(n => n + 1)}>重新接收</button>}
    </div>
    {image && <dialog ref={dialog} className="chat-image-dialog" onClick={() => dialog.current?.close()}>
      <button type="button" onClick={() => dialog.current?.close()}>关闭图片</button>
      <img src={url} alt={file.name} />
    </dialog>}
  </div>;
}

export default function ChatPanel({ messages, accountId, connected, text, onText, onSend,
  onFile, loadFile, files, privateChat }: Props) {
  const [visible, setVisible] = useState(100);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File>();
  const input = useRef<HTMLInputElement>(null);
  const messagesBox = useRef<HTMLDivElement>(null);
  const followMessages = useRef(true);
  useEffect(() => {
    const box = messagesBox.current;
    if (box && (followMessages.current || messages.at(-1)?.senderId === accountId)) box.scrollTop = box.scrollHeight;
  }, [messages.length, accountId]);
  async function sendFile() {
    if (!file || sending) return;
    setSending(true); setProgress(0);
    try { if (await onFile(file, setProgress)) setFile(undefined); }
    finally { setSending(false); }
  }
  return <div className="chat">
    <small className="chat-retention">本机记录不自动删除 · 服务器保留 7 天</small>
    <div className="messages" ref={messagesBox} onScroll={() => {
      const box = messagesBox.current;
      if (box) followMessages.current = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
    }}>
      {messages.length > visible && <button type="button" onClick={() => setVisible(n => n + 100)}>
        查看更早的消息（还有 {messages.length - visible} 条）</button>}
      {!messages.length && <div className="chat-empty">让交流自然发生。
        <small>{privateChat ? '仅你们两人可见' : '公共聊天 · 所有人可见'} · 支持文字、图片与文件。</small></div>}
      {messages.slice(-visible).map(message => <article key={message.id} className={message.senderId === accountId ? 'message-own' : ''}>
        <strong>{message.name} · {new Date(message.time).toLocaleString()}</strong>
        {message.text && <p>{message.text}</p>}
        {message.attachment && <AttachmentView file={message.attachment} loadFile={loadFile} files={files}
          own={message.senderId === accountId} />}
      </article>)}
    </div>
    <div className="chat-file-tools">
      <input ref={input} hidden type="file" aria-label="选择图片或文件" onChange={e => {
        setFile(e.target.files?.[0]); e.target.value = "";
      }} />
      <button type="button" disabled={!connected || sending} onClick={() => input.current?.click()}>＋ 图片 / 文件</button>
      <small>单个不超过 2 GB</small>
      {file && <div className="chat-file-selection">
        <span>{file.name} · {formatBytes(file.size)}</span>
        <button type="button" disabled={!connected || sending} onClick={() => void sendFile()}>
          {sending ? `发送中 ${progress}%` : "发送文件"}</button>
        <button type="button" disabled={sending} onClick={() => setFile(undefined)}>移除</button>
      </div>}
    </div>
    <form onSubmit={onSend}>
      <input value={text} onChange={e => onText(e.target.value)} placeholder="给伙伴留句话…"
        maxLength={1000} aria-label="聊天消息" />
      <button disabled={!connected || !text.trim()} type="submit">发送</button>
    </form>
  </div>;
}

import { useEffect, useRef, useState } from "react";
import type { ChatAttachment, Message } from "./types";
import "./chat-files.css";

export interface ChatFileActions {
  onFile: (file: File, progress: (percent: number) => void, recipientId?: string) => Promise<boolean>;
  loadFile: (file: ChatAttachment) => Promise<Blob>;
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
const sizeLabel = (size: number) => size < 1024 * 1024
  ? `${Math.ceil(size / 1024)} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;

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

export function AttachmentView({ file, loadFile, own }: {
  own: boolean; file: ChatAttachment; loadFile: ChatFileActions["loadFile"];
}) {
  const [url, setUrl] = useState("");
  const [image, setImage] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const loader = useRef(loadFile);
  loader.current = loadFile;
  useEffect(() => {
    let disposed = false, objectUrl = "";
    setError(""); setUrl("");
    void loader.current(file).then(async blob => {
      const mime = await imageType(blob);
      if (disposed) return;
      objectUrl = URL.createObjectURL(mime ? blob.slice(0, blob.size, mime) : blob);
      setImage(!!mime); setUrl(objectUrl);
    }).catch(e => { if (!disposed) setError(e.message); });
    return () => { disposed = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [file.id, retry]);
  return <div className="chat-attachment">
    {url && image && <button type="button" className="chat-image" onClick={() => dialog.current?.showModal()}>
      <img src={url} alt={file.name} loading="lazy" />
    </button>}
    <span className="chat-filename">{file.name}</span>
    <small>{sizeLabel(file.size)}{(!url || !own) &&
      <> · {url ? "已保存到本机" : error || "正在接收并保存…"}</>}</small>
    {url && <a href={url} download={file.name}>下载文件</a>}
    {error && <button type="button" onClick={() => setRetry(n => n + 1)}>重新接收</button>}
    {image && <dialog ref={dialog} className="chat-image-dialog" onClick={() => dialog.current?.close()}>
      <button type="button" onClick={() => dialog.current?.close()}>关闭图片</button>
      <img src={url} alt={file.name} />
    </dialog>}
  </div>;
}

export default function ChatPanel({ messages, accountId, connected, text, onText, onSend, onFile, loadFile, privateChat }: Props) {
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
        {message.attachment && <AttachmentView file={message.attachment} loadFile={loadFile}
          own={message.senderId === accountId} />}
      </article>)}
    </div>
    <div className="chat-file-tools">
      <input ref={input} hidden type="file" aria-label="选择图片或文件" onChange={e => {
        setFile(e.target.files?.[0]); e.target.value = "";
      }} />
      <button type="button" disabled={!connected || sending} onClick={() => input.current?.click()}>＋ 图片 / 文件</button>
      <small>单个不超过 20 MB</small>
      {file && <div className="chat-file-selection">
        <span>{file.name} · {sizeLabel(file.size)}</span>
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

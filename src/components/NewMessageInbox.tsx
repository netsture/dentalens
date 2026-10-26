import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FileText, Image as ImageIcon, MessageSquare, Paperclip, Send, X } from "lucide-react";

type ReplyAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

type MessageReply = { from: string; body: string; time: string; attachments?: ReplyAttachment[] };

type InboxMessage = {
  id: string;
  from: string;
  patient: string;
  patientId: string;
  office: string;
  subject: string;
  body: string;
  time: string;
  unread: boolean;
  replies: MessageReply[];
};

const seedMessages: InboxMessage[] = [
  {
    id: "m1",
    from: "Nishita",
    patient: "MORELL ALBERTO",
    patientId: "375000",
    office: "LORETTO AVE GD-OS-1044",
    subject: "Need eligibility recheck",
    body: "Aetna Open Access is showing pending. Please recheck and reply with the status.",
    time: "10-10-2026 10:08 AM",
    unread: true,
    replies: [],
  },
  {
    id: "m2",
    from: "Front Desk",
    patient: "REESE TERRY",
    patientId: "900889",
    office: "LORETTO AVE GD-OS-1044",
    subject: "Secondary insurance missing",
    body: "Jefferson secondary is not on file. Can you add it before the 10:20 appointment?",
    time: "10-10-2026 09:42 AM",
    unread: true,
    replies: [],
  },
  {
    id: "m3",
    from: "Nikita",
    patient: "SMITH ZEFFELI",
    patientId: "100500",
    office: "OLNEY AVENUE-GD",
    subject: "Eligibility done",
    body: "Delta Dental PPO verified last night. Ready for check-in.",
    time: "10-09-2026 09:26 PM",
    unread: false,
    replies: [{ from: "You", body: "Noted, marked checked.", time: "10-09-2026 09:40 PM" }],
  },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentList({
  items,
  onRemove,
}: {
  items: ReplyAttachment[];
  onRemove?: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1 mt-1.5">
      {items.map((file) => {
        const isImage = file.type.startsWith("image/");
        return (
          <div
            key={file.id}
            className="flex items-center gap-2 border border-border rounded-[3px] bg-secondary/40 px-2 py-1.5"
          >
            {isImage && file.url ? (
              <img src={file.url} alt="" className="w-8 h-8 object-cover rounded-[2px] shrink-0 border border-border" />
            ) : isImage ? (
              <ImageIcon className="w-3.5 h-3.5 text-primary shrink-0" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              {file.url ? (
                <a
                  href={file.url}
                  download={file.name}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-medium text-primary hover:underline truncate block"
                  onClick={(e) => e.stopPropagation()}
                >
                  {file.name}
                </a>
              ) : (
                <div className="text-[11px] font-medium truncate">{file.name}</div>
              )}
              <div className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</div>
            </div>
            {onRemove ? (
              <button
                type="button"
                className="btn h-6 px-1.5"
                title="Remove attachment"
                onClick={() => onRemove(file.id)}
              >
                <X className="w-3 h-3" />
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function NewMessageInbox({ replyPlaceholder = "Type a reply..." }: { replyPlaceholder?: string }) {
  const [messages, setMessages] = useState(seedMessages);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [inboxPos, setInboxPos] = useState({ top: 0, left: 0 });
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [attachments, setAttachments] = useState<ReplyAttachment[]>([]);
  const inboxBtnRef = useRef<HTMLButtonElement>(null);
  const inboxPanelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const unreadCount = messages.filter((msg) => msg.unread).length;
  const replyMessage = messages.find((msg) => msg.id === replyId) ?? null;

  const placeInbox = () => {
    const el = inboxBtnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = 400;
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
    setInboxPos({ top: rect.bottom + 8, left });
  };

  const toggleInbox = () => {
    setInboxOpen((open) => {
      if (!open) placeInbox();
      return !open;
    });
  };

  useEffect(() => {
    if (!inboxOpen) return;
    placeInbox();
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (inboxBtnRef.current?.contains(target) || inboxPanelRef.current?.contains(target)) return;
      setInboxOpen(false);
    };
    const onReposition = () => placeInbox();
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [inboxOpen]);

  const clearAttachments = () => {
    setAttachments((current) => {
      current.forEach((file) => {
        if (file.url.startsWith("blob:")) URL.revokeObjectURL(file.url);
      });
      return [];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeReply = () => {
    setReplyId(null);
    setReplyText("");
    clearAttachments();
  };

  const openReply = (id: string) => {
    setReplyId(id);
    setReplyText("");
    clearAttachments();
    setInboxOpen(false);
    setMessages((current) => current.map((msg) => (msg.id === id ? { ...msg, unread: false } : msg)));
  };

  const addAttachments = (files: FileList | null) => {
    if (!files?.length) return;
    const next = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    setAttachments((current) => [...current, ...next]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((current) => {
      const file = current.find((item) => item.id === id);
      if (file?.url.startsWith("blob:")) URL.revokeObjectURL(file.url);
      return current.filter((item) => item.id !== id);
    });
  };

  const sendReply = () => {
    const text = replyText.trim();
    if (!replyId || (!text && attachments.length === 0)) return;
    setMessages((current) =>
      current.map((msg) =>
        msg.id === replyId
          ? {
              ...msg,
              unread: false,
              replies: [
                ...msg.replies,
                {
                  from: "You",
                  body: text || (attachments.length === 1 ? "Sent an attachment." : `Sent ${attachments.length} attachments.`),
                  time: "Just now",
                  attachments: attachments.map((file) => ({ ...file })),
                },
              ],
            }
          : msg
      )
    );
    setReplyText("");
    setAttachments([]);
    setReplyId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <div className="relative">
        <button
          type="button"
          ref={inboxBtnRef}
          className={`btn ${unreadCount > 0 ? "btn-alert-blink" : ""}`}
          onClick={toggleInbox}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          New Message
          {unreadCount > 0 ? (
            <span className="min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[9px] leading-4 text-center">
              {unreadCount}
            </span>
          ) : null}
        </button>
        {inboxOpen
          ? createPortal(
              <div
                ref={inboxPanelRef}
                className="fixed w-[400px] max-w-[calc(100vw-16px)] bg-card border border-border rounded-[3px] shadow-xl overflow-hidden"
                style={{ top: inboxPos.top, left: inboxPos.left, zIndex: 3200 }}
              >
                <div className="px-2.5 py-1.5 border-b border-border flex items-center justify-between bg-secondary/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Messages</span>
                  <span className="text-[10px] text-muted-foreground">{unreadCount} unread</span>
                </div>
                <div className="max-h-[320px] overflow-auto">
                  {messages.length === 0 ? (
                    <div className="px-3 py-6 text-[11px] text-muted-foreground text-center">No messages.</div>
                  ) : (
                    messages.map((msg) => (
                      <button
                        key={msg.id}
                        type="button"
                        className={`w-full text-left px-2.5 py-2.5 border-b border-border last:border-b-0 cursor-pointer hover:bg-secondary ${
                          msg.unread ? "bg-rose-50" : "bg-card"
                        }`}
                        onClick={() => openReply(msg.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[12px] ${msg.unread ? "font-bold text-rose-700" : "font-semibold"}`}>
                            {msg.from}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">{msg.time}</span>
                        </div>
                        <div className="text-[12px] font-medium mt-0.5">{msg.subject}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {msg.patient} · {msg.patientId} · {msg.office}
                        </div>
                        <p className="text-[11px] leading-snug mt-1">{msg.body}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>,
              document.body
            )
          : null}
      </div>

      {replyMessage
        ? createPortal(
            <div
              className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4"
              onClick={closeReply}
            >
              <div
                className="panel bg-card w-full max-w-lg shadow-xl flex flex-col max-h-[calc(100vh-48px)]"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="new-message-reply-title"
              >
                <div className="panel-header shrink-0">
                  <div id="new-message-reply-title" className="panel-title flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    Reply to {replyMessage.from}
                  </div>
                  <button type="button" className="btn h-7 px-2" onClick={closeReply} aria-label="Close">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3 flex flex-col gap-2 overflow-auto">
                  <div className="text-[11px] text-muted-foreground">
                    {replyMessage.patient} · {replyMessage.patientId} · {replyMessage.office}
                  </div>
                  <div className="border border-border rounded-[3px] bg-secondary/40 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-semibold">{replyMessage.subject}</span>
                      <span className="text-[10px] text-muted-foreground">{replyMessage.time}</span>
                    </div>
                    <p className="text-[12px] mt-1 leading-snug">{replyMessage.body}</p>
                  </div>
                  {replyMessage.replies.map((reply, index) => (
                    <div key={`${reply.time}-${index}`} className="border border-border rounded-[3px] bg-card p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold">{reply.from}</span>
                        <span className="text-[10px] text-muted-foreground">{reply.time}</span>
                      </div>
                      <p className="text-[12px] mt-1 leading-snug">{reply.body}</p>
                      <AttachmentList items={reply.attachments ?? []} />
                    </div>
                  ))}
                  <div className="field">
                    <label>Your reply</label>
                    <textarea
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={replyPlaceholder}
                    />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Attachments{attachments.length > 0 ? ` (${attachments.length})` : ""}
                    </div>
                    <AttachmentList items={attachments} onRemove={removeAttachment} />
                    {attachments.length === 0 ? (
                      <div className="text-[11px] text-muted-foreground">No files attached.</div>
                    ) : null}
                  </div>
                </div>
                <div className="px-3 py-2 border-t border-border flex items-center justify-between gap-1.5">
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => addAttachments(e.target.files)}
                    />
                    <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>
                      <Paperclip className="w-3.5 h-3.5" /> Attach
                    </button>
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button type="button" className="btn" onClick={closeReply}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={sendReply}
                      disabled={!replyText.trim() && attachments.length === 0}
                    >
                      <Send className="w-3.5 h-3.5" /> Send Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

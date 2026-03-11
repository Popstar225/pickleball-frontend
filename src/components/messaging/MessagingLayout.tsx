import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  Check,
  CheckCheck,
  Loader2,
  Users,
  Megaphone,
  X,
  AlertCircle,
  ChevronRight,
  Building2,
  Shield,
  MapPin,
  UserCircle,
  Dumbbell,
  Paperclip,
  FileText,
  Download,
  Smile,
} from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import {
  fetchConversations,
  fetchThread,
  sendMessage,
  findUserByEmail,
  setActiveConversation,
  setSelectedAnnouncement,
  addOptimisticMessage,
  clearUnreadForPartner,
  markThreadAsRead,
  fetchAnnouncements,
  markAnnouncementRead,
  upsertConversation,
  Conversation,
  ChatMessage,
  Announcement,
} from '@/store/slices/messagesSlice';
import { useMessagingSocket } from '@/hooks/useMessagingSocket';
import EmojiPicker from './EmojiPicker';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BroadcastRole = 'admin' | 'state' | 'club' | 'coach';

interface BroadcastOption {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const BROADCAST_OPTIONS: Record<BroadcastRole, BroadcastOption[]> = {
  admin: [
    { label: 'Todos los Jugadores', value: 'all_players', icon: Users, color: 'text-[#ace600]', bg: 'bg-[#ace600]/10 border-[#ace600]/20' },
    { label: 'Todos los Clubes', value: 'all_clubs', icon: Building2, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
    { label: 'Todos los Estados', value: 'all_states', icon: MapPin, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { label: 'Todos los Partners', value: 'all_partners', icon: Shield, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  ],
  state: [
    { label: 'Jugadores del Estado', value: 'state_players', icon: Users, color: 'text-[#ace600]', bg: 'bg-[#ace600]/10 border-[#ace600]/20' },
    { label: 'Clubes del Estado', value: 'state_clubs', icon: Building2, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  ],
  club: [
    { label: 'Todos los Miembros', value: 'club_members', icon: Users, color: 'text-[#ace600]', bg: 'bg-[#ace600]/10 border-[#ace600]/20' },
  ],
  coach: [
    { label: 'Mis Estudiantes', value: 'my_students', icon: Dumbbell, color: 'text-[#ace600]', bg: 'bg-[#ace600]/10 border-[#ace600]/20' },
  ],
};

const USER_TYPE_ICON: Record<string, React.ElementType> = {
  player: UserCircle,
  coach: Dumbbell,
  club: Building2,
  state: MapPin,
  admin: Shield,
  partner: Shield,
};

interface MessagingLayoutProps {
  role?: BroadcastRole;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMessageTime(ts: string | null | undefined) {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Ayer';
  return format(d, 'dd MMM', { locale: es });
}

function formatThreadTime(ts: string | null | undefined) {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '';
  return format(d, 'HH:mm');
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function AttachmentDisplay({ attachment }: { attachment: { url: string; name: string; type: string; size: number } }) {
  const isImage = attachment.type.startsWith('image/');
  const sizeKB = Math.round(attachment.size / 1024);

  if (isImage) {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block mt-1.5">
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-w-[220px] max-h-[180px] rounded-xl object-cover border border-white/10 hover:opacity-90 transition-opacity cursor-pointer"
        />
      </a>
    );
  }
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      download={attachment.name}
      className="flex items-center gap-2 mt-1.5 bg-white/[0.06] border border-white/[0.1] rounded-xl px-3 py-2 hover:bg-white/[0.1] transition-colors max-w-[220px]"
    >
      <FileText className="h-4 w-4 text-white/50 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-white/80 truncate font-medium">{attachment.name}</p>
        <p className="text-[10px] text-white/35">{sizeKB} KB</p>
      </div>
      <Download className="h-3.5 w-3.5 text-white/40 shrink-0" />
    </a>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OnlineDot({ userId }: { userId: string }) {
  const status = useSelector((s: RootState) => s.messages.onlineUsers[userId]);
  if (!status?.is_online) return null;
  return <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-[#0d1117]" />;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function NewChatDialog({
  open,
  onClose,
  onStart,
}: {
  open: boolean;
  onClose: () => void;
  onStart: (user: any) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!email.trim()) return;
    setSearching(true);
    setError('');
    setResult(null);
    try {
      const res = await dispatch(findUserByEmail(email.trim())).unwrap();
      const data = (res as any)?.data;
      if (data) setResult(data);
      else setError((res as any)?.message ?? 'Usuario no encontrado');
    } catch {
      setError('Usuario no encontrado');
    } finally {
      setSearching(false);
    }
  };

  const reset = () => {
    setEmail('');
    setResult(null);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="bg-[#161c25] border-white/[0.08] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-sm font-bold">Nueva Conversación</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <p className="text-xs text-white/40">Ingresa el email del usuario para iniciar un chat</p>
          <div className="flex gap-2">
            <Input
              placeholder="usuario@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/20 focus:border-[#ace600]/50 h-9 text-sm"
            />
            <Button
              onClick={handleSearch}
              disabled={!email.trim() || searching}
              className="h-9 bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold shrink-0"
            >
              {searching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
            </div>
          )}

          {result && (
            <button
              onClick={() => { onStart(result); reset(); onClose(); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] transition-colors text-left"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={result.profile_photo ?? undefined} />
                <AvatarFallback className="bg-[#ace600]/20 text-[#ace600] text-xs font-bold">
                  {getInitials(result.full_name || result.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {result.full_name || result.username}
                </p>
                <p className="text-xs text-white/40">{result.email}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-white/30 shrink-0" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BroadcastPanel({ role }: { role: BroadcastRole }) {
  const [selectedTarget, setSelectedTarget] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const broadcastFileRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const options = BROADCAST_OPTIONS[role] ?? [];

  const handleSend = async () => {
    if (!selectedTarget || !subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      const { api } = await import('@/lib/api');

      let attachmentMetadata: { attachment?: { url: string; name: string; type: string; size: number } } | null = null;
      if (attachmentFile) {
        const formData = new FormData();
        formData.append('message_attachment', attachmentFile);
        try {
          const res = await api.post<any, FormData>('/messages/upload-attachment', formData);
          if ((res as any)?.data) {
            attachmentMetadata = { attachment: (res as any).data };
          }
        } catch { /* skip attachment on failure */ }
      }

      await api.post('/messages/broadcast', {
        target_audience: selectedTarget,
        subject: subject.trim(),
        content: body.trim(),
        category: 'announcement',
        priority: 'medium',
        metadata: attachmentMetadata,
      });
      setSent(true);
      setSubject('');
      setBody('');
      setSelectedTarget('');
      setAttachmentFile(null);
      setTimeout(() => setSent(false), 3000);
    } catch {
      /* handled silently */
    } finally {
      setSending(false);
    }
  };

  const labelCls = 'block text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1.5';
  const inputCls =
    'w-full bg-white/[0.04] border border-white/[0.09] rounded-xl text-white/80 text-sm px-3.5 py-2.5 outline-none transition-all focus:border-[#ace600]/50 focus:bg-[#ace600]/[0.03] placeholder:text-white/20';

  return (
    <div className="h-full flex flex-col bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-[#ace600]/40 via-[#ace600]/20 to-transparent" />
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
        <div className="w-8 h-8 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center">
          <Megaphone className="w-4 h-4 text-[#ace600]" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Anuncio / Difusión</p>
          <p className="text-[11px] text-white/25">Envía un mensaje a múltiples destinatarios</p>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">
        {/* Target selector */}
        <div>
          <label className={labelCls}>Destinatarios <span className="text-[#ace600]">*</span></label>
          <div className="grid grid-cols-2 gap-2">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isActive = selectedTarget === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedTarget(opt.value)}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all',
                    isActive
                      ? `${opt.bg} ${opt.color} border-current`
                      : 'bg-white/[0.03] border-white/[0.07] text-white/40 hover:bg-white/[0.06]',
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className={labelCls}>Asunto <span className="text-[#ace600]">*</span></label>
          <input
            className={inputCls}
            placeholder="Asunto del anuncio…"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Body with emoji */}
        <div>
          <label className={labelCls}>Mensaje <span className="text-[#ace600]">*</span></label>
          <div className="relative">
            {showEmoji && (
              <div className="absolute bottom-full mb-1 left-0 z-50">
                <EmojiPicker
                  onSelect={(emoji) => {
                    const ta = bodyRef.current;
                    if (ta) {
                      const start = ta.selectionStart ?? body.length;
                      const end = ta.selectionEnd ?? body.length;
                      setBody(body.slice(0, start) + emoji + body.slice(end));
                      setTimeout(() => { ta.focus(); ta.setSelectionRange(start + emoji.length, start + emoji.length); }, 0);
                    } else {
                      setBody((p) => p + emoji);
                    }
                    setShowEmoji(false);
                  }}
                  onClose={() => setShowEmoji(false)}
                />
              </div>
            )}
            <textarea
              ref={bodyRef}
              rows={5}
              className={cn(inputCls, 'resize-y')}
              placeholder="Escribe tu anuncio aquí…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onFocus={() => setShowEmoji(false)}
            />
            <div className="flex items-center gap-1 mt-1.5">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/50 transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.04]"
              >
                <Smile className="h-3.5 w-3.5" /> Emoji
              </button>
              <button
                onClick={() => broadcastFileRef.current?.click()}
                className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/50 transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.04]"
              >
                <Paperclip className="h-3.5 w-3.5" /> Adjuntar
              </button>
              <input
                ref={broadcastFileRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setAttachmentFile(f);
                  e.target.value = '';
                }}
              />
              {body.length > 0 && (
                <span className="text-[10px] text-white/20 ml-auto">{body.length} caracteres</span>
              )}
            </div>
            {/* Attachment preview */}
            {attachmentFile && (
              <div className="mt-2 flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2">
                {attachmentFile.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(attachmentFile)}
                    alt={attachmentFile.name}
                    className="h-8 w-8 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <FileText className="h-4 w-4 text-white/40 shrink-0" />
                )}
                <span className="text-xs text-white/60 truncate flex-1">{attachmentFile.name}</span>
                <button
                  onClick={() => setAttachmentFile(null)}
                  className="text-white/30 hover:text-white/60 transition-colors shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-white/[0.05] flex items-center justify-between">
        {sent ? (
          <span className="text-xs text-[#ace600] font-semibold flex items-center gap-1.5">
            <CheckCheck className="h-4 w-4" /> ¡Anuncio enviado!
          </span>
        ) : (
          <p className="text-[10px] text-white/20">
            {!selectedTarget || !subject.trim() || !body.trim()
              ? 'Completa todos los campos'
              : 'Listo para enviar'}
          </p>
        )}
        <button
          onClick={handleSend}
          disabled={!selectedTarget || !subject.trim() || !body.trim() || sending}
          className="inline-flex items-center gap-1.5 h-9 px-5 rounded-xl text-xs font-bold bg-[#ace600] hover:bg-[#c0f000] text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {sending ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enviando…</>
          ) : (
            <><Send className="h-3.5 w-3.5" /> Enviar</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MessagingLayout({ role }: MessagingLayoutProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((s: RootState) => s.auth);
  const {
    conversations,
    activeConversationId,
    messagesByPartner,
    typingUsers,
    conversationsLoading,
    threadLoading,
    sending,
    unreadTotal,
    announcements,
    announcementsUnread,
    announcementsLoading,
    selectedAnnouncementId,
  } = useSelector((s: RootState) => s.messages);

  const { sendSocketMessage, sendTyping, checkUserStatus, markRead } = useMessagingSocket();


  const [search, setSearch] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'broadcast'>('chat');
  const [sidebarTab, setSidebarTab] = useState<'chats' | 'announcements'>('chats');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const broadcastFileInputRef = useRef<HTMLInputElement>(null);

  const canBroadcast = role && BROADCAST_OPTIONS[role]?.length > 0;
  const selectedAnnouncement = announcements.find((a: Announcement) => a.id === selectedAnnouncementId) ?? null;

  // ─── Load conversations + announcements on mount ───────────────────────────

  useEffect(() => {
    dispatch(fetchConversations());
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  // ─── Load thread when conversation changes ────────────────────────────────

  useEffect(() => {
    if (!activeConversationId) return;
    dispatch(fetchThread(activeConversationId));
    dispatch(clearUnreadForPartner(activeConversationId));
    dispatch(markThreadAsRead(activeConversationId));
    checkUserStatus(activeConversationId);
  }, [activeConversationId, dispatch, checkUserStatus]);

  // ─── Auto-scroll to bottom ────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesByPartner, activeConversationId]);

  // ─── Send message ─────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    if ((!messageInput.trim() && !attachmentFile) || !activeConversationId || !user) return;

    const content = messageInput.trim() || ' ';
    const activeConv = conversations.find((c) => c.partner_id === activeConversationId);

    let attachmentMetadata: { attachment?: { url: string; name: string; type: string; size: number } } | null = null;

    if (attachmentFile) {
      setAttachmentUploading(true);
      try {
        const formData = new FormData();
        formData.append('message_attachment', attachmentFile);
        const { api } = await import('@/lib/api');
        const res = await api.post<any, FormData>('/messages/upload-attachment', formData);
        if ((res as any)?.data) {
          attachmentMetadata = { attachment: (res as any).data };
        }
      } catch {
        // attachment upload failed, send without
      } finally {
        setAttachmentUploading(false);
        setAttachmentFile(null);
      }
    }

    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      sender_id: user.id,
      recipient_id: activeConversationId,
      content: messageInput.trim() || '',
      message_type: 'direct_message',
      status: 'sent',
      is_read: false,
      created_at: new Date().toISOString(),
      metadata: attachmentMetadata,
      sender: {
        id: user.id,
        full_name: user.full_name || user.username,
        username: user.username,
        user_type: user.user_type,
        profile_photo: user.profile_photo ?? null,
      },
    };

    dispatch(addOptimisticMessage(optimistic));
    setMessageInput('');

    sendSocketMessage({
      recipient_id: activeConversationId,
      content: optimistic.content || ' ',
      subject: activeConv ? `Chat con ${activeConv.partner_name}` : 'Mensaje directo',
      metadata: attachmentMetadata,
    });
  }, [messageInput, attachmentFile, activeConversationId, user, conversations, sendSocketMessage, dispatch]);

  // ─── Typing indicator ─────────────────────────────────────────────────────

  const handleInputChange = (val: string) => {
    setMessageInput(val);
    if (!activeConversationId) return;

    sendTyping(activeConversationId, true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTyping(activeConversationId, false);
    }, 2000);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // ─── Start a new conversation ─────────────────────────────────────────────

  const handleStartConversation = (foundUser: any) => {
    // Ensure the user appears in the sidebar conversations list
    dispatch(
      upsertConversation({
        partner_id: foundUser.id,
        partner_name: foundUser.full_name || foundUser.username || foundUser.email,
        partner_type: foundUser.user_type || 'player',
        partner_photo: foundUser.profile_photo ?? null,
        last_message: '',
        last_message_at: new Date().toISOString(),
        last_message_is_mine: false,
        unread_count: 0,
      }),
    );
    dispatch(setActiveConversation(foundUser.id));
    dispatch(fetchThread(foundUser.id));
    setSidebarTab('chats');
  };

  // ─── Select a conversation ────────────────────────────────────────────────

  const handleSelectConversation = (conv: Conversation) => {
    dispatch(setActiveConversation(conv.partner_id));
  };

  // ─── Filtered conversations ───────────────────────────────────────────────

  const filteredConvs = conversations.filter((c) =>
    c.partner_name.toLowerCase().includes(search.toLowerCase()),
  );

  const activeConv = conversations.find((c) => c.partner_id === activeConversationId);
  const activeMessages = activeConversationId ? (messagesByPartner[activeConversationId] ?? []) : [];
  const partnerIsTyping = activeConversationId ? (typingUsers[activeConversationId] ?? false) : false;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-7rem)] gap-4 min-h-0">

        {/* ── LEFT SIDEBAR ────────────────────────────────────────────────── */}
        <div className="w-72 shrink-0 flex flex-col bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-[#ace600]/40 via-[#ace600]/20 to-transparent shrink-0" />

          {/* Sidebar tab switcher */}
          <div className="px-3 pt-3 pb-2.5 border-b border-white/[0.05] shrink-0 space-y-2.5">
            <div className="flex gap-1">
              <button
                onClick={() => setSidebarTab('chats')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-[11px] font-bold transition-all',
                  sidebarTab === 'chats'
                    ? 'bg-[#ace600]/10 text-[#ace600] border border-[#ace600]/25'
                    : 'text-white/35 hover:text-white/60 border border-transparent',
                )}
              >
                <MessageSquare className="h-3 w-3" />
                Chats
                {unreadTotal > 0 && (
                  <span className="flex h-4 min-w-4 px-0.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                    {unreadTotal > 99 ? '99+' : unreadTotal}
                  </span>
                )}
              </button>
              <button
                onClick={() => setSidebarTab('announcements')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-[11px] font-bold transition-all',
                  sidebarTab === 'announcements'
                    ? 'bg-[#ace600]/10 text-[#ace600] border border-[#ace600]/25'
                    : 'text-white/35 hover:text-white/60 border border-transparent',
                )}
              >
                <Megaphone className="h-3 w-3" />
                Anuncios
                {announcementsUnread > 0 && (
                  <span className="flex h-4 min-w-4 px-0.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-white">
                    {announcementsUnread > 99 ? '99+' : announcementsUnread}
                  </span>
                )}
              </button>
            </div>

            {/* Search (chats tab only) + new chat button */}
            {sidebarTab === 'chats' && (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
                  <Input
                    placeholder="Buscar…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-7 h-8 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 text-xs focus:border-[#ace600]/40 rounded-lg"
                  />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setNewChatOpen(true)}
                      className="h-8 w-8 rounded-lg bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center hover:bg-[#ace600]/20 transition-colors shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5 text-[#ace600]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-slate-800 text-white text-xs">
                    Nueva conversación
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Conversations list (chats tab) */}
          {sidebarTab === 'chats' && (
            <div className="flex-1 overflow-y-auto">
              {conversationsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-white/20" />
                  <p className="text-xs text-white/20">Cargando…</p>
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 px-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-white/10" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-white/25">Sin conversaciones</p>
                    <p className="text-[10px] text-white/15 mt-0.5">Inicia un chat con el botón +</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {filteredConvs.map((conv) => {
                    const isActive = activeConversationId === conv.partner_id;
                    const Icon = USER_TYPE_ICON[conv.partner_type] ?? UserCircle;
                    return (
                      <button
                        key={conv.partner_id}
                        onClick={() => handleSelectConversation(conv)}
                        className={cn(
                          'w-full flex items-start gap-3 px-3.5 py-3 text-left transition-all',
                          isActive ? 'bg-[#ace600]/[0.06]' : 'hover:bg-white/[0.025]',
                        )}
                      >
                        <div className="relative shrink-0 mt-0.5">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={conv.partner_photo ?? undefined} />
                            <AvatarFallback
                              className={cn(
                                'text-xs font-bold',
                                isActive ? 'bg-[#ace600]/20 text-[#ace600]' : 'bg-white/[0.06] text-white/60',
                              )}
                            >
                              {getInitials(conv.partner_name)}
                            </AvatarFallback>
                          </Avatar>
                          <OnlineDot userId={conv.partner_id} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={cn('text-xs font-semibold truncate', isActive ? 'text-white' : 'text-white/70')}>
                              {conv.partner_name}
                            </span>
                            <span className="text-[10px] text-white/25 shrink-0 ml-2">
                              {formatMessageTime(conv.last_message_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon className="h-2.5 w-2.5 text-white/20 shrink-0" />
                            <p className="text-[11px] text-white/35 truncate flex-1">
                              {conv.last_message_is_mine && <span className="text-white/20">Tú: </span>}
                              {conv.last_message}
                            </p>
                            {conv.unread_count > 0 && (
                              <Badge className="bg-[#ace600] text-black text-[9px] font-black px-1.5 py-0 h-4 ml-1 shrink-0">
                                {conv.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Announcements list (announcements tab) */}
          {sidebarTab === 'announcements' && (
            <div className="flex-1 overflow-y-auto">
              {announcementsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-white/20" />
                  <p className="text-xs text-white/20">Cargando…</p>
                </div>
              ) : announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 px-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                    <Megaphone className="h-5 w-5 text-white/10" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-white/25">Sin anuncios</p>
                    <p className="text-[10px] text-white/15 mt-0.5">Los anuncios recibidos aparecen aquí</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {(announcements as Announcement[]).map((ann) => {
                    const isSelected = selectedAnnouncementId === ann.id;
                    const senderName = ann.sender?.full_name || ann.sender?.username || ann.sender_name || 'Sistema';
                    return (
                      <button
                        key={ann.id}
                        onClick={() => {
                          dispatch(setSelectedAnnouncement(ann.id));
                          if (!ann.is_read) dispatch(markAnnouncementRead(ann.id));
                        }}
                        className={cn(
                          'w-full flex items-start gap-3 px-3.5 py-3 text-left transition-all',
                          isSelected ? 'bg-amber-500/[0.06]' : 'hover:bg-white/[0.025]',
                        )}
                      >
                        <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                          <Megaphone className="h-3.5 w-3.5 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={cn('text-xs font-semibold truncate', !ann.is_read ? 'text-white' : 'text-white/60')}>
                              {ann.subject || 'Anuncio'}
                            </span>
                            <span className="text-[10px] text-white/25 shrink-0 ml-2">
                              {formatMessageTime(ann.created_at)}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/35 truncate">{senderName}</p>
                          {!ann.is_read && (
                            <span className="inline-block mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Tab bar (only if canBroadcast) */}
          {canBroadcast && (
            <div className="flex gap-1 mb-3 w-fit">
              {[
                { key: 'chat', label: 'Chat', icon: MessageSquare },
                { key: 'broadcast', label: 'Anuncio', icon: Megaphone },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold transition-all',
                    activeTab === key
                      ? 'bg-[#ace600] text-black shadow-[0_0_10px_rgba(172,230,0,0.18)]'
                      : 'bg-[#0d1117] border border-white/[0.07] text-white/40 hover:text-white/70',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
          )}

          {/* Chat or Broadcast or Announcement detail panel */}
          {activeTab === 'broadcast' && canBroadcast ? (
            <div className="flex-1 min-h-0">
              <BroadcastPanel role={role!} />
            </div>
          ) : sidebarTab === 'announcements' && selectedAnnouncement ? (
            /* ── ANNOUNCEMENT DETAIL ──────────────────────────────────────── */
            <div className="flex-1 flex flex-col bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden min-h-0">
              <div className="h-0.5 bg-gradient-to-r from-amber-500/40 via-amber-500/20 to-transparent shrink-0" />
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/[0.05] flex items-start gap-3 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Megaphone className="h-4 w-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{selectedAnnouncement.subject || 'Anuncio'}</p>
                  <p className="text-[11px] text-white/35 mt-0.5">
                    De: <span className="text-white/50">
                      {selectedAnnouncement.sender?.full_name || selectedAnnouncement.sender?.username || selectedAnnouncement.sender_name || 'Sistema'}
                    </span>
                    <span className="mx-1.5 text-white/20">·</span>
                    {formatMessageTime(selectedAnnouncement.created_at)}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {selectedAnnouncement.priority && selectedAnnouncement.priority !== 'medium' && (
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                      selectedAnnouncement.priority === 'urgent'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : selectedAnnouncement.priority === 'high'
                          ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                          : 'bg-white/[0.05] border-white/[0.1] text-white/40',
                    )}>
                      {selectedAnnouncement.priority === 'urgent' ? '⚡ Urgente' : '↑ Alta prioridad'}
                    </span>
                  )}
                  {selectedAnnouncement.category && selectedAnnouncement.category !== 'general' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/35 capitalize">
                      {selectedAnnouncement.category}
                    </span>
                  )}
                </div>
              </div>
              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </p>
              </div>
              {/* Footer – read-only notice */}
              <div className="px-5 py-3 border-t border-white/[0.05] shrink-0 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-white/20 shrink-0" />
                <p className="text-[11px] text-white/20">Los anuncios no permiten respuesta</p>
              </div>
            </div>
          ) : sidebarTab === 'announcements' ? (
            /* ── ANNOUNCEMENTS EMPTY STATE ────────────────────────────────── */
            <div className="flex-1 flex flex-col bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden min-h-0 items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <Megaphone className="h-7 w-7 text-white/10" />
              </div>
              <p className="text-sm font-semibold text-white/25">Selecciona un anuncio</p>
            </div>
          ) : (
            /* ── CHAT THREAD ──────────────────────────────────────────────── */
            <div className="flex-1 flex flex-col bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden min-h-0">
              <div className="h-0.5 bg-gradient-to-r from-[#ace600]/40 via-[#ace600]/20 to-transparent shrink-0" />

              {activeConv ? (
                <>
                  {/* Chat header */}
                  <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center gap-3 shrink-0">
                    <div className="relative">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={activeConv.partner_photo ?? undefined} />
                        <AvatarFallback className="bg-[#ace600]/10 text-[#ace600] text-xs font-bold">
                          {getInitials(activeConv.partner_name)}
                        </AvatarFallback>
                      </Avatar>
                      <OnlineDot userId={activeConv.partner_id} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {activeConv.partner_name}
                      </p>
                      <p className="text-[11px] text-white/30 capitalize">
                        {partnerIsTyping ? (
                          <span className="text-[#ace600]">Escribiendo…</span>
                        ) : (
                          activeConv.partner_type
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                    {threadLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-white/20" />
                      </div>
                    ) : activeMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
                        <MessageSquare className="h-10 w-10 text-white/10" />
                        <p className="text-xs text-white/25">Empieza la conversación</p>
                      </div>
                    ) : (
                      <>
                        {activeMessages.map((msg) => {
                          const isMine = msg.sender_id === user?.id;
                          return (
                            <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                              {!isMine && (
                                <Avatar className="h-6 w-6 mr-2 shrink-0 self-end mb-1">
                                  <AvatarImage src={msg.sender?.profile_photo ?? undefined} />
                                  <AvatarFallback className="bg-white/[0.06] text-white/50 text-[9px]">
                                    {getInitials(msg.sender?.full_name ?? '?')}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={cn(
                                  'max-w-[70%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                                  isMine
                                    ? 'bg-[#ace600] text-black rounded-br-sm'
                                    : 'bg-white/[0.07] text-white/85 rounded-bl-sm',
                                )}
                              >
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                {msg.metadata?.attachment && (
                                  <AttachmentDisplay attachment={msg.metadata.attachment} />
                                )}
                                <div
                                  className={cn(
                                    'flex items-center justify-end gap-1 mt-1 text-[10px]',
                                    isMine ? 'text-black/40' : 'text-white/25',
                                  )}
                                >
                                  <span>{formatThreadTime(msg.created_at)}</span>
                                  {isMine && (
                                    msg.status === 'read' ? (
                                      <CheckCheck className="h-3 w-3 text-sky-400" />
                                    ) : msg.status === 'delivered' ? (
                                      <CheckCheck className="h-3 w-3" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {partnerIsTyping && (
                          <div className="flex justify-start">
                            <div className="bg-white/[0.07] rounded-2xl rounded-bl-sm">
                              <TypingDots />
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message input */}
                  <div className="px-4 py-3.5 border-t border-white/[0.05] shrink-0">
                    {/* Attachment preview */}
                    {attachmentFile && (
                      <div className="mb-2 flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2">
                        {attachmentFile.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(attachmentFile)}
                            alt={attachmentFile.name}
                            className="h-10 w-10 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <FileText className="h-5 w-5 text-white/40 shrink-0" />
                        )}
                        <span className="text-xs text-white/60 truncate flex-1">{attachmentFile.name}</span>
                        <button
                          onClick={() => setAttachmentFile(null)}
                          className="text-white/30 hover:text-white/60 transition-colors shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <div className="relative flex items-end gap-2">
                      {showEmojiPicker && (
                        <EmojiPicker
                          onSelect={(emoji) => setMessageInput((prev) => prev + emoji)}
                          onClose={() => setShowEmojiPicker(false)}
                        />
                      )}
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors shrink-0"
                        title="Emoji"
                      >
                        <Smile className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-9 w-9 flex items-center justify-center rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors shrink-0"
                        title="Adjuntar archivo"
                      >
                        <Paperclip className="h-5 w-5" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setAttachmentFile(f);
                          e.target.value = '';
                        }}
                      />
                      <textarea
                        rows={1}
                        placeholder="Escribe un mensaje…"
                        value={messageInput}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                          if (e.key === 'Escape') setShowEmojiPicker(false);
                        }}
                        onFocus={() => setShowEmojiPicker(false)}
                        className="flex-1 bg-white/[0.04] border border-white/[0.09] rounded-xl text-white/85 text-sm px-3.5 py-2.5 outline-none resize-none placeholder:text-white/20 focus:border-[#ace600]/50 transition-all max-h-32"
                        style={{ minHeight: 40 }}
                      />
                      <button
                        onClick={handleSend}
                        disabled={(!messageInput.trim() && !attachmentFile) || sending || attachmentUploading}
                        className="h-10 w-10 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                      >
                        {sending || attachmentUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-white/15 mt-1.5 ml-1">
                      Enter para enviar · Shift+Enter para nueva línea
                    </p>
                  </div>
                </>
              ) : (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                    <MessageSquare className="h-7 w-7 text-white/10" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white/25 mb-1">
                      Selecciona una conversación
                    </p>
                    <p className="text-xs text-white/15">
                      O inicia un chat nuevo con el botón +
                    </p>
                  </div>
                  <button
                    onClick={() => setNewChatOpen(true)}
                    className="flex items-center gap-1.5 h-8 px-4 rounded-xl text-xs font-bold bg-[#ace600]/10 border border-[#ace600]/20 text-[#ace600] hover:bg-[#ace600]/20 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Nueva conversación
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New chat dialog */}
      <NewChatDialog
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onStart={handleStartConversation}
      />
    </TooltipProvider>
  );
}

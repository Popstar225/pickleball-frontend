import { useState } from "react";
import { Send, Users, Building2, MapPin, Inbox, Clock, MessageSquare, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockMessages, type Message } from "@/data/dashboardMockData";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const inputCls =
  'w-full bg-white/[0.04] border border-white/[0.09] rounded-xl text-white/80 text-sm px-3.5 py-2.5 ' +
  'outline-none transition-all duration-150 ' +
  'focus:border-[#ace600]/50 focus:bg-[#ace600]/[0.03] focus:ring-0 ' +
  'disabled:opacity-35 disabled:cursor-not-allowed ' +
  'placeholder:text-white/20';

const labelCls = 'block text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1.5';

const selectTriggerCls =
  'h-10 rounded-xl bg-white/[0.04] border-white/[0.09] text-white/80 text-sm ' +
  'focus:ring-0 focus:border-[#ace600]/50 transition-all data-[placeholder]:text-white/20';

// ─── Recipient config ─────────────────────────────────────────────────────────
const RECIPIENT_OPTIONS = [
  { value: "all_players", label: "Todos los Jugadores", icon: Users,     color: "text-[#ace600]",   bg: "bg-[#ace600]/10 border-[#ace600]/20" },
  { value: "all_clubs",   label: "Todos los Clubes",   icon: Building2,  color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/20" },
  { value: "all_states",  label: "Todos los Estados",  icon: MapPin,     color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/20" },
];

function recipientCfg(type: string) {
  return RECIPIENT_OPTIONS.find(o => o.value === type) ?? RECIPIENT_OPTIONS[0];
}

// ─── Atoms ────────────────────────────────────────────────────────────────────
function RecipientPill({ type }: { type: string }) {
  const cfg = recipientCfg(type);
  const Icon = cfg.icon;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest whitespace-nowrap',
      cfg.color, cfg.bg,
    )}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const [messages,         setMessages]         = useState<Message[]>(mockMessages);
  const [recipient,        setRecipient]        = useState("");
  const [subject,          setSubject]          = useState("");
  const [body,             setBody]             = useState("");
  const [selectedMessage,  setSelectedMessage]  = useState<Message | null>(null);
  const [sending,          setSending]          = useState(false);

  const handleSend = async () => {
    if (!recipient || !subject.trim() || !body.trim()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 600));
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender_id: "admin-1",
      sender_name: "Federación FMPB",
      sender_type: "admin",
      recipient_type: recipient as Message["recipient_type"],
      subject: subject.trim(),
      body: body.trim(),
      sent_at: new Date().toISOString(),
      read: false,
    };
    setMessages([newMessage, ...messages]);
    setSubject(""); setBody(""); setRecipient("");
    setSending(false);
  };

  const canSend = !!recipient && !!subject.trim() && !!body.trim();

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <h1 className="text-[22px] font-black text-white tracking-tight">Sistema de Mensajes</h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse" />
            {messages.length} enviados
          </span>
        </div>
        <p className="text-xs text-white/25">Envía comunicados a jugadores, clubes y estados</p>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="compose">
        <TabsList className="flex h-auto gap-1 bg-[#0d1117] border border-white/[0.07] rounded-2xl p-1.5 w-fit">
          <TabsTrigger value="compose"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all text-white/30 hover:text-white/55 hover:bg-white/[0.04] data-[state=active]:bg-[#ace600] data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(172,230,0,0.18)]">
            <Send className="w-3 h-3" /> Redactar
          </TabsTrigger>
          <TabsTrigger value="sent"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all text-white/30 hover:text-white/55 hover:bg-white/[0.04] data-[state=active]:bg-[#ace600] data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(172,230,0,0.18)]">
            <Inbox className="w-3 h-3" /> Enviados
            {messages.length > 0 && (
              <span className="ml-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white/10 text-white/40 data-[state=active]:bg-black/20 data-[state=active]:text-black/60">
                {messages.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Compose ──────────────────────────────────────────────────────── */}
        <TabsContent value="compose" className="mt-4">
          <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden max-w-2xl">
            <div className="h-0.5 bg-gradient-to-r from-[#ace600]/40 via-[#ace600]/20 to-transparent" />

            {/* Card header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.05]">
              <div className="w-8 h-8 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-[#ace600]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Nuevo Mensaje</p>
                <p className="text-[11px] text-white/25 mt-0.5">Comunica a todos los miembros de la federación</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Recipient */}
              <div>
                <label className={labelCls}>Destinatarios <span className="text-[#ace600]">*</span></label>
                <Select value={recipient} onValueChange={setRecipient}>
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue placeholder="Seleccionar destinatarios…" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161c25] border-white/[0.08] rounded-xl shadow-2xl">
                    {RECIPIENT_OPTIONS.map(opt => {
                      const Icon = opt.icon;
                      return (
                        <SelectItem key={opt.value} value={opt.value}
                          className="text-white/70 focus:bg-white/[0.06] focus:text-white">
                          <span className="flex items-center gap-2">
                            <span className={cn('w-5 h-5 rounded-lg border flex items-center justify-center shrink-0', opt.bg)}>
                              <Icon className={cn('w-2.5 h-2.5', opt.color)} />
                            </span>
                            {opt.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {/* Recipient preview pill */}
                {recipient && (
                  <div className="mt-2">
                    <RecipientPill type={recipient} />
                  </div>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className={labelCls}>Asunto <span className="text-[#ace600]">*</span></label>
                <input
                  className={inputCls}
                  placeholder="Asunto del mensaje…"
                  value={subject}
                  onChange={e => setSubject(e.target.value)} />
              </div>

              {/* Body */}
              <div>
                <label className={labelCls}>Mensaje <span className="text-[#ace600]">*</span></label>
                <textarea
                  rows={6}
                  className={cn(inputCls, 'resize-y')}
                  placeholder="Escribe tu mensaje aquí…"
                  value={body}
                  onChange={e => setBody(e.target.value)} />
                {body.length > 0 && (
                  <p className="text-[10px] text-white/20 mt-1 text-right">{body.length} caracteres</p>
                )}
              </div>

              {/* Send button */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                <p className="text-[10px] text-white/20">
                  {canSend ? 'Listo para enviar' : 'Completa todos los campos'}
                </p>
                <button
                  onClick={handleSend}
                  disabled={!canSend || sending}
                  className="inline-flex items-center gap-1.5 h-9 px-5 rounded-xl text-xs font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.18)] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  {sending
                    ? <><span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />Enviando…</>
                    : <><Send className="w-3.5 h-3.5" />Enviar Mensaje</>
                  }
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Sent ────────────────────────────────────────────────────────── */}
        <TabsContent value="sent" className="mt-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <Inbox className="w-6 h-6 text-white/10" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white/25 mb-1">Sin mensajes enviados</p>
                <p className="text-xs text-white/15">Los mensajes que envíes aparecerán aquí</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-3">

              {/* ── Message list ──────────────────────────────────────────── */}
              <div className="lg:col-span-1 bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-[#ace600]/40 via-[#ace600]/20 to-transparent" />
                <div className="px-4 py-3.5 border-b border-white/[0.05]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                    {messages.length} mensaje{messages.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="divide-y divide-white/[0.04] max-h-[560px] overflow-y-auto">
                  {messages.map(msg => {
                    const cfg = recipientCfg(msg.recipient_type);
                    const Icon = cfg.icon;
                    const isSelected = selectedMessage?.id === msg.id;
                    return (
                      <button key={msg.id} type="button" onClick={() => setSelectedMessage(msg)}
                        className={cn(
                          'w-full text-left px-4 py-3.5 flex items-start gap-3 transition-all group',
                          isSelected ? 'bg-[#ace600]/[0.06]' : 'hover:bg-white/[0.02]',
                        )}>
                        {/* Icon badge */}
                        <div className={cn(
                          'w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5',
                          isSelected ? cn(cfg.bg, 'opacity-100') : cn(cfg.bg, 'opacity-60 group-hover:opacity-100'),
                        )}>
                          <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-xs font-bold truncate transition-colors',
                            isSelected ? 'text-white' : 'text-white/55 group-hover:text-white/80',
                          )}>
                            {msg.subject}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={cn('text-[9px] font-black uppercase tracking-wider', cfg.color)}>
                              {cfg.label}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1.5 mt-0.5">
                          <span className="text-[10px] text-white/20 whitespace-nowrap">
                            {format(new Date(msg.sent_at), 'dd MMM', { locale: es })}
                          </span>
                          {isSelected && <ChevronRight className="w-3 h-3 text-[#ace600]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Message detail ────────────────────────────────────────── */}
              <div className="lg:col-span-2">
                {selectedMessage ? (
                  <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden h-full">
                    {(() => {
                      const cfg = recipientCfg(selectedMessage.recipient_type);
                      const Icon = cfg.icon;
                      return (
                        <>
                          <div className="h-0.5 bg-gradient-to-r from-[#ace600]/40 via-[#ace600]/20 to-transparent" />
                          <div className="px-6 py-4 border-b border-white/[0.05] flex items-start gap-3">
                            <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center shrink-0', cfg.bg)}>
                              <Icon className={cn('w-4 h-4', cfg.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h2 className="text-sm font-bold text-white leading-tight">{selectedMessage.subject}</h2>
                              <div className="flex items-center flex-wrap gap-2 mt-2">
                                <RecipientPill type={selectedMessage.recipient_type} />
                                <span className="flex items-center gap-1 text-[10px] text-white/25">
                                  <Clock className="w-2.5 h-2.5" />
                                  {format(new Date(selectedMessage.sent_at), "dd MMMM yyyy, HH:mm", { locale: es })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="px-6 py-5">
                            <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
                              {selectedMessage.body}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl flex flex-col items-center justify-center py-24 gap-4 h-full">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                      <Inbox className="w-6 h-6 text-white/10" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white/25 mb-1">Selecciona un mensaje</p>
                      <p className="text-xs text-white/15">Haz clic en un mensaje para ver su contenido</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
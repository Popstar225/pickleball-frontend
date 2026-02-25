import { useState } from "react";
import { Send, Users, Building2, MapPin, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockMessages, type Message } from "@/data/dashboardMockData";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const recipientOptions = [
  { value: "all_players", label: "Todos los Jugadores", icon: Users },
  { value: "all_clubs", label: "Todos los Clubes", icon: Building2 },
  { value: "all_states", label: "Todos los Estados", icon: MapPin },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const handleSend = () => {
    if (!recipient || !subject.trim() || !body.trim()) return;

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
    setSubject("");
    setBody("");
    setRecipient("");
  };

  const recipientLabel = (type: string) => {
    const opt = recipientOptions.find((o) => o.value === type);
    return opt?.label || type;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          Sistema de Mensajes
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Envía comunicados a jugadores, clubes y estados
        </p>
      </div>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="compose" className="gap-2">
            <Send className="h-4 w-4" /> Redactar
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Inbox className="h-4 w-4" /> Enviados ({messages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nuevo Mensaje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Destinatarios</label>
                <Select value={recipient} onValueChange={setRecipient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar destinatarios..." />
                  </SelectTrigger>
                  <SelectContent>
                    {recipientOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          <opt.icon className="h-4 w-4" />
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Asunto</label>
                <Input
                  placeholder="Asunto del mensaje..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mensaje</label>
                <Textarea
                  placeholder="Escribe tu mensaje aquí..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                />
              </div>

              <Button
                onClick={handleSend}
                disabled={!recipient || !subject.trim() || !body.trim()}
                className="gap-2"
              >
                <Send className="h-4 w-4" /> Enviar Mensaje
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Message list */}
            <div className="lg:col-span-1 space-y-2">
              {messages.map((msg) => (
                <Card
                  key={msg.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedMessage?.id === msg.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedMessage(msg)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{msg.subject}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {recipientLabel(msg.recipient_type)}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(msg.sent_at), "dd MMM", { locale: es })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Message detail */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {recipientLabel(selectedMessage.recipient_type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(selectedMessage.sent_at), "dd MMMM yyyy, HH:mm", { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.body}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <Inbox className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Selecciona un mensaje para ver su contenido</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

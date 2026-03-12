import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  Send,
  Plus,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PartnerMessagesPage() {
  const { toast } = useToast();
  const [isComposing, setIsComposing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    message: '',
  });

  // Mock messages data - in real app this would come from Redux/API
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'Federación Mexicana de Pickleball',
      fromEmail: 'admin@federacion.com',
      subject: 'Actualización de Patrocinio - Torneo Nacional 2024',
      message:
        'Estimado partner,\n\nNos complace informarle que su patrocinio para el Torneo Nacional 2024 ha sido aprobado. Los detalles del acuerdo se adjuntan en este mensaje.\n\nAtentamente,\nEquipo de la Federación',
      timestamp: '2024-01-15T10:30:00',
      isRead: false,
      type: 'official',
      attachments: ['contrato_patrocinio_2024.pdf'],
    },
    {
      id: 2,
      from: 'Comité Organizador',
      fromEmail: 'eventos@federacion.com',
      subject: 'Invitación: Reunión de Patrocinadores',
      message:
        'Hola,\n\nLe invitamos a la reunión mensual de patrocinadores que se llevará a cabo el próximo 20 de enero. La agenda incluye actualización de eventos y oportunidades de colaboración.\n\nSaludos,\nComité Organizador',
      timestamp: '2024-01-10T14:20:00',
      isRead: true,
      type: 'event',
      attachments: [],
    },
    {
      id: 3,
      from: 'Sistema Automático',
      fromEmail: 'noreply@federacion.com',
      subject: 'Recordatorio: Renovación de Partnership',
      message:
        'Su partnership con la Federación Mexicana de Pickleball vence en 45 días. Para continuar disfrutando de los beneficios, por favor renueve su membresía.\n\nPara renovar, visite su panel de pagos.',
      timestamp: '2024-01-08T09:00:00',
      isRead: true,
      type: 'system',
      attachments: [],
    },
  ]);

  const handleSendMessage = () => {
    if (!newMessage.recipient || !newMessage.subject || !newMessage.message) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos.',
        variant: 'destructive',
      });
      return;
    }

    // In real app, this would send the message via API
    toast({
      title: 'Mensaje enviado',
      description: 'Tu mensaje ha sido enviado exitosamente.',
    });

    setNewMessage({
      recipient: '',
      subject: '',
      message: '',
    });
    setIsComposing(false);
  };

  const handleMarkAsRead = (messageId: number) => {
    setMessages(messages.map((msg) => (msg.id === messageId ? { ...msg, isRead: true } : msg)));
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'official':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'system':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-slate-400" />;
    }
  };

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case 'official':
        return 'Oficial';
      case 'event':
        return 'Evento';
      case 'system':
        return 'Sistema';
      default:
        return 'General';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Mensajes</h1>
          <p className="text-slate-400 mt-1">Comunicación con la federación y organizadores</p>
        </div>
        <Dialog open={isComposing} onOpenChange={setIsComposing}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Mensaje
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Redactar Mensaje</DialogTitle>
              <DialogDescription className="text-slate-400">
                Envía un mensaje a la federación o comité organizador
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Destinatario</label>
                <select
                  value={newMessage.recipient}
                  onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar destinatario</option>
                  <option value="admin@federacion.com">Federación Mexicana de Pickleball</option>
                  <option value="eventos@federacion.com">Comité Organizador de Eventos</option>
                  <option value="soporte@federacion.com">Soporte Técnico</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Asunto</label>
                <Input
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Asunto del mensaje"
                />
              </div>
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Mensaje</label>
                <Textarea
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  rows={6}
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsComposing(false)}
                className="border-slate-700 text-white hover:bg-slate-800"
              >
                Cancelar
              </Button>
              <Button onClick={handleSendMessage} className="bg-primary hover:bg-primary/90">
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensaje
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages List */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Bandeja de Entrada</CardTitle>
              <CardDescription className="text-slate-400">
                {messages.filter((m) => !m.isRead).length} mensajes sin leer
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-1 p-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => {
                        setSelectedMessage(message);
                        handleMarkAsRead(message.id);
                      }}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedMessage?.id === message.id
                          ? 'bg-slate-800'
                          : 'bg-slate-800/50 hover:bg-slate-800'
                      } ${!message.isRead ? 'border-l-4 border-primary' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-slate-700 text-white">
                            {getMessageIcon(message.type)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-white truncate">
                              {message.from}
                            </p>
                            {!message.isRead && (
                              <div className="h-2 w-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-slate-400 truncate mb-1">{message.subject}</p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs border-slate-600 text-slate-300"
                            >
                              {getMessageTypeLabel(message.type)}
                            </Badge>
                            <p className="text-xs text-slate-500">
                              {new Date(message.timestamp).toLocaleDateString('es-MX')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              {selectedMessage ? (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-slate-700 text-white">
                        {getMessageIcon(selectedMessage.type)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {selectedMessage.subject}
                      </h3>
                      <p className="text-sm text-slate-400">
                        De: {selectedMessage.from} •{' '}
                        {new Date(selectedMessage.timestamp).toLocaleString('es-MX')}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {getMessageTypeLabel(selectedMessage.type)}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Selecciona un mensaje</h3>
                  <p className="text-slate-400">
                    Elige un mensaje de la lista para ver su contenido
                  </p>
                </div>
              )}
            </CardHeader>
            {selectedMessage && (
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <pre className="text-white whitespace-pre-wrap font-sans">
                      {selectedMessage.message}
                    </pre>
                  </div>

                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Adjuntos:</h4>
                      <div className="space-y-2">
                        {selectedMessage.attachments.map((attachment: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-slate-800/50 rounded"
                          >
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="text-white text-sm">{attachment}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary/80"
                            >
                              Descargar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-slate-700">
                    <Button
                      variant="outline"
                      onClick={() => setIsComposing(true)}
                      className="border-slate-700 text-white hover:bg-slate-800"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Responder
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-700 text-white hover:bg-slate-800"
                    >
                      Reenviar
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

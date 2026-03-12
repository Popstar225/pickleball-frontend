import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  Send,
  Search,
  Users,
  Building2,
  Clock,
  Check,
  CheckCheck,
  MoreVertical,
} from 'lucide-react';

export default function PlayerMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in real app this would come from Redux/API
  const conversations = [
    {
      id: 1,
      type: 'player', // player, club, federation
      name: 'María González',
      avatar: '/api/placeholder/40/40',
      lastMessage: '¿Estás disponible para entrenar este fin de semana?',
      lastMessageTime: '2024-03-20T14:30:00',
      unreadCount: 2,
      online: true,
      messages: [
        {
          id: 1,
          sender: 'María González',
          senderId: 2,
          content: 'Hola Juan, ¿cómo estás?',
          timestamp: '2024-03-20T10:00:00',
          read: true,
        },
        {
          id: 2,
          sender: 'Juan Pérez',
          senderId: 1,
          content: '¡Hola María! Bien, gracias. ¿Y tú?',
          timestamp: '2024-03-20T10:05:00',
          read: true,
        },
        {
          id: 3,
          sender: 'María González',
          senderId: 2,
          content: 'Muy bien también. ¿Estás disponible para entrenar este fin de semana?',
          timestamp: '2024-03-20T14:30:00',
          read: false,
        },
        {
          id: 4,
          sender: 'María González',
          senderId: 2,
          content: 'Hay un torneo próximo y quiero practicar un poco.',
          timestamp: '2024-03-20T14:31:00',
          read: false,
        },
      ],
    },
    {
      id: 2,
      type: 'club',
      name: 'Club Pickleball CDMX',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Recordatorio: Entrenamiento grupal mañana a las 10 AM',
      lastMessageTime: '2024-03-19T18:00:00',
      unreadCount: 0,
      online: false,
      messages: [
        {
          id: 1,
          sender: 'Club Pickleball CDMX',
          senderId: 100,
          content: '¡Bienvenido al club Juan! Estamos emocionados de tenerte con nosotros.',
          timestamp: '2024-03-15T09:00:00',
          read: true,
        },
        {
          id: 2,
          sender: 'Club Pickleball CDMX',
          senderId: 100,
          content: 'Recordatorio: Entrenamiento grupal mañana a las 10 AM en la cancha principal.',
          timestamp: '2024-03-19T18:00:00',
          read: true,
        },
      ],
    },
    {
      id: 3,
      type: 'admin',
      name: 'Federación Mexicana',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Tu credencial digital ha sido renovada exitosamente.',
      lastMessageTime: '2024-03-18T12:00:00',
      unreadCount: 0,
      online: false,
      messages: [
        {
          id: 1,
          sender: 'Federación Mexicana',
          senderId: 999,
          content: 'Tu credencial digital ha sido renovada exitosamente.',
          timestamp: '2024-03-18T12:00:00',
          read: true,
        },
        {
          id: 2,
          sender: 'Federación Mexicana',
          senderId: 999,
          content: 'Recuerda que vence el 31 de diciembre de 2024.',
          timestamp: '2024-03-18T12:01:00',
          read: true,
        },
      ],
    },
    {
      id: 4,
      type: 'player',
      name: 'Carlos Rodríguez',
      avatar: '/api/placeholder/40/40',
      lastMessage: '¡Felicidades por tu victoria en el torneo!',
      lastMessageTime: '2024-03-17T16:45:00',
      unreadCount: 0,
      online: false,
      messages: [
        {
          id: 1,
          sender: 'Carlos Rodríguez',
          senderId: 4,
          content: '¡Felicidades por tu victoria en el torneo!',
          timestamp: '2024-03-17T16:45:00',
          read: true,
        },
        {
          id: 2,
          sender: 'Juan Pérez',
          senderId: 1,
          content: '¡Gracias Carlos! Fue un partido muy reñido.',
          timestamp: '2024-03-17T17:00:00',
          read: true,
        },
      ],
    },
  ];

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // Here you would call the API to send the message
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    }
  };

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'player':
        return <Users className="h-4 w-4" />;
      case 'club':
        return <Building2 className="h-4 w-4" />;
      case 'admin':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Conversations List */}
      <Card className="w-80 bg-slate-900 border-slate-800 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensajes
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="space-y-1 p-4">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === conversation.id
                      ? 'bg-slate-800 border border-slate-700'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.avatar} alt={conversation.name} />
                        <AvatarFallback className="bg-primary text-slate-900 text-sm">
                          {conversation.name
                            .split(' ')
                            .map((word) => word[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.online && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-slate-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-white truncate">{conversation.name}</h4>
                        <div className="flex items-center gap-2">
                          {getConversationIcon(conversation.type)}
                          <span className="text-xs text-slate-400">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 truncate mb-1">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-primary text-slate-900 text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 bg-slate-900 border-slate-800 flex flex-col">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConv.avatar} alt={selectedConv.name} />
                  <AvatarFallback className="bg-primary text-slate-900">
                    {selectedConv.name
                      .split(' ')
                      .map((word) => word[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{selectedConv.name}</h3>
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    {getConversationIcon(selectedConv.type)}
                    {selectedConv.type === 'player' && selectedConv.online && (
                      <span className="flex items-center gap-1">
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        En línea
                      </span>
                    )}
                    {selectedConv.type === 'club' && 'Club'}
                    {selectedConv.type === 'admin' && 'Federación'}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <Separator className="bg-slate-800" />

            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {selectedConv.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === 1 ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === 1
                            ? 'bg-primary text-slate-900'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                            message.senderId === 1 ? 'text-slate-700' : 'text-slate-400'
                          }`}
                        >
                          <span>{formatTime(message.timestamp)}</span>
                          {message.senderId === 1 &&
                            (message.read ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>

            <Separator className="bg-slate-800" />

            {/* Message Input */}
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[60px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-primary hover:bg-primary/90 self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Selecciona una conversación</h3>
              <p className="text-slate-400">
                Elige una conversación de la lista para ver los mensajes
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

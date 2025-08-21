import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  consultationId: string;
  senderId: string;
  content: string;
  messageType: 'user' | 'ai';
  createdAt: Date;
  senderName: string;
  senderRole: string;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  sendMessage: (content: string) => void;
  joinConsultation: (consultationId: string) => void;
}

export function useSocket(consultationId?: string, userId?: string | null, userName?: string | null, userRole?: string): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
    
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('error', (error: string) => {
      console.error('Socket error:', error);
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinConsultation = (consultationId: string) => {
    if (socket && isConnected) {
      socket.emit('join-consultation', consultationId);
    }
  };

  const sendMessage = (content: string) => {
    if (socket && isConnected && consultationId && userId && userName && userRole) {
      socket.emit('send-message', {
        consultationId,
        content,
        senderId: userId,
        senderName: userName,
        senderRole: userRole,
      });
    }
  };

  return {
    socket,
    isConnected,
    messages,
    sendMessage,
    joinConsultation,
  };
}

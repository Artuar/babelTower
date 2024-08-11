import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PUBLIC_URL } from '../constants/constants';
import { WebSocketMessage } from '../types/receivedMessages';
import { UserMessage } from '../types/sentMessages';

export interface UseWebSocketReturn {
  sendMessage: (message: UserMessage) => void;
  isInitialized: boolean;
  isConnected: boolean;
  error: string | null;
  subscribe: (
    messageType: string,
    callback: (data: WebSocketMessage['payload']) => void,
  ) => void;
  unsubscribe: (
    messageType: string,
    callback: (data: WebSocketMessage['payload']) => void,
  ) => void;
  disconnect: () => void;
  connect: () => void;
  setServerUrl: (url: string) => void;
  serverUrl: string;
  sessionHash: string;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionHash, setSessionHash] = useState('');
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const subscribers = useRef<
    Record<string, ((data: WebSocketMessage['payload']) => void)[]>
  >({});
  const [serverUrl, setServerUrl] = useState<string>(PUBLIC_URL);

  const connect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const formattedUrl = serverUrl.replace('http', 'ws');
    socketRef.current = new WebSocket(
      `${formattedUrl}/socket.io/?transport=websocket`,
    );

    socketRef.current.onopen = () => {
      setIsConnected(true);
    };

    socketRef.current.onmessage = (event) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      const { type, payload } = data;

      if (type === 'initialized') {
        setSessionHash(payload.session_id);
      } else if (type === 'error') {
        setError(payload.error);
      }

      if (subscribers.current[type]) {
        subscribers.current[type].forEach((callback) => callback(payload));
      }
    };

    socketRef.current.onclose = () => {
      setIsConnected(false);
    };
  }, [serverUrl]);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
    };
  }, [connect]);

  const sendMessage = (message: UserMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  const subscribe = (
    messageType: string,
    callback: (data: WebSocketMessage['payload']) => void,
  ) => {
    if (!subscribers.current[messageType]) {
      subscribers.current[messageType] = [];
    }
    subscribers.current[messageType].push(callback);
  };

  const unsubscribe = (
    messageType: string,
    callback: (data: WebSocketMessage['payload']) => void,
  ) => {
    if (subscribers.current[messageType]) {
      subscribers.current[messageType] = subscribers.current[
        messageType
      ].filter((cb) => cb !== callback);
    }
  };

  const disconnect = () => {
    socketRef.current?.close();
    setSessionHash('');
    setError(null);
  };

  const isInitialized = useMemo(() => sessionHash !== '', [sessionHash]);

  return {
    sendMessage,
    isInitialized,
    isConnected,
    error,
    subscribe,
    disconnect,
    connect,
    unsubscribe,
    setServerUrl,
    serverUrl,
    sessionHash,
  };
};

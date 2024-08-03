import { useState, useEffect, useRef, useCallback } from 'react';
import { PUBLIC_URL } from "../constants/constants";

interface WebSocketMessage {
  type: string;
  payload: any;
}

interface UseWebSocketReturn {
  sendMessage: (message: WebSocketMessage) => void;
  isInitialized: boolean;
  isConnected: boolean;
  error: string | null;
  subscribe: (messageType: string, callback: (data: any) => void) => void;
  unsubscribe: (messageType: string, callback: (data: any) => void) => void;
  disconnect: () => void;
  connect: () => void;
  setUrl: (url: string) => void;
  url: string;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const subscribers = useRef<Record<string, ((data: any) => void)[]>>({});
  const [url, setUrl] = useState<string>(PUBLIC_URL);

  const connect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const formattedUrl = url.replace('http', 'ws');
    socketRef.current = new WebSocket(`${formattedUrl}/socket.io/?transport=websocket`);

    socketRef.current.onopen = () => {
      setIsConnected(true);
    };

    socketRef.current.onmessage = (event) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      const { type, payload } = data;

      if (type === 'initialized') {
        setIsInitialized(true);
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
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
    };
  }, [connect]);

  const sendMessage = (message: WebSocketMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  const subscribe = (messageType: string, callback: (data: any) => void) => {
    if (!subscribers.current[messageType]) {
      subscribers.current[messageType] = [];
    }
    subscribers.current[messageType].push(callback);
  };

  const unsubscribe = (messageType: string, callback: (data: any) => void) => {
    if (subscribers.current[messageType]) {
      subscribers.current[messageType] = subscribers.current[messageType].filter(
        (cb) => cb !== callback
      );
    }
  };

  const disconnect = () => {
    socketRef.current?.close();
    setIsInitialized(false);
    setError(null)
  };

  return {
    sendMessage,
    isInitialized,
    isConnected,
    error,
    subscribe,
    disconnect,
    connect,
    unsubscribe,
    setUrl,
    url,
  };
};

import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocket, UseWebSocketReturn } from '../hooks/useWebSocket';

interface WebSocketProviderProps {
  children: ReactNode;
}

const WebSocketContext = createContext<UseWebSocketReturn | undefined>(undefined);

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const webSocket = useWebSocket();

  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): UseWebSocketReturn => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

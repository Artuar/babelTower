import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import { MicrophoneManager } from '../helpers/MicrophoneManager';

interface MicrophoneContextProps {
  initializeRecorder: (callback: (audio: string) => void) => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  destroyRecorder: () => void;
  isRecording: boolean;
}

const MicrophoneContext = createContext<MicrophoneContextProps | undefined>(
  undefined,
);

export const MicrophoneProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const micManagerRef = useRef<MicrophoneManager | null>(null);

  const startRecording = async () => {
    if (!micManagerRef.current) {
      throw Error('MicrophoneManager is not initialized!');
    }
    await micManagerRef.current.startRecording();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (!micManagerRef.current) {
      throw Error('MicrophoneManager is not initialized!');
    }
    micManagerRef.current?.stopRecording();
    setIsRecording(false);
  };

  const initializeRecorder = (callback: (audio: string) => void) => {
    micManagerRef.current = new MicrophoneManager(callback);
  };

  const destroyRecorder = () => {
    micManagerRef.current?.destroy();
  };

  useEffect(() => {
    return () => {
      destroyRecorder();
    };
  }, []);

  return (
    <MicrophoneContext.Provider
      value={{
        startRecording,
        stopRecording,
        isRecording,
        initializeRecorder,
        destroyRecorder,
      }}
    >
      {children}
    </MicrophoneContext.Provider>
  );
};

export const useMicrophone = (): MicrophoneContextProps => {
  const context = useContext(MicrophoneContext);
  if (context === undefined) {
    throw new Error('useMicrophone must be used within a MicrophoneProvider');
  }
  return context;
};

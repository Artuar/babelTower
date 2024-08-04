import React, { createContext, useState, useContext, ReactNode } from 'react';
import { TranslationModel } from '../types/types';
import { PUBLIC_URL } from '../constants/constants';

interface ModelInitializationContextProps {
  languageTo: string;
  setLanguageTo: (language: string) => void;
  languageFrom: string;
  setLanguageFrom: (language: string) => void;
  modelName: TranslationModel;
  setModelName: (model: TranslationModel) => void;
  serverUrl: string;
  setServerUrl: (url: string) => void;
}

const ModelInitializationContext = createContext<
  ModelInitializationContextProps | undefined
>(undefined);

export const ModelInitializationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [languageTo, setLanguageTo] = useState('ua');
  const [languageFrom, setLanguageFrom] = useState('en');
  const [modelName, setModelName] = useState<TranslationModel>('small');
  const [serverUrl, setServerUrl] = useState<string>(PUBLIC_URL);

  return (
    <ModelInitializationContext.Provider
      value={{
        languageTo,
        setLanguageTo,
        languageFrom,
        setLanguageFrom,
        modelName,
        setModelName,
        serverUrl,
        setServerUrl,
      }}
    >
      {children}
    </ModelInitializationContext.Provider>
  );
};

export const useModelInitialization = (): ModelInitializationContextProps => {
  const context = useContext(ModelInitializationContext);
  if (context === undefined) {
    throw new Error(
      'useModelInitialization must be used within a ModelInitializationProvider',
    );
  }
  return context;
};

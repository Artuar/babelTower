import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import { theme } from '../styles/theme';
import { WebSocketProvider } from '../context/WebSocketContext';
import Layout from './layout';
import { ModelInitializationProvider } from '../context/ModelInitializationContext';
import { MicrophoneProvider } from '../context/MicrophoneContext';

export type NextPageWithLayout<P = unknown, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);
  const getProviders = (page) => [
    WebSocketProvider,
    ModelInitializationProvider,
    MicrophoneProvider,
  ].reduce((Content, Provider) => <Provider>{Content}</Provider>, page)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {getProviders(getLayout(<Component {...pageProps} />))}
    </ThemeProvider>
  );
}

export default MyApp;

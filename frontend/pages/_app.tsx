import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#286761',
    },
    secondary: {
      main: '#d76e77'
    }
  },
});

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {getLayout(<Component {...pageProps} />)}
    </ThemeProvider>
  );
}

export default MyApp

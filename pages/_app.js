

import '../styles/globals.scss'

import '../styles/price.scss'
import '../styles/graph.scss'
import '../styles/list.scss'
import '../styles/map.scss'
import '../styles/order_card.scss'
import '../styles/auth.scss'
import '../styles/settings.scss'

//pm2 delete test-app-new && rm -rf test-app-new && git clone https://github.com/vito3315/test-app-new.git && cd test-app-new
//npm install && npm run build && pm2 start npm --name "test-app-new" -- start

import { createTheme, ThemeProvider } from '@mui/material/styles';

import { SessionProvider } from "next-auth/react";

import * as Sentry from "@sentry/react";

const theme = createTheme({
  palette: {
    primary: {
      main: '#CC0033',
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
})

export function reportWebVitals(metric) {
  console.log(metric)
}

function MyApp({ Component, pageProps: { session, ...pageProps } }) {

  if( typeof window !== "undefined" ){
    console.log( 'load' )

    Sentry.init({
      dsn: "https://0446c6db46dce5a0368f09bc573ad37d@o4505941569830912.ingest.sentry.io/4505946950008832",
      integrations: [
        
      ],
      
      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
      // Session Replay
      replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
      replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    });
  }
  

  return (
    <ThemeProvider theme={theme}>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </ThemeProvider>
  )
}

export default MyApp

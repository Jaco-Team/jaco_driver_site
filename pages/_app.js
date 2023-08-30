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

import { roboto } from '@/ui/Font.js'

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

  return (
    <ThemeProvider theme={theme}>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </ThemeProvider>
  )
}

export default MyApp

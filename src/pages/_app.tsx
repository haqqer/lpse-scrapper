import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { type AppType } from 'next/app'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider, createTheme } from '@mui/material/styles'

import '~/styles/globals.css'

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  })
  return (
    <ThemeProvider theme={darkTheme}>
      <SessionProvider session={session}>
        <Toaster
          position="top-center"
          gutter={75}
          containerStyle={{
            top: 75,
            left: 75,
            bottom: 75,
            right: 75,
          }}
        />
        <Component {...pageProps} />
      </SessionProvider>
    </ThemeProvider>
  )
}

export default MyApp

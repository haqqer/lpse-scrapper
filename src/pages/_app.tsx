import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { type AppType } from 'next/app'
import { Toaster } from 'react-hot-toast'

import '~/styles/globals.css'

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
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
  )
}

export default MyApp

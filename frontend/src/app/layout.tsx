import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'
import AuthRouteGuard from '../components/AuthRouteGuard'

export const metadata: Metadata = {
  title: 'Daily Bulletin by Pulse of Profit',
  description: 'Daily market updates, stock analysis, and financial newsletter.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-dark text-text-dark min-h-screen">
        <AuthProvider>
          <AuthRouteGuard>{children}</AuthRouteGuard>
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  )
}

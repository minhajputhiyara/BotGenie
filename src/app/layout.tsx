'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import HeaderClient from '@/components/HeaderClient';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] })

// Note: Metadata export is usually for Server Components, might need adjustment if converting entirely to client
// export const metadata: Metadata = {
//   title: 'AI Chatbot Maker - Create Custom Support Chatbots',
//   description: 'Build intelligent customer support chatbots with RAG technology, sentiment analysis, and Google Sheets integration.',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname(); // Get current path
  const isHomePage = pathname === '/';

  return (
    <html lang="en" suppressHydrationWarning>
      {/* Conditionally set body class based on pathname */}
      <body className={`${inter.className} ${isHomePage ? 'bg-purple-950' : 'bg-background'} text-foreground`}>
        <AuthProvider>
          <HeaderClient />
          {/* Removed container class from main to allow full-width sections if needed */}
          <main>
            {children}
          </main>
          {/* Add Footer or other layout elements if needed */}
        </AuthProvider>
      </body>
    </html>
  )
}

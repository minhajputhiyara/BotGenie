import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import HeaderClient from '@/components/HeaderClient';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Chatbot Maker - Create Custom Support Chatbots',
  description: 'Build intelligent customer support chatbots with RAG technology, sentiment analysis, and Google Sheets integration.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <AuthProvider>
          <HeaderClient />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          {/* Add Footer or other layout elements if needed */}
        </AuthProvider>
      </body>
    </html>
  )
}

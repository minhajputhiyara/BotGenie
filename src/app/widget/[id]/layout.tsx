import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Chatbot Widget',
  description: 'Embedded chatbot widget',
};

// This special route segment ensures this layout is completely isolated
// from the main application layout
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          {`
            /* Reset styles to ensure clean widget */
            body, html {
              margin: 0 !important;
              padding: 0 !important;
              height: 100% !important;
              width: 100% !important;
              overflow: hidden !important;
              background: transparent !important;
            }
            /* Aggressively hide common layout elements */
            header, footer, nav, main {
                display: none !important;
            }
          `}
        </style>
      </head>
      <body className={`${inter.className} widget-only`}>{children}</body>
    </html>
  );
}

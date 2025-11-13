import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sonomos AI - Cloak Your Data Before AI Sees It',
  description: 'Automatically detect and hide sensitive information before sending to ChatGPT, Gemini, or any AI system. Privacy protection for AI users.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
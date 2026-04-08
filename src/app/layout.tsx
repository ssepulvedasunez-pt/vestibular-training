import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vestibular Trainer',
  description: 'MVP training app for vestibular bedside reasoning'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

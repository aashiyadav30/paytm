import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paytm ResolveX | Autonomous AI Teammate',
  description: 'Multi-stakeholder FinTech resolution AI teammate that investigates, acts, verifies, and collaborates.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

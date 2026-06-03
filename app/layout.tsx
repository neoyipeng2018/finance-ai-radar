import type { Metadata } from 'next';
import { AnalyticsTracker } from '../components/AnalyticsTracker';
import './globals.css';

export const metadata: Metadata = {
  title: 'Finance AI Radar',
  description: 'The signal layer for applied AI in finance: papers, GitHub repos, expert discussions, datasets, jobs, and adoption signals.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}

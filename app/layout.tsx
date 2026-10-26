import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Autonomous Business Intelligence Platform',
  description:
    'Enterprise AI platform for autonomous retail business intelligence, KPI dashboards, sales forecasting, anomaly detection, natural-language analytics queries, and automated reports.',
  openGraph: {
    title: 'Autonomous Business Intelligence Platform',
    description:
      'Enterprise AI platform for autonomous retail business intelligence, KPI dashboards, sales forecasting, anomaly detection, natural-language analytics queries, and automated reports.',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}

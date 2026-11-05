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
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var t = localStorage.getItem('abip_theme');
                if (t === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                } else if (t === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                }
              } catch(e){}
            })()`,
          }}
        />
      </head>
      <body className="antialiased font-sans bg-slate-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-slate-100 transition-colors">
        {children}
      </body>
    </html>
  );
}

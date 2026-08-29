import type { Metadata } from 'next';
import './globals.css';
import { ReclaimProvider } from '@/context/ReclaimContext';
import { AuthProvider } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Reclaim — AI Revenue Recovery Agent',
  description: 'AI that detects revenue at risk, decides the optimal recovery action, and executes bounded recovery workflows within guardrails.',
  icons: {
    icon: '/reclaim-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Block third-party browser extension errors and unhandled rejections from crashing Next.js dev overlay
              (function() {
                if (typeof window === 'undefined') return;
                
                function isExtensionError(event) {
                  var filename = (event && event.filename) || '';
                  var message = (event && event.message) || (event && event.reason && (event.reason.message || event.reason.stack)) || '';
                  return (
                    filename.indexOf('chrome-extension://') !== -1 ||
                    filename.indexOf('moz-extension://') !== -1 ||
                    filename.indexOf('safari-extension://') !== -1 ||
                    filename.indexOf('executors/200.js') !== -1 ||
                    (typeof message === 'string' && (
                      message.indexOf('chrome-extension://') !== -1 ||
                      message.indexOf("reading 'M_ID'") !== -1 ||
                      message.indexOf('bis_skin_checked') !== -1
                    ))
                  );
                }

                window.addEventListener('error', function(event) {
                  if (isExtensionError(event)) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    return true;
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(event) {
                  if (isExtensionError(event)) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          <ReclaimProvider>
            <AppShell>{children}</AppShell>
          </ReclaimProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DEFY TPO CLOUD - MISMO Loan Submission",
  description: "Seamlessly submit MISMO FNM 3.4 loan files to MeridianLink",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var s = localStorage.getItem('defysubmit-theme');
            var d = s ? s === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.dataset.theme = d ? 'dark' : 'light';
          } catch(e) { document.documentElement.dataset.theme = 'dark'; }
        `}} />
        {children}
      </body>
    </html>
  );
}

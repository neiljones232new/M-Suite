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
  title: "M-Suite Portal",
  description: "Unified launcher for Practice + Customs apps.",
  icons: {
    icon: "/M_Logo_Silver.png",
  },
  openGraph: {
    title: "M-Suite Portal",
    description: "Unified launcher for Practice + Customs apps.",
    images: ["/M_Logo_Silver.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{
          height: "100vh",
          overflow: "hidden", // ✅ no scrolling
          background: "var(--bg)",
          color: "var(--text)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Main Content */}
        <div style={{ flex: 1, display: "flex" }}>
          {children}
        </div>

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            padding: "12px 0",
            fontSize: 11,
            opacity: 0.5,
            letterSpacing: "0.04em",
          }}
        >
          M-Suite Platform • Development Environment
        </footer>
      </body>
    </html>
  );
}

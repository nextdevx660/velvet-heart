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

export const metadata = {
  title: "Velvet Heart AI Companion | AI Waifu Chat App",
  description:
    "Velvet Heart AI Companion is an advanced AI waifu chat app where you can talk, bond, and interact with intelligent virtual companions. Experience realistic conversations, emotional connections, and personalized AI relationships.",

  keywords: [
    "AI waifu",
    "AI girlfriend",
    "AI companion",
    "virtual girlfriend app",
    "AI chat app",
    "anime AI companion",
    "romantic AI chatbot",
    "Velvet Heart AI",
    "AI relationship app",
    "chat with AI waifu"
  ],

  authors: [{ name: "Velvet Heart AI Team" }],

  creator: "Velvet Heart AI",
  publisher: "Velvet Heart AI",

  openGraph: {
    title: "Velvet Heart AI Companion",
    description:
      "Chat with your own AI waifu. Build emotional connections and experience next-level AI companionship.",
    url: "https://yourdomain.com",
    siteName: "Velvet Heart AI Companion",
    images: [
      {
        url: "/comatozze.jpg",
        width: 1200,
        height: 630,
        alt: "Velvet Heart AI Companion",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Velvet Heart AI Companion",
    description:
      "Your personal AI waifu is waiting. Chat, connect, and experience AI companionship like never before.",
    images: ["/comatozze.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },

  metadataBase: new URL("https://yourdomain.com"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

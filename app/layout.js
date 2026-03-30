import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "CashFlow – Income & Expense Manager",
  description: "A modern dashboard to track your income, expenses, and net balance in one place.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CashFlow",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

// 🚀 මෙන්න මේක තමයි අලුතින් හැදුවේ! (Auto Zoom නවත්තන මැජික් එක)
export const viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-[#0b0f1a]">{children}</body>
    </html>
  );
}
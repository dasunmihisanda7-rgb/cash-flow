import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// 🚀 මෙන්න මෙතනට තමයි Home Screen Icons සහ PWA settings දැම්මේ
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

export const viewport = {
  themeColor: "#0f172a", // Dark Theme color එක
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-[#0b0f1a]">{children}</body>
    </html>
  );
}
import { Inter } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";

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
    statusBarStyle: "default",
    title: "CashFlow",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

// 🚀 iOS PWA Fixes: viewportFit: "cover" දැම්මා, themeColor එකත් update කළා
export const viewport = {
  themeColor: "#080b12", // Agent කිව්ව විදිහටම Background එකට match කළා
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // 🔴 CRITICAL FIX: මේකෙන් තමයි Notch/Home Bar එක ගාණට අඳුරගන්නේ
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-[#080b12]">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
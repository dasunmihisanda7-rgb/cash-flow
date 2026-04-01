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
    title: "CashFlow V7 Elite Plus",
  },
  icons: {
    icon: "/icon.png?v=1",
    shortcut: "/icon.png?v=1",
    apple: "/apple-icon.png?v=1",
  },
};

export const viewport = {
  themeColor: "#080b12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <link rel="apple-touch-icon" href="/apple-icon.png?v=1" />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-[#080b12]">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
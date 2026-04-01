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
    // OPT-13: "black-translucent" lets the app render behind the status bar
    // so our env(safe-area-inset-top) padding correctly clears the notch
    // on both iPhone 12 and 14 Plus. "default" would push content down and
    // leave a white bar, while "black" is opaque black — neither is ideal.
    statusBarStyle: "black-translucent",
    title: "CashFlow V7 Elite Plus",
  },
  icons: {
    icon: "/icon.png?v=1",
    shortcut: "/icon.png?v=1",
    apple: "/apple-icon.png?v=1",
  },
};

export const viewport = {
  themeColor: "#05080f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // OPT-14: viewportFit:"cover" is the critical flag that tells iOS Safari
  // the app wants to render into the safe area rectangle, which activates
  // env(safe-area-inset-*) values in CSS. Without this, all safe-area
  // env() calls resolve to 0px.
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <link rel="apple-touch-icon" href="/apple-icon.png?v=1" />
      </head>
      {/*
        OPT-15: `overflow-hidden` on body prevents a double-scrollbar and
        elastic-bounce at the root level. All actual scrolling is isolated
        inside <main> which has `overscroll-behavior-y: contain`.
      */}
      <body className="min-h-full flex flex-col antialiased bg-[#05080f] overflow-hidden">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
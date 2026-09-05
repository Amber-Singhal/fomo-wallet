import "@coinbase/onchainkit/styles.css";
import { Montserrat } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "./favicon.ico";

import OnchainProviders from "@/onchainkit/provider";
import { Toaster } from "@/components/ui/sonner";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Fomo Wallet - Bet on the Future of CryptoCurrency",
  description: "Let the bet begin!",
  icons: {
    icon: "./favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <OnchainProviders>
          {children}
          <Toaster />
        </OnchainProviders>
      </body>
    </html>
  );
}

"use client";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { useMemo } from "react";
import { http, createConfig } from "wagmi";
import { botChain } from "@/utils/contracts";
import { NEXT_PUBLIC_WC_PROJECT_ID } from "./config";

export function useWagmiConfig() {
  const projectId = NEXT_PUBLIC_WC_PROJECT_ID ?? "";
  if (!projectId) {
    const providerErrMessage =
      "To connect to all Wallets you need to provide a NEXT_PUBLIC_WC_PROJECT_ID env variable";
    throw new Error(providerErrMessage);
  }

  return useMemo(() => {
    const connectors = connectorsForWallets(
      [
        {
          groupName: "Recommended Wallet",
          wallets: [coinbaseWallet],
        },
        {
          groupName: "Other Wallets",
          wallets: [rainbowWallet, metaMaskWallet],
        },
      ],
      {
        appName: "Fomo Wallet",
        projectId,
      }
    );

    const wagmiConfig = createConfig({
      chains: [botChain],
      multiInjectedProviderDiscovery: false,
      connectors,
      ssr: true,
      transports: {
        [botChain.id]: http(),
      },
    });

    return wagmiConfig;
  }, [projectId]);
}

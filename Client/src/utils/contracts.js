import { defineChain } from "viem";
import FomoWalletGameABI from "./FomoWalletGameABI.json";

export const botChain = defineChain({
  id: 677,
  name: "BOT Chain",
  network: "bot-chain",
  nativeCurrency: {
    decimals: 18,
    name: "BOT",
    symbol: "BOT",
  },
  rpcUrls: {
    default: { http: ["https://rpc.botchain.ai/"] },
    public: { http: ["https://rpc.botchain.ai/"] },
  },
  blockExplorers: {
    default: { name: "BOTScan", url: "https://scan.botchain.ai" },
  },
});

export const FOMO_WALLET_GAME_ADDRESS =
  process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

export { FomoWalletGameABI };

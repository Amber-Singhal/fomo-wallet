import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PlayGame from "./playgame";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import CreateBetSheet from "./createbet";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const commonButtonStyles =
    "border-2 border-black bg-white text-black hover:bg-gray-100";

  return (
    <nav className="px-4 py-3 sm:py-6 relative z-50">
      <div className=" mx-auto">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" className="h-8 w-auto sm:h-12" alt="Logo" />
            <p className="text-xl sm:text-3xl font-heading tracking-tight">
              Fomo Wallet
            </p>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/leaderboard">
              <p className="font-semibold hover:underline">Leaderboard</p>
            </Link>
            <CreateBetSheet />
            {isConnected ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm bg-white border-2 border-black px-3 py-1 rounded-md">
                  {formatAddress(address)}
                </span>
                <Button
                  onClick={() => disconnect()}
                  className="border-2 border-black bg-white text-black hover:bg-gray-100 font-semibold"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button
                    onClick={openConnectModal}
                    className="border-black bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors duration-200"
                  >
                    Connect Wallet
                  </Button>
                )}
              </ConnectButton.Custom>
            )}
          </div>

          {/* Mobile Dropdown */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={commonButtonStyles}
                >
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="focus:bg-gray-100">
                  <div className="w-full">
                    <CreateBetSheet />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-gray-100" asChild>
                  <Link href="/leaderboard" className="w-full">
                    Leaderboard
                  </Link>
                </DropdownMenuItem>
                {isConnected ? (
                  <>
                    <DropdownMenuItem className="focus:bg-gray-100" disabled>
                      <span className="font-mono text-sm">
                        {formatAddress(address)}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="focus:bg-gray-100 cursor-pointer"
                      onSelect={() => disconnect()}
                    >
                      Disconnect
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem className="focus:bg-gray-100">
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => (
                        <Button
                          onClick={openConnectModal}
                          variant="ghost"
                          className="w-full justify-start p-0 font-normal"
                        >
                          Connect Wallet
                        </Button>
                      )}
                    </ConnectButton.Custom>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

const LandingPage = () => {
  return (
    <main className="relative min-h-screen">
      {/* Background grid layers */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-30 blur-sm"
          style={{
            backgroundSize: "50px 50px",
            backgroundImage: `
              linear-gradient(to right, #BE9911 1px, transparent 1px),
              linear-gradient(to bottom, #BE9911 1px, transparent 1px)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundSize: "50px 50px",
            filter: "blur(0.5px)",
            backgroundImage: `
              linear-gradient(to right, #BE9911 1px, transparent 1px),
              linear-gradient(to bottom, #BE9911 1px, transparent 1px)
            `,
          }}
        />
      </div>
      {/* Content layer */}
      <div className="relative z-10">
        <Navbar />
        <div className="relative">
          <div className="grid place-items-center mt-6 sm:mt-10">
            <img
              src="/hero.png"
              className="w-full max-w-xs sm:max-w-2xl px-4"
              alt="Hero image"
            />
          </div>
          <PlayGame />
        </div>
      </div>
    </main>
  );
};

export default LandingPage;

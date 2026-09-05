"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import About from "./about";
import { FOMO_WALLET_GAME_ADDRESS, FomoWalletGameABI, botChain } from "@/utils/contracts";

const PlayGame = ({ chainid, betid, contractAddress }) => {
  const gameAddress = contractAddress || FOMO_WALLET_GAME_ADDRESS;
  const gameId = betid ? BigInt(betid) : undefined;

  const [guess, setGuess] = useState("");
  const [txHash, setTxHash] = useState("");

  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  const { writeContractAsync, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const gameState = useReadContract({
    address: gameAddress,
    abi: FomoWalletGameABI,
    functionName: "getGameState",
    args: gameId !== undefined ? [gameId] : undefined,
    query: { enabled: !!gameAddress && gameId !== undefined && gameAddress.startsWith("0x") && gameAddress.length === 42 },
    watch: true,
  });

  const playerGuess = useReadContract({
    address: gameAddress,
    abi: FomoWalletGameABI,
    functionName: "getPlayerGuess",
    args: gameId !== undefined && address ? [gameId, address] : undefined,
    query: { enabled: !!gameAddress && gameId !== undefined && !!address },
    watch: true,
  });

  const playerHint = useReadContract({
    address: gameAddress,
    abi: FomoWalletGameABI,
    functionName: "getPlayerHint",
    args: gameId !== undefined && address ? [gameId, address] : undefined,
    query: { enabled: !!gameAddress && gameId !== undefined && !!address && playerGuess.data?.[1] === true },
    watch: true,
  });

  const game = useMemo(() => {
    if (!gameState.data) return null;
    const [host, targetNumber, deadline, winner, winningGuess, finalized, exists, guessCount] = gameState.data;
    return { host, targetNumber, deadline, winner, winningGuess, finalized, exists, guessCount };
  }, [gameState.data]);

  const now = useNow();
  const expired = game ? Number(game.deadline) * 1000 < now : false;

  useEffect(() => {
    if (isConfirmed) {
      setGuess("");
      setTxHash("");
    }
  }, [isConfirmed]);

  const handleSubmitGuess = async (e) => {
    e.preventDefault();
    if (!guess || gameId === undefined) return;
    const hash = await writeContractAsync({
      address: gameAddress,
      abi: FomoWalletGameABI,
      functionName: "placeGuess",
      args: [gameId, BigInt(guess)],
    });
    setTxHash(hash);
  };

  const handleFinalize = async () => {
    if (gameId === undefined) return;
    const hash = await writeContractAsync({
      address: gameAddress,
      abi: FomoWalletGameABI,
      functionName: "finalizeGame",
      args: [gameId],
    });
    setTxHash(hash);
  };

  const switchToBot = () => {
    switchChain?.({ chainId: botChain.id });
  };

  // Network check render
  if (isConnected && currentChainId !== botChain.id) {
    return (
      <div className="pt-12">
        <div className="px-4 sm:px-16">
          <div className="bg-purple-600 rounded-xl border-4 border-black shadow-custom p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-6">Wrong Network</h2>
              <p className="text-white mb-6 font-mono">Please switch to BOT Chain to continue</p>
              <Button
                onClick={switchToBot}
                className="border-2 border-black bg-pink-500 text-white hover:bg-pink-600"
              >
                Switch to BOT Chain
              </Button>
            </div>
          </div>
        </div>
        <About />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="pt-12">
        <div className="px-4 sm:px-16">
          <div className="bg-purple-600 rounded-xl border-4 border-black shadow-custom p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-6">Connect Your Wallet</h2>
              <p className="text-white mb-6 font-mono">Please connect your wallet to start playing</p>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button
                    onClick={openConnectModal}
                    className="border-2 border-black bg-pink-500 text-white hover:bg-pink-600"
                  >
                    Connect Wallet
                  </Button>
                )}
              </ConnectButton.Custom>
            </div>
          </div>
        </div>
        <About />
      </div>
    );
  }

  if (!gameId) {
    return (
      <div className="pt-12">
        <div className="px-4 sm:px-16">
          <div className="bg-purple-600 rounded-xl border-4 border-black shadow-custom p-8 text-center">
            <h2 className="text-2xl font-bold text-white">No Game Selected</h2>
            <p className="text-white mt-4 font-mono">Create or join a game to start playing.</p>
          </div>
        </div>
        <About />
      </div>
    );
  }

  if (gameState.isLoading || !game) {
    return (
      <div className="pt-12">
        <div className="px-4 sm:px-16">
          <div className="bg-purple-600 rounded-xl border-4 border-black shadow-custom p-8 text-center">
            <h2 className="text-2xl font-bold text-white">Loading game...</h2>
          </div>
        </div>
        <About />
      </div>
    );
  }

  if (!game.exists) {
    return (
      <div className="pt-12">
        <div className="px-4 sm:px-16">
          <div className="bg-purple-600 rounded-xl border-4 border-black shadow-custom p-8 text-center">
            <h2 className="text-2xl font-bold text-white">Game not found</h2>
          </div>
        </div>
        <About />
      </div>
    );
  }

  const hasGuessed = playerGuess.data?.[1] === true;

  return (
    <div className="pt-12">
      <div className="px-4 sm:px-16">
        <div className="bg-purple-600 rounded-xl border-4 border-black shadow-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 overflow-hidden">
            {/* Left side - Game Info */}
            <div className="border-b-4 sm:border-b-0 sm:border-r-4 border-black p-4 sm:p-8 bg-blue-500 rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Game #{gameId.toString()}</h2>
              <div className="space-y-4">
                <div className="bg-white border-2 border-black rounded-lg p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Game Stats</h3>
                  <ul className="space-y-1 sm:space-y-2 font-mono text-sm sm:text-base">
                    <li>Host: {game.host.slice(0, 6)}...{game.host.slice(-4)}</li>
                    <li>Deadline: {new Date(Number(game.deadline) * 1000).toLocaleString()}</li>
                    <li>Guesses: {game.guessCount.toString()}</li>
                    <li>Status: {game.finalized ? "Finalized" : expired ? "Ended (finalize to reveal winner)" : "Active"}</li>
                    {game.finalized && (
                      <>
                        <li>Winner: {game.winner.slice(0, 6)}...{game.winner.slice(-4)}</li>
                        <li>Winning Guess: {game.winningGuess.toString()}</li>
                      </>
                    )}
                  </ul>
                </div>
                <div className="bg-white border-2 border-black rounded-lg p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Game Rules</h3>
                  <ul className="space-y-1 sm:space-y-2 font-mono text-sm sm:text-base">
                    <li>Pick a number</li>
                    <li>Submit your guess on BOT Chain</li>
                    <li>Get high / low hints</li>
                    <li>Closest guess when the round ends wins</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right side - Guess / Result */}
            <div className="p-4 sm:p-8 bg-pink-500 rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                {game.finalized ? "Final Result" : "Place Your Guess"}
              </h2>
              <div className="bg-white border-2 border-black rounded-lg p-4 sm:p-6">
                {!game.finalized ? (
                  <form onSubmit={handleSubmitGuess} className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm sm:text-base">Enter Your Number Guess</label>
                      <Input
                        type="number"
                        min="0"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        className="w-full shadow-light border-black"
                        placeholder="e.g. 42"
                        disabled={isPending || isConfirming || hasGuessed}
                        required
                      />
                    </div>

                    {hasGuessed && (
                      <div className="bg-blue-100 border-2 border-black rounded p-3 text-center">
                        <p className="font-bold">Your guess: {playerGuess.data[0].toString()}</p>
                        <p className="font-mono mt-1">Hint: {playerHint.data || "Submit a guess to see a hint"}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isPending || isConfirming || hasGuessed}
                      className="w-full border-black bg-pink-500 text-white text-sm sm:text-base"
                    >
                      {isPending ? "Confirming..." : isConfirming ? "Waiting for confirmation..." : hasGuessed ? "Already Guessed" : "Submit Guess"}
                    </Button>

                    {expired && !game.finalized && (
                      <Button
                        type="button"
                        onClick={handleFinalize}
                        disabled={isPending || isConfirming}
                        className="w-full border-black bg-purple-600 text-white text-sm sm:text-base"
                      >
                        {isPending ? "Confirming..." : isConfirming ? "Waiting..." : "Finalize Game"}
                      </Button>
                    )}

                    {txHash && (
                      <div className="text-sm text-gray-600 break-all">
                        Transaction Hash: {txHash}
                      </div>
                    )}

                    {isConfirmed && (
                      <div className="text-green-600 text-center text-sm">Transaction confirmed.</div>
                    )}

                    {error && (
                      <div className="text-red-500 text-center text-sm">
                        Error: {error.shortMessage || error.message}
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-xl font-bold">Game Over</p>
                    <p className="font-mono">Winner: {game.winner.slice(0, 6)}...{game.winner.slice(-4)}</p>
                    <p className="font-mono">Winning Guess: {game.winningGuess.toString()}</p>
                    {hasGuessed && (
                      <p className="font-mono">Your guess: {playerGuess.data[0].toString()}</p>
                    )}
                    <a
                      href={`https://scan.botchain.ai/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      View on BOTScan
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <About />
    </div>
  );
};

function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default PlayGame;

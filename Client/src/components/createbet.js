"use client";
import React, { useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { decodeEventLog, parseAbiItem } from "viem";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FOMO_WALLET_GAME_ADDRESS, FomoWalletGameABI } from "@/utils/contracts";

const gameCreatedEvent = parseAbiItem(
  "event GameCreated(uint256 indexed gameId, address indexed host, uint256 deadline)"
);

const CreateBetSheet = () => {
  const router = useRouter();
  const { address } = useAccount();

  const [isOpen, setIsOpen] = useState(false);
  const [targetNumber, setTargetNumber] = useState("");
  const [days, setDays] = useState("0");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("5");
  const [txHash, setTxHash] = useState("");
  const [createdGameId, setCreatedGameId] = useState(null);

  const { writeContractAsync, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed && receipt && !createdGameId) {
      const gameCreatedLog = receipt.logs.find(
        (log) => log.address.toLowerCase() === FOMO_WALLET_GAME_ADDRESS.toLowerCase()
      );

      let gameId = null;
      if (gameCreatedLog) {
        try {
          const decoded = decodeEventLog({
            abi: [gameCreatedEvent],
            data: gameCreatedLog.data,
            topics: gameCreatedLog.topics,
          });
          gameId = decoded.args.gameId.toString();
        } catch (e) {
          console.error("Failed to decode log", e);
        }
      }

      if (gameId) {
        setCreatedGameId(gameId);
        setTimeout(() => {
          setIsOpen(false);
          setTargetNumber("");
          setDays("0");
          setHours("0");
          setMinutes("5");
          setTxHash("");
          setCreatedGameId(null);
          router.push(`/${FOMO_WALLET_GAME_ADDRESS}/677/${gameId}`);
        }, 1500);
      }
    }
  }, [isConfirmed, receipt, createdGameId, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetNumber || !address) return;

    const totalSeconds =
      (parseInt(days || 0) * 24 * 3600) +
      (parseInt(hours || 0) * 3600) +
      (parseInt(minutes || 0) * 60);

    if (totalSeconds <= 0) {
      alert("Duration must be greater than 0");
      return;
    }

    const hash = await writeContractAsync({
      address: FOMO_WALLET_GAME_ADDRESS,
      abi: FomoWalletGameABI,
      functionName: "createGame",
      args: [BigInt(targetNumber), BigInt(totalSeconds)],
    });
    setTxHash(hash);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="default" className="border-2 border-black bg-white">
          Create New Game
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create New Game</SheetTitle>
          <SheetDescription>
            Pick a target number and set how long the round lasts.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetNumber">Target Number</Label>
            <Input
              id="targetNumber"
              type="number"
              min="0"
              value={targetNumber}
              onChange={(e) => setTargetNumber(e.target.value)}
              placeholder="42"
              required
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Stored on-chain for this simplified demo.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Round Duration</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="days" className="text-sm text-gray-500">Days</Label>
                <Input
                  id="days"
                  type="number"
                  min="0"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="0"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="hours" className="text-sm text-gray-500">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="0"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="minutes" className="text-sm text-gray-500">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="5"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full border-2 border-black"
            disabled={isPending || isConfirming}
          >
            {isPending
              ? "Confirming..."
              : isConfirming
              ? "Waiting for confirmation..."
              : "Create Game"}
          </Button>

          {createdGameId && (
            <div className="text-green-600 text-sm mt-2">
              Game #{createdGameId} created! Redirecting...
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center text-sm">
              Error: {error.shortMessage || error.message}
            </div>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateBetSheet;

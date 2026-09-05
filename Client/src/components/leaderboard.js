"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePublicClient } from "wagmi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { FOMO_WALLET_GAME_ADDRESS, FomoWalletGameABI } from "@/utils/contracts";

const LeaderboardTable = () => {
  const publicClient = usePublicClient();
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!publicClient) return;
    let cancelled = false;

    const fetchGames = async () => {
      try {
        const counter = await publicClient.readContract({
          address: FOMO_WALLET_GAME_ADDRESS,
          abi: FomoWalletGameABI,
          functionName: "gameCounter",
        });

        const total = Number(counter);
        const calls = [];
        for (let i = 1; i <= total; i++) {
          calls.push(
            publicClient.readContract({
              address: FOMO_WALLET_GAME_ADDRESS,
              abi: FomoWalletGameABI,
              functionName: "getGameState",
              args: [BigInt(i)],
            }).then((data) => ({ gameId: i, data }))
          );
        }

        const results = await Promise.all(calls);
        if (!cancelled) setGames(results.reverse());
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchGames();
    const id = setInterval(fetchGames, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [publicClient]);

  if (isLoading) {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Games</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Guesses</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Winner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map(({ gameId, data }) => {
              const [host, , deadline, winner, winningGuess, finalized] = data;
              const expired = Number(deadline) * 1000 < Date.now();
              const status = finalized ? "Finalized" : expired ? "Ended" : "Active";
              return (
                <TableRow key={gameId} className="hover:bg-gray-50">
                  <TableCell>
                    <Link
                      href={`/${FOMO_WALLET_GAME_ADDRESS}/677/${gameId}`}
                      className="text-purple-600 hover:underline font-medium"
                    >
                      #{gameId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {host.slice(0, 6)}...{host.slice(-4)}
                  </TableCell>
                  <TableCell suppressHydrationWarning>
                    {new Date(Number(deadline) * 1000).toLocaleString()}
                  </TableCell>
                  <TableCell>{data.guessCount?.toString?.() || data[7]?.toString?.()}</TableCell>
                  <TableCell>{status}</TableCell>
                  <TableCell>
                    {finalized
                      ? `${winner.slice(0, 6)}...${winner.slice(-4)} (${winningGuess.toString()})`
                      : "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LeaderboardTable;

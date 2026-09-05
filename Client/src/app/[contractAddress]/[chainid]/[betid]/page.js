"use client";
import { Navbar } from "@/components/landingpage";
import PlayGame from "@/components/playgame";
import { useParams } from "next/navigation";
import React from "react";

const Page = () => {
  const params = useParams();
  return (
    <main className="relative min-h-screen">
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
      <div className="relative z-10">
        <Navbar />
        <div className="relative">
          <PlayGame
            chainid={params.chainid}
            betid={params.betid}
            contractAddress={params.contractAddress}
          />
        </div>
      </div>
    </main>
  );
};

export default Page;

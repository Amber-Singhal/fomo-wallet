import React from "react";
import Marquee from "react-fast-marquee";

const winners = [
  { username: "@LuckyGambler23", amount: "$1,250" },
  { username: "@HighRollerPro", amount: "$3,400" },
  { username: "@BettingKing", amount: "$780" },
  { username: "@CasinoMaster", amount: "$5,000" },
  { username: "@QuickWinQueen", amount: "$2,150" },
  { username: "@JackpotHunter", amount: "$4,800" },
  { username: "@SpinToWin", amount: "$900" },
  { username: "@DiceMaster88", amount: "$1,600" },
  { username: "@SlotChampion", amount: "$2,300" },
  { username: "@BetPro99", amount: "$3,750" },
];

const CustomMarquee = ({ direction }) => {
  return (
    <div className="pt-24">
      <Marquee
        className="border-y-4 border-black bg-white py-2 m500:py-4 font-base"
        direction={direction}>
        {Array(3)
          .fill(winners)
          .flat()
          .map((winner, id) => (
            <div className="flex gap-20" key={id}>
              <div className="ml-20 flex gap-5 items-center">
                <span className="text-4xl m800:text-2xl m500:text-xl font-bold text-black">
                  {winner.username}
                </span>
                <span className="text-4xl m800:text-2xl m500:text-xl text-green-600">
                  {winner.amount}
                </span>
              </div>
            </div>
          ))}
      </Marquee>
    </div>
  );
};

export default CustomMarquee;
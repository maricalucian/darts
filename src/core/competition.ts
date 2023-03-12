import { getRoundPlayers, startCompetition } from "../firestore/competition";
import { Competition, FirestoreRound, Match } from "../types";
import { BLANK } from "./constants";

export const prizeSturcture = {
  0: {
    1: 50,
    2: 30,
    3: 20,
  },
  8: {
    1: 40,
    2: 30,
    3: 20,
    4: 10,
  },
  13: {
    1: 35,
    2: 25,
    3: 15,
    4: 10,
    5: 7.5,
    6: 7.5,
  },
  17: {
    1: 28,
    2: 20,
    3: 14,
    4: 10,
    5: 8,
    6: 8,
    7: 6,
    8: 6,
  }
}

const nextPowerOfTwo = (num: number): number => {
  let result = 1;
  while (result < num) {
    result <<= 1;
  }
  return result;
};

const getBlanksPositions = (
  requiredBlanks: number,
  min: number,
  max: number
): number[] => {

  if (requiredBlanks > 1) {
    let b1 = Math.floor(requiredBlanks / 2);
    let b2 = Math.floor(requiredBlanks / 2);

    if (requiredBlanks % 2 != 0) {
      if (Math.floor(Math.random() * 2) == 0) {
        b1++;
      } else {
        b2++;
      }
    }
    const newB1Max = min + Math.floor((max - min - 1) / 2);
    return getBlanksPositions(b1, min, newB1Max).concat(
      getBlanksPositions(b2, newB1Max + 1, max)
    );
  }

  return [Math.floor(Math.random() * (max - min + 1) + min)];
};

export const startRound = async (round: FirestoreRound) => {
  if (round.status !== "registering") {
    alert("Round cannot start at this time!");
    return;
  }

  const roundPlayers = await getRoundPlayers(round.round);
  const playersList = Object.keys(roundPlayers);
  const size = nextPowerOfTwo(playersList.length);
  const blanks = getBlanksPositions(size - playersList.length, 0, size - 1);

  let competition = getCompetitionMatches(playersList.length);

  for (let i = 0; i < size / 2; i++) {
    if (blanks.includes(i * 2)) {
      competition[i + 1].player1 = BLANK;
    } else {
      competition[i + 1].player1 = playersList[0];
      playersList.shift();
    }
    if (blanks.includes(i * 2 + 1)) {
      competition[i + 1].player2 = BLANK;
    } else {
      competition[i + 1].player2 = playersList[0];
      playersList.shift();
    }
  }
  // process byes
  competition = getProcessedCompetition(competition);

  startCompetition(round.round, competition);
};

export const getNextMatchOrder = (match: Match) => {
  switch (match.location) {
    case "seed":
      return { winnerTop: match.number % 2, looserTop: match.number % 2 };
    case "right":
      return { winnerTop: match.number % 2, looserTop: false };
    case "left":
      return { winnerTop: true, looserTop: false };
    case "newcomers":
      return { winnerTop: match.number % 2, looserTop: false };
    default:
      return { winnerTop: true, looserTop: false };
  }
};

export const getCompetitionMatches = (playersNo: number): Competition => {
  const totalPlayers = nextPowerOfTwo(playersNo);
  const matches: Competition = {};
  const seedMatches = totalPlayers / 2;
  for (let i = 0; i < seedMatches; i++) {
    matches[i + 1] = {
      number: i + 1,
      winnerMatch: seedMatches + Math.floor(i / 2) + 1,
      looserMatch:
        seedMatches + Math.floor(seedMatches / 2) + Math.floor(i / 2) + 1,
      winnerPosition: 0,
      looserPosition: 0,
      round: 0,
      location: "seed",
      indexInColumn: i,
      totalInColumn: seedMatches,
    };
  }

  return getRoundsMatches(
    matches,
    Math.floor(seedMatches / 2),
    seedMatches + 1,
    1
  );
};

export const getRoundsMatches = (
  matches: Competition,
  roundMatches: number,
  nextMatch: number,
  round: number
): Competition => {
  // matched this round on right side
  for (let i = 0; i < roundMatches; i++) {
    matches[nextMatch + i] = {
      number: nextMatch + i,
      winnerMatch: nextMatch + roundMatches * 3 + Math.floor(i / 2),
      looserMatch: nextMatch + roundMatches * 3 - i - 1,
      winnerPosition: 0,
      looserPosition: 0,
      round: round,
      location: "right",
      indexInColumn: i,
      totalInColumn: roundMatches,
    };
  }

  // matched this round on left side
  for (let i = 0; i < roundMatches; i++) {
    matches[nextMatch + roundMatches + i] = {
      number: nextMatch + roundMatches + i,
      winnerMatch: nextMatch + roundMatches * 2 + i,
      looserMatch: 0,
      winnerPosition: 0,
      looserPosition: roundMatches * 3 + 1,
      round: round,
      location: "left",
      indexInColumn: i,
      totalInColumn: roundMatches,
    };
  }

  // matched this round on left side with new loosers
  for (let i = 0; i < roundMatches; i++) {
    matches[nextMatch + roundMatches * 2 + i] = {
      number: nextMatch + roundMatches * 2 + i,
      winnerMatch:
        nextMatch +
        roundMatches * 3 +
        Math.floor(roundMatches / 2) +
        Math.floor(i / 2),
      looserMatch: 0,
      winnerPosition: 0,
      looserPosition: roundMatches * 2 + 1,
      round: round,
      location: "newcomers",
      indexInColumn: i,
      totalInColumn: roundMatches,
    };
  }

  if (roundMatches > 1) {
    return getRoundsMatches(
      matches,
      roundMatches / 2,
      nextMatch + roundMatches * 3,
      round + 1
    );
  } else {
    matches[nextMatch + roundMatches * 3] = {
      number: nextMatch + roundMatches * 3,
      winnerMatch: 0,
      looserMatch: 0,
      winnerPosition: 1,
      looserPosition: 2,
      round: round + 1,
      location: "final",
      indexInColumn: 0,
      totalInColumn: 1,
    };
  }

  return matches;
};

export const getProcessedCompetition = (
  competition: Competition
): Competition => {
  Object.values(competition).forEach((match) => {
    const score1 = match.score1 || 0;
    const score2 = match.score2 || 0;

    match.player1 = match.player1 || "";
    match.player2 = match.player2 || "";

    let winner = "";
    let looser = "";

    // score was entered
    if (score1 || score2) {
      winner = score1 > score2 ? match.player1 : match.player2;
      looser = score1 > score2 ? match.player2 : match.player1;
    }

    if (match.player1 === BLANK) {
      winner = match.player2;
      looser = match.player1;
    } else if (match.player2 === BLANK) {
      winner = match.player1;
      looser = match.player2;
    }

    if (winner && looser) {
      const order = getNextMatchOrder(match);

      match.finished = true;
      match.winner = winner;
      match.looser = looser;

      if (match.winnerMatch) {
        if (order.winnerTop) {
          competition[match.winnerMatch].player1 = winner;
        } else {
          competition[match.winnerMatch].player2 = winner;
        }
      }
      if (match.looserMatch) {
        if (order.looserTop) {
          competition[match.looserMatch].player1 = looser;
        } else {
          competition[match.looserMatch].player2 = looser;
        }
      }
    } else {
      match.finished = false;
      match.winner = '';
      match.looser = '';
    }
  });

  return competition;
};

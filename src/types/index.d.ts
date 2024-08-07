import { User } from "firebase/auth";

export type MatchLocation = "seed" | "right" | "left" | "newcomers" | "final";

// export type Matches = { [key: string]: Match };

export type MatchStats = {
  highFinishPlayer1: number;
  highFinishPlayer2: number;
};

export type Match = {
  number: number;
  winnerMatch: number;
  looserMatch: number;
  winnerPosition: number;
  looserPosition: number;
  round: number;
  location: MatchLocation;
  indexInColumn: number;
  totalInColumn: number;
  info1?: string;
  info2?: string;
  finished?: boolean = false;
  player1?: string;
  player2?: string;
  score1?: number;
  score2?: number;
  winner?: string;
  looser?: string;
  player1180s?: number;
  player2180s?: number;
  player1HF?: number;
  player2HF?: number;
  player1BL?: number;
  player2BL?: number;
  player1avg?: number;
  player2avg?: number;
  player1140s?: number;
  player2140s?: number;
  player1100s?: number;
  player2100s?: number;
};

export type Competition = { [key: number]: Match };

export type FirestoreRound = {
  players: string[];
  round: number;
  type?: string;
  paid?: number;
  status: "registering" | "running" | "completed";
  fee?: number;
};

export type TPlayer = {
  name: string;
};

export type TPlayersList = {
  [key: string]: TPlayer;
};

export type TRoundPlayer = {
  uid: string;
  paid?: boolean;
  rank?: number;
  hf?: number;
  one80s?: number;
  points?: number;
  basePoints?: number;
  bonus?: number;
};

export type TRoundPlayerList = {
  [key: string]: TRoundPlayer;
};

export type TTeams = {
  [key: string]: {
    p1: string;
    p2: string;
  };
};

export type TResults = {
  score1: number;
  score2: number;
  player1180s: number;
  player2180s: number;
  player1HF: number;
  player2HF: number;
  player1BL: number;
  player2BL: number;
  finished?: boolean;
  player1avg: number;
  player2avg: number;
  player1140s: number;
  player2140s: number;
  player1100s: number;
  player2100s: number;
};

export type TStat = {
  "180s"?: number;
  "100s"?: number;
  "140s"?: number;
  avg?: number;
  legs?: number;
  matches?: number;
  won?: number;
  lost?: number;
  hf?: number;
  legsWon?: number;
  legsLost?: number;
};


export type TStats = {
  [key: string]: TStat;
};


export type AppUser = {
  loggedIn: boolean;
  user?: User;
};

export type TRoundResult = {
  hf: number;
  one80s: number;
  rank: number;
};

export type TRoundResults = {
  [key: string]: TRoundResult;
};

export type TStanding = {
  hf?: number;
  one80s?: number;
  points?: number;
  rank?: number;
  "180s"?: number;
  "100s"?: number;
  "140s"?: number;
  avg?: number;
  legs?: number;
  matches?: number;
  won?: number;
  lost?: number;
  legsWon?: number;
  legsLost?: number;
};
export type TStandings = {
  [key: string]: TStanding;
};

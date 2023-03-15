import { User } from "firebase/auth";

export type MatchLocation = "seed" | "right" | "left" | "newcomers" | "final";

// export type Matches = { [key: string]: Match };

export type MatchStats = {
  highFinishPlayer1: number;
  highFinishPlayer2: number;
}

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
};

export type Competition = { [key: number]: Match };

export type FirestoreRound = {
  players: string[];
  round: number;
  status: "registering" | "running" | "completed";
};

export type TPlayer = {
  name: string;
}

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
}

export type TRoundPlayerList = {
  [key: string]: TRoundPlayer;
};

export type TResults = {
  score1: number;
  score2: number;
  player1180s: number;
  player2180s: number;
  player1HF: number;
  player2HF: number;
  finished?: boolean;
};

export type AppUser = {
  loggedIn: boolean;
  user?: User;
}

export type TRoundResult = {
  hf: number;
  one80s: number;
  rank: number
}

export type TRoundResults = {
  [key: string]: TRoundResult;
};

export type TStanding = {
  hf?: number;
  one80s?: number;
  points?: number;
  rank?: number;
}
export type TStandings = {
  [key: string]: TStanding;
}
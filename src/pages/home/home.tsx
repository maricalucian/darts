import React, { ReactElement, useEffect, useState } from "react";
import {
  Competition,
  TPlayersList,
  FirestoreRound,
  Match,
  TRoundResults,
  TRoundResult,
} from "../../types";
import {
  Box,
  LinearProgress,
  Typography,
  ListItemText,
  Card,
  List,
  ListItem,
  CardContent,
} from "@mui/material";
import { BLANK } from "../../core/constants";

import "./home.scss";
import { prizeSturcture } from "../../core/competition";
import { HomeRunning } from "./home-running";
import { HomeRegistering } from "./home-registering";

type THomePageProps = {
  competition: Competition;
  playersMap: TPlayersList;
  round: FirestoreRound;
  roundPlayers: string[];
  results: TRoundResults;
  popupMatchInfo: (round: number, match: Match) => void;
};

export const HomePage = ({
  round,
  competition,
  playersMap,
  popupMatchInfo,
  roundPlayers,
  results,
}: THomePageProps): ReactElement => {

  return (
    <div className="home">
    {round.status === "running" && (
      <HomeRunning
        results={results}
        roundPlayers={roundPlayers}
        competition={competition}
        playersMap={playersMap}
        popupMatchInfo={popupMatchInfo}
        round={round}
      />
    )}
    {round.status === "registering" && (
      <HomeRegistering
        results={results}
        roundPlayers={roundPlayers}
        competition={competition}
        playersMap={playersMap}
        popupMatchInfo={popupMatchInfo}
        round={round}
      />
    )}
    </div>
  );
};

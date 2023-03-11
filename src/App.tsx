import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Header } from "./components/header/header";
import { BracketPage } from "./pages/bracket/bracket";
import { HomePage } from "./pages/home/home";
import { Backdrop } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {
  getCurrentRoundIndex,
  subscribeToAllPlayers,
  subscribeToRound,
  subscribeToRoundMatches,
  subscribeToRoundPlayers,
} from "./firestore/competition";
import { Competition, FirestoreRound, Match, TPlayersList } from "./types";
import { ManagePage } from "./pages/manage/manage";
import { MatchesPage } from "./pages/matches/matches";

import "./App.scss";
import { MatchInfoDialog } from "./components/match-info-dialog/match-info-dialog";

const emptyRound: FirestoreRound = {
  players: [],
  round: 0,
  status: "registering",
};

function App() {
  const [round, setRound] = useState(emptyRound);
  const [currendRoundIndex, setCurrentRoundIndex] = useState(0);
  const [playersMap, setPlayersMap] = useState({} as TPlayersList);
  const [roundPlayers, setRoundPlayers] = useState([] as string[]);
  const [competition, setCompetition] = useState({} as Competition);
  const [loaderIsOpen, setLoaderOpen] = useState(false);
  const [matchDialogIsOpen, setMatchDialogOpen] = useState(false);
  const [dialogMatch, setDialogMatch] = useState({} as Match);

  useEffect(() => {
    return subscribeToAllPlayers((data: TPlayersList) => {
      setPlayersMap(data);
    });
  }, []);

  useEffect(() => {
    return subscribeToRoundPlayers(round.round, (data: string[]) => {
      setRoundPlayers(data);
    });
  }, [round.round]);

  useEffect(() => {
    return subscribeToRoundMatches(round.round, (data: Competition) => {
      setCompetition(data);
    });
  }, [round.round]);

  useEffect(() => {
    getCurrentRoundIndex().then((roundIndex) => {
      setCurrentRoundIndex(roundIndex);
    });
  }, []);

  useEffect(() => {
    return subscribeToRound(currendRoundIndex, (data: FirestoreRound) => {
      setRound(data);
    });
  }, [currendRoundIndex]);

  const showMatchInfo = (round: number, match: Match) => {
    setDialogMatch(match);
    setMatchDialogOpen(true);
  };

  const closeMatchDialog = () => {
    setMatchDialogOpen(false);
  };

  return (
    <div className="app">
      <Header round={round} />
      <Routes>
        <Route path="/" element={<HomePage round={round} />} />
        <Route
          path="/bracket"
          element={
            <BracketPage competition={competition} playersMap={playersMap} />
          }
        />
        <Route
          path="/matches"
          element={
            <MatchesPage
              round={round}
              playersMap={playersMap}
              competition={competition}
              popupMatchInfo={showMatchInfo}
            />
          }
        />
        <Route
          path="/manage"
          element={
            <ManagePage
              round={round}
              playersMap={playersMap}
              roundPlayers={roundPlayers}
              showLoader={setLoaderOpen}
            />
          }
        />
      </Routes>

      <MatchInfoDialog
        round={round}
        playersMap={playersMap}
        dialogIsOpen={matchDialogIsOpen}
        match={dialogMatch}
        closeDialog={closeMatchDialog}
      />

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loaderIsOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default App;

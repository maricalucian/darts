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
  subscribeToResults,
  subscribeToRound,
  subscribeToRoundMatches,
  subscribeToRoundPlayers,
  subscribeToUsersMap,
} from "./firestore/competition";
import {
  AppUser,
  Competition,
  FirestoreRound,
  Match,
  TPlayersList,
  TRoundResults,
} from "./types";
import { ManagePage } from "./pages/manage/manage";
import { MatchesPage } from "./pages/matches/matches";
import {  getAuth, onAuthStateChanged } from "firebase/auth";

import "./App.scss";
import { MatchInfoDialog } from "./components/match-info-dialog/match-info-dialog";
import { LoginPage } from "./pages/login/login";
import { UsersPage } from "./pages/users/users";

const emptyRound: FirestoreRound = {
  players: [],
  round: 0,
  status: "registering",
};

function App() {
  const [round, setRound] = useState({} as FirestoreRound);
  const [currendRoundIndex, setCurrentRoundIndex] = useState(0);
  const [playersMap, setPlayersMap] = useState({} as TPlayersList);
  const [roundPlayers, setRoundPlayers] = useState([] as string[]);
  const [competition, setCompetition] = useState({} as Competition);
  const [loaderIsOpen, setLoaderOpen] = useState(false);
  const [matchDialogIsOpen, setMatchDialogOpen] = useState(false);
  const [dialogMatch, setDialogMatch] = useState({} as Match);
  const [usersMap, setUsersMap] = useState({} as { [key: string]: string });
  const [user, setUser] = useState({} as AppUser);
  const [results, setResults] = useState({} as TRoundResults);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser({
          loggedIn: true,
          user: authUser,
        });
      } else {
        setUser({
          loggedIn: false,
        });
      }
    });
  }, []);

  useEffect(() => {
    return subscribeToAllPlayers((data: TPlayersList) => {
      setPlayersMap(data);
    });
  }, []);

  useEffect(() => {
    if (!round.round) {
      return;
    }
    return subscribeToResults(round.round, (data: TRoundResults) => {
      setResults(data);
    });
  }, [round.round]);

  useEffect(() => {
    if (!round.round) {
      return;
    }
    return subscribeToUsersMap((data: { [key: string]: string }) => {
      setUsersMap(data);
    });
  }, [round.round]);

  useEffect(() => {
    if (!round.round) {
      return;
    }
    return subscribeToRoundPlayers(round.round, (data: string[]) => {
      setRoundPlayers(data);
    });
  }, [round.round]);

  useEffect(() => {
    if (!round.round) {
      return;
    }
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
      <Header round={round} user={user} />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              results={results}
              roundPlayers={roundPlayers}
              competition={competition}
              playersMap={playersMap}
              popupMatchInfo={showMatchInfo}
              round={round}
            />
          }
        />
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
        <Route path="/login" element={<LoginPage user={user} />} />
        <Route
          path="/users"
          element={
            <UsersPage
              user={user}
              playersMap={playersMap}
              usersMap={usersMap}
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
        usersMap={usersMap}
        closeDialog={closeMatchDialog}
        uid={user.user?.uid || ""}
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

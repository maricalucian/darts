import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Header } from "./components/header/header";
import { BracketPage } from "./pages/bracket/bracket";
import { HomePage } from "./pages/home/home";
import {
  Backdrop,
  Divider,
  Drawer,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {
  getCurrentRoundIndex,
  subscribeToAllPlayers,
  subscribeToRound,
  subscribeToRoundMatches,
  subscribeToRoundPlayers,
  subscribeToRoundTeams,
  subscribeToUsersMap,
} from "./firestore/competition";
import {
  AppUser,
  Competition,
  FirestoreRound,
  Match,
  TPlayersList,
  TRoundPlayerList,
  TRoundResults,
  TTeams,
} from "./types";
import { ManagePage } from "./pages/manage/manage";
import { MatchesPage } from "./pages/matches/matches";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import "./App.scss";
import { MatchInfoDialog } from "./components/match-info-dialog/match-info-dialog";
import { LoginPage } from "./pages/login/login";
import { UsersPage } from "./pages/users/users";
import { StandingsPage } from "./pages/standings/standings";
import { Preloader } from "./components/preloader/preloader";
import {
  Cloud,
  ContentCopy,
  ContentCut,
  ContentPaste,
} from "@mui/icons-material";
import { PlayerPage } from "./pages/player/player";

const emptyRound: FirestoreRound = {
  players: [],
  round: 0,
  status: "registering",
};

const localComp = localStorage.getItem("competition");
const compId = localComp || "funday24";

function App() {
  const [round, setRound] = useState({} as FirestoreRound);
  const [currendRoundIndex, setCurrentRoundIndex] = useState(0);
  const [playersMap, setPlayersMap] = useState({} as TPlayersList);
  const [roundPlayers, setRoundPlayers] = useState({} as TRoundPlayerList);
  const [teams, setRoundTeams] = useState({} as TTeams);
  const [competition, setCompetition] = useState({} as Competition);
  const [loaderIsOpen, setLoaderOpen] = useState(false);
  const [matchDialogIsOpen, setMatchDialogOpen] = useState(false);
  const [dialogMatch, setDialogMatch] = useState({} as Match);
  const [usersMap, setUsersMap] = useState({} as { [key: string]: string });
  const [user, setUser] = useState({} as AppUser);
  const [preloading, setPreloading] = useState(true);
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
    return subscribeToUsersMap((data: { [key: string]: string }) => {
      setUsersMap(data);
    });
  }, [round.round]);

  useEffect(() => {
    if (!round.round) {
      return;
    }
    return subscribeToRoundPlayers(round.round, (data: TRoundPlayerList) => {
      setRoundPlayers(data);
    });
  }, [round.round]);

  useEffect(() => {
    if (!round.round) {
      return;
    }
    return subscribeToRoundTeams(round.round, (data: TTeams) => {
      setRoundTeams(data);
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
      if (!roundIndex) {
        setPreloading(false);
      }
      setCurrentRoundIndex(roundIndex);
    });
  }, []);

  useEffect(() => {
    return subscribeToRound(currendRoundIndex, (data: FirestoreRound) => {
      setPreloading(false);
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
    <>
      {preloading && <Preloader />}
      {!preloading && (
        <div className="app">
          <Header round={round} user={user} compId={compId} />
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  roundPlayers={roundPlayers}
                  teams={teams}
                  competition={competition}
                  playersMap={playersMap}
                  usersMap={usersMap}
                  popupMatchInfo={showMatchInfo}
                  round={round}
                  compId={compId}
                  user={user}
                  currendRoundIndex={currendRoundIndex}
                />
              }
            />
            <Route
              path="/bracket"
              element={
                <BracketPage
                  round={round}
                  teams={teams}
                  playerId={
                    user.loggedIn ? usersMap[user.user?.uid || ""] || "" : ""
                  }
                  competition={competition}
                  playersMap={playersMap}
                />
              }
            />
            <Route
              path="/matches"
              element={
                <MatchesPage
                  round={round}
                  teams={teams}
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
                  teams={teams}
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
            <Route
              path="/standings"
              element={
                <StandingsPage
                  roundPlayers={roundPlayers}
                  competition={competition}
                  playersMap={playersMap}
                  popupMatchInfo={showMatchInfo}
                  round={round}
                  compId={compId}
                  currendRoundIndex={currendRoundIndex}
                />
              }
            />

            <Route
              path="/player/:uid"
              element={
                <PlayerPage
                  competition={competition}
                  playersMap={playersMap}
                  round={round}
                  compId={compId}
                  usersMap={usersMap}
                  authUid={user.user?.uid || ""}
                />
              }
            />
          </Routes>

          <MatchInfoDialog
            teams={teams}
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
      )}
    </>
  );
}

export default App;

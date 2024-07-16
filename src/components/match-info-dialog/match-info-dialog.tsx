import React, { ReactElement, useEffect, useState } from "react";
import {
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  DialogActions,
} from "@mui/material";
import "./match-info-dialog.scss";
import { FirestoreRound, Match, TPlayersList, TTeams } from "../../types";
import { updateMatchResult } from "../../firestore/competition";
import { ADM } from "../../core/constants";

type TMatchInfoProps = {
  round: FirestoreRound;
  playersMap: TPlayersList;
  dialogIsOpen: boolean;
  usersMap: { [key: string]: string };
  match: Match;
  uid: string;
  teams: TTeams;
  closeDialog: () => void;
};

type TResultsString = {
  score1: string;
  score2: string;
  player1180s: string;
  player2180s: string;
  player1HF: string;
  player2HF: string;
  player1BL: string;
  player2BL: string;
  player1avg: string;
  player2avg: string;
  player1140s: string;
  player2140s: string;
  player1100s: string;
  player2100s: string;
};

const getShortenedName = (name: string): string => {
  const parts = name.split(" ");
  return `${parts[1]} ${parts[0][0]}`;
};

const getPlayerName = (
  playersMap: TPlayersList,
  teams: TTeams,
  playerId: string,
  isPairs: boolean
): ReactElement | string => {
  if (isPairs) {
    return (
      <>
        <div>{getShortenedName(playersMap[playerId]?.name)}</div>
        <div>{getShortenedName(playersMap[teams[playerId]?.p2]?.name)}</div>
      </>
    );
  }

  return playersMap[playerId]?.name;
};

export const MatchInfoDialog = ({
  round,
  dialogIsOpen,
  match,
  closeDialog,
  playersMap,
  usersMap,
  uid,
  teams,
}: TMatchInfoProps): ReactElement => {
  const [dialogEditMode, setDialogEditMode] = useState(false);
  const [errors, setErrors] = useState([] as any);
  const [results, setResults] = useState({
    score1: "",
    score2: "",
    player1180s: "",
    player2180s: "",
    player1HF: "",
    player2HF: "",
    player1avg: "",
    player2avg: "",
    player1140s: "",
    player2140s: "",
    player1100s: "",
    player2100s: "",
  } as TResultsString);

  useEffect(() => {
    results.score1 = match.score1?.toString() || "";
    results.score2 = match.score2?.toString() || "";
    results.player1180s = match.player1180s?.toString() || "";
    results.player2180s = match.player2180s?.toString() || "";
    results.player1HF = match.player1HF?.toString() || "";
    results.player2HF = match.player2HF?.toString() || "";
    results.player1BL = match.player1BL?.toString() || "";
    results.player2BL = match.player2BL?.toString() || "";
    results.player1avg = match.player1avg?.toString() || "";
    results.player2avg = match.player2avg?.toString() || "";
    results.player1140s = match.player1140s?.toString() || "";
    results.player2140s = match.player2140s?.toString() || "";
    results.player1100s = match.player1100s?.toString() || "";
    results.player2100s = match.player2100s?.toString() || "";
  }, [match]);

  const closeMatchDialog = () => {
    setDialogEditMode(false);
    closeDialog();
    setResults({
      score1: "",
      score2: "",
      player1180s: "",
      player2180s: "",
      player1HF: "",
      player2HF: "",
      player1BL: "",
      player2BL: "",
      player1avg: "",
      player2avg: "",
      player1140s: "",
      player2140s: "",
      player1100s: "",
      player2100s: "",
    });
  };

  const checkInputs = () => {
    let errorList = [];
    if(!results.score1) {
      errorList.push('score1');
    }
    if(!results.score2) {
      errorList.push('score2');
    }
    if(parseFloat(results.player1avg || '0') < 10) {
      errorList.push('player1avg');
    }
    if(parseFloat(results.player2avg || '0') < 10) {
      errorList.push('player2avg');
    }
    // if(parseInt(results.player1BL || '0') < 9) {
    //   errorList.push('player1BL');
    // }
    // if(parseInt(results.player2BL || '0') < 9) {
    //   errorList.push('player2BL');
    // }
    setErrors(errorList);

    return errorList.length === 0;
  }

  const updateResult = (res: string, inputVal: string) => {
    let val = inputVal || 0;

    if (["player1avg", "player2avg"].includes(res)) {
      // val = parseFloat(val as any);
      // val = Math.round(val * 100) / 100;
    } else {
      val = parseInt(inputVal as any);
      if (val < 0) {
        val = 0;
      }
    }

    // val = parseInt(inputVal as any);


    if (["player1avg", "player2avg"].includes(res)) {
      if (val > 120) {
        val = 0;
      }
    }

    if (["score1", "score2"].includes(res)) {
      if (val > 6) {
        val = 6;
      }
    }
    if (["player1180s", "player2180s"].includes(res)) {
      if (val > 10) {
        val = 10;
      }
    }
    if (["player1140s", "player2140s"].includes(res)) {
      if (val > 20) {
        val = 20;
      }
    }
    if (["player1100s", "player2100s"].includes(res)) {
      if (val > 20) {
        val = 20;
      }
    }
    if (["player1HF", "player2HF"].includes(res)) {
      if (val > 170) {
        val = 170;
      }
    }
    if (["player1BL", "player2BL"].includes(res)) {
      // if (val < 9) {
      //   val = 9;
      // }
    }
    setResults({ ...results, ...{ [res]: val.toString() } });
  };

  const canEdit =
    round.status !== "completed" &&
    (usersMap[uid] === match.player1 ||
      usersMap[uid] === match.player2 ||
      uid === ADM);

  return (
    <Dialog
      open={dialogIsOpen}
      onClose={() => {
        closeMatchDialog();
      }}
      fullWidth={true}
      className="match-info-dialog"
    >
      {dialogIsOpen && (
        <>
          <DialogTitle>Game No. {match.number}</DialogTitle>
          <DialogContent>
            <div className="match-result">
              <div className="result-line">
                <div className="stat left name">
                  {getPlayerName(
                    playersMap,
                    teams,
                    match.player1 || "",
                    round.type === "teams"
                  )}
                </div>
                <div className="delimiter"></div>
                <div className="stat  name">
                  {getPlayerName(
                    playersMap,
                    teams,
                    match.player2 || "",
                    round.type === "teams"
                  )}
                </div>
              </div>
              <div className="result-line">
                <div className="stat left score">
                  {dialogEditMode && (
                    <input
                      type="number"
                      className="score-tab"
                      style={{
                        backgroundColor: errors.includes('score1') ? '#fee5e5' : '#fff'
                      }}
                      value={results.score1}
                      onChange={(e: any) => {
                        updateResult("score1", e.target.value);
                      }}
                    />
                  )}
                  {!dialogEditMode && (
                    <div className="score-tab">{match.score1}</div>
                  )}
                </div>
                <div className="delimiter"></div>
                <div className="stat score">
                  {dialogEditMode && (
                    <input
                      type="number"
                      className="score-tab"
                      value={results.score2}
                      style={{
                        backgroundColor: errors.includes('score2') ? '#fee5e5' : '#fff'
                      }}
                      onChange={(e: any) => {
                        updateResult("score2", e.target.value);
                      }}
                    />
                  )}
                  {!dialogEditMode && (
                    <div className="score-tab">{match.score2}</div>
                  )}
                </div>
              </div>
              <div className="result-line">
                <div className="stat left">
                  {dialogEditMode && (
                    <input
                      className="info"
                      value={results.player1avg}

                      style={{
                        backgroundColor: errors.includes('player1avg') ? '#fee5e5' : '#fff'
                      }}
                      onChange={(e: any) => {
                        updateResult("player1avg", e.target.value);
                      }}
                    />
                  )}
                  {!dialogEditMode && (
                    <div className="info">{match.player1avg}</div>
                  )}
                </div>
                <div className="delimiter"> AVG </div>
                <div className="stat">
                  {dialogEditMode && (
                    <input
                      className="info"
                      value={results.player2avg}
                      style={{
                        backgroundColor: errors.includes('player2avg') ? '#fee5e5' : '#fff'
                      }}
                      onChange={(e: any) => {
                        updateResult("player2avg", e.target.value);
                      }}
                    />
                  )}
                  {!dialogEditMode && (
                    <div className="info">{match.player2avg}</div>
                  )}
                </div>
              </div>

              <div className="result-line">
                <div className="stat left">
                  {dialogEditMode && (
                    <input
                      type="number"
                      className="info"
                      value={results.player1180s}
                      onChange={(e: any) => {
                        updateResult("player1180s", e.target.value);
                      }}
                    />
                  )}
                  {!dialogEditMode && (
                    <div className="info">{match.player1180s}</div>
                  )}
                </div>
                <div className="delimiter"> 180s </div>
                <div className="stat">
                  {dialogEditMode && (
                    <input
                      type="number"
                      className="info"
                      value={results.player2180s}
                      onChange={(e: any) => {
                        updateResult("player2180s", e.target.value);
                      }}
                    />
                  )}
                  {!dialogEditMode && (
                    <div className="info">{match.player2180s}</div>
                  )}
                </div>
              </div>

              <div className="result-line">
                <div className="stat left">
                  {dialogEditMode && (
                    <input
                      type="number"
                      className="info"
                      value={results.player1140s}
                      onChange={(e: any) => {
                        updateResult("player1140s", e.target.value);
                      }}
                    />
                  )}
                  {!dialogEditMode && (
                    <div className="info">{match.player1140s}</div>
                  )}
                </div>
                <div className="delimiter"> 140s </div>
                <div className="stat">
                  {dialogEditMode && (
                    <input
                      type="number"
                      className="info"
                      value={results.player2140s}
                      onChange={(e: any) => {
                        updateResult("player2140s", e.target.value);
                      }}
                    />
                  )}
                  {!dialogEditMode && (
                    <div className="info">{match.player2140s}</div>
                  )}
                </div>
              </div>

              <div className="result-line">
                <div className="stat left">
                  {dialogEditMode && (
                    <input
                      type="number"
                      className="info"
                      value={results.player1100s}
                      onChange={(e: any) => {
                        updateResult("player1100s", e.target.value);
                      }}
                    />
                  )}
                  {!dialogEditMode && (
                    <div className="info">{match.player1100s}</div>
                  )}
                </div>
                <div className="delimiter"> 100s </div>
                <div className="stat">
                  {dialogEditMode && (
                    <input
                      type="number"
                      className="info"
                      value={results.player2100s}
                      onChange={(e: any) => {
                        updateResult("player2100s", e.target.value);
                      }}
                    />
                  )}
                  {!dialogEditMode && (
                    <div className="info">{match.player2100s}</div>
                  )}
                </div>
              </div>

              <div className="result-line">
                <div className="stat left">
                  {dialogEditMode && (
                    <input
                      type="number"
                      className="info"
                      value={results.player1HF}
                      onChange={(e: any) => {
                        updateResult("player1HF", e.target.value);
                      }}
                    />
                  )}
                  {!dialogEditMode && (
                    <div className="info">
                      {match.player1HF !== 0 && match.player1HF}
                    </div>
                  )}
                </div>
                <div className="delimiter"> HF </div>
                <div className="stat">
                  {dialogEditMode && (
                    <input
                      type="number"
                      className="info"
                      value={results.player2HF}
                      onChange={(e: any) => {
                        updateResult("player2HF", e.target.value);
                      }}
                    />
                  )}
                  {!dialogEditMode && (
                    <div className="info">
                      {match.player2HF !== 0 && match.player2HF}
                    </div>
                  )}
                </div>
              </div>

              <div className="result-line">
                <div className="stat left">
                  {dialogEditMode && (
                    <input
                      type="number"
                      className="info"
                      value={results.player1BL}
                      style={{
                        backgroundColor: errors.includes('player1BL') ? '#fee5e5' : '#fff'
                      }}
                      onChange={(e: any) => {
                        updateResult("player1BL", e.target.value);
                      }}
                    />
                  )}
                  {!dialogEditMode && (
                    <div className="info">
                      {match.player1BL !== 0 && match.player1BL}
                    </div>
                  )}
                </div>
                <div className="delimiter"> BLeg </div>
                <div className="stat">
                  {dialogEditMode && (
                    <input
                      type="number"
                      className="info"
                      value={results.player2BL}
                      style={{
                        backgroundColor: errors.includes('player2BL') ? '#fee5e5' : '#fff'
                      }}
                      onChange={(e: any) => {
                        updateResult("player2BL", e.target.value);
                      }}
                    />
                  )}
                  {!dialogEditMode && (
                    <div className="info">
                      {match.player2BL !== 0 && match.player2BL}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                closeMatchDialog();
              }}
            >
              Close
            </Button>
            {!dialogEditMode && canEdit && (
              <Button
                variant="contained"
                color="info"
                onClick={() => {
                  setDialogEditMode(true);
                }}
              >
                Update Score
              </Button>
            )}
            {dialogEditMode && (
              <Button
                variant="contained"
                onClick={() => {
                  if (checkInputs()) {
                    updateMatchResult(round.round, match.number, {
                      score1: parseInt(results.score1) || 0,
                      score2: parseInt(results.score2) || 0,
                      player1180s: parseInt(results.player1180s) || 0,
                      player2180s: parseInt(results.player2180s) || 0,
                      player1HF: parseInt(results.player1HF) || 0,
                      player2HF: parseInt(results.player2HF) || 0,
                      player1BL: parseInt(results.player1BL) || 0,
                      player2BL: parseInt(results.player2BL) || 0,
                      player1avg: parseFloat(results.player1avg) || 0,
                      player2avg: parseFloat(results.player2avg) || 0,
                      player1140s: parseInt(results.player1140s) || 0,
                      player2140s: parseInt(results.player2140s) || 0,
                      player1100s: parseInt(results.player1100s) || 0,
                      player2100s: parseInt(results.player2100s) || 0,
                      finished:
                        (parseInt(results.score1) || 0) > 0 ||
                        (parseInt(results.score2) || 0) > 0,
                    });

                    closeMatchDialog();
                  }
                }}
              >
                Save
              </Button>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

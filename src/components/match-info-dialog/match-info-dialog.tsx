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
import { FirestoreRound, Match, TPlayersList } from "../../types";
import { updateMatchResult } from "../../firestore/competition";
import { ADM } from "../../core/constants";

type TMatchInfoProps = {
  round: FirestoreRound;
  playersMap: TPlayersList;
  dialogIsOpen: boolean;
  usersMap: { [key: string]: string };
  match: Match;
  uid: string;
  closeDialog: () => void;
};

type TResultsString = {
  score1: string;
  score2: string;
  player1180s: string;
  player2180s: string;
  player1HF: string;
  player2HF: string;
};

export const MatchInfoDialog = ({
  round,
  dialogIsOpen,
  match,
  closeDialog,
  playersMap,
  usersMap,
  uid,
}: TMatchInfoProps): ReactElement => {
  const [dialogEditMode, setDialogEditMode] = useState(false);
  const [results, setResults] = useState({
    score1: "",
    score2: "",
    player1180s: "",
    player2180s: "",
    player1HF: "",
    player2HF: "",
  } as TResultsString);

  useEffect(() => {
    results.score1 = match.score1?.toString() || "";
    results.score2 = match.score2?.toString() || "";
    results.player1180s = match.player1180s?.toString() || "";
    results.player2180s = match.player2180s?.toString() || "";
    results.player1HF = match.player1HF?.toString() || "";
    results.player2HF = match.player2HF?.toString() || "";
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
    });
  };

  const updateResult = (res: string, inputVal: string) => {
    let val = inputVal ? parseInt(inputVal as any) : 0;
    if (val < 0) {
      val = 0;
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
    if (["player1HF", "player2HF"].includes(res)) {
      if (val > 170) {
        val = 170;
      }
    }
    setResults({ ...results, ...{ [res]: val.toString() } });
  };

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
                  {playersMap[match.player1 || ""].name}
                </div>
                <div className="delimiter"></div>
                <div className="stat  name">
                  {playersMap[match.player2 || ""].name}
                </div>
              </div>
              <div className="result-line">
                <div className="stat left score">
                  {dialogEditMode && (
                    <input
                      type="number"
                      className="score-tab"
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
                      value={results.player1HF}
                      onChange={(e: any) => {
                        updateResult("player1HF", e.target.value);
                      }}
                    />
                  )}
                  {!dialogEditMode && (
                    <div className="info">{match.player1HF}</div>
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
                    <div className="info">{match.player2HF}</div>
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
            {!dialogEditMode &&
              (usersMap[uid] === match.player1 ||
                usersMap[uid] === match.player2 ||
                uid === ADM) && (
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
                  updateMatchResult(round.round, match.number, {
                    score1: parseInt(results.score1) || 0,
                    score2: parseInt(results.score2) || 0,
                    player1180s: parseInt(results.player1180s) || 0,
                    player2180s: parseInt(results.player2180s) || 0,
                    player1HF: parseInt(results.player1HF) || 0,
                    player2HF: parseInt(results.player2HF) || 0,
                    finished:
                      (parseInt(results.score1) || 0) > 0 ||
                      (parseInt(results.score2) || 0) > 0,
                  });

                  closeMatchDialog();
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

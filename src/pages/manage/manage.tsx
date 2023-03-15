import React, { ReactElement, useState } from "react";

import {
  addPlayer,
  deleteAllMatches,
  deleteAllRoundResults,
  setRoundStatus,
  startNewRound,
} from "../../firestore/competition";

import { CompetitionPlayers } from "../../components/competition-players/competition-players";
import { FirestoreRound, TPlayersList, TRoundPlayerList } from "../../types";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Box,
  LinearProgress,
  Typography,
  ListItemText,
  Card,
  CardHeader,
  List,
  ListItem,
  CardContent,
} from "@mui/material";
import "./manage.scss";

import { getPlayersStats, startRound } from "../../core/competition";

const confirmStartRound = (round: FirestoreRound) => {
  if (
    // eslint-disable-next-line no-restricted-globals
    confirm("Are you sure you want to delete all matches and restart round?")
  ) {
    if (
      // eslint-disable-next-line no-restricted-globals
      confirm("All progress will be lost!")
    ) {
      startRound(round).then(() => {
        deleteAllRoundResults(round.round);
      });
    }
  }
};

const onResetRound = (round: FirestoreRound) => {
  if (
    // eslint-disable-next-line no-restricted-globals
    confirm(
      "Are you sure you want to delete all matches and go in registering mode?"
    )
  ) {
    if (
      // eslint-disable-next-line no-restricted-globals
      confirm("All progress will be lost!")
    ) {
      deleteAllMatches(round.round);
      deleteAllRoundResults(round.round);
      setRoundStatus(round.round, "registering");
    }
  }
};

const onChangeRoundStatus = (round: FirestoreRound, status: string) => {
  if (
    // eslint-disable-next-line no-restricted-globals
    confirm(`Are you sure you want to set status to ${status}?`)
  ) {
    setRoundStatus(round.round, status);
  }
};

type TManagePage = {
  round: FirestoreRound;
  playersMap: TPlayersList;
  roundPlayers: TRoundPlayerList;
  showLoader: (visible: boolean) => void;
};

export const ManagePage = ({
  round,
  playersMap,
  roundPlayers,
  showLoader,
}: TManagePage): ReactElement => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handlePlayerNameChange = (event: any) => {
    setNewPlayerName(event.target.value);
  };

  return (
    <div className="manage">
      <div className="box">
        <div className="box-label">Competition</div>
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1 }}>
            <div className="info-line">
              <div className="def">Total players:</div>
              <div className="val">{Object.keys(playersMap).length}</div>
            </div>
          </div>

          <div className="actions">
            <Button
              variant="contained"
              color="warning"
              onClick={() => {
                setModalIsOpen(true);
              }}
            >
              Add player
            </Button>
          </div>
        </div>
      </div>
      <div className="box white">
        <div className="box-label">Round</div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ flex: 1 }}>
            <div className="info-line">
              <div className="def">Competition players:</div>
              <div className="val">{Object.keys(roundPlayers).length}</div>
            </div>
            <div className="info-line">
              <div className="def">Competition status:</div>
              <div className="val">{round.status || "none"}</div>
            </div>
          </div>

          <div className="actions">
            {(round?.status === "completed" || !round?.status) && (
              <Button
                variant="contained"
                color="success"
                sx={{
                  marginBottom: 1,
                }}
                onClick={() => {
                  if (
                    // eslint-disable-next-line no-restricted-globals
                    confirm(`Are you sure you want start a new round?`)
                  ) {
                    startNewRound().then(() => {
                      window.location.reload();
                    });
                  }
                }}
              >
                Create new Round
              </Button>
            )}
            {round.status === "registering" && (
              <Button
                variant="contained"
                color="success"
                sx={{
                  marginBottom: 1,
                }}
                onClick={() => {
                  if (
                    // eslint-disable-next-line no-restricted-globals
                    confirm(`Are you sure you want start this round?`)
                  ) {
                    startRound(round);
                  }
                }}
              >
                Start
              </Button>
            )}
            {round.status === "running" && (
              <Button
                variant="contained"
                color="success"
                sx={{
                  marginBottom: 1,
                }}
                onClick={() => {
                  onChangeRoundStatus(round, "completed");
                }}
              >
                Finish
              </Button>
            )}
            {round.status === "completed" && (
              <Button
                variant="contained"
                color="error"
                sx={{
                  marginBottom: 1,
                }}
                onClick={() => {
                  onChangeRoundStatus(round, "running");
                }}
              >
                Set to running
              </Button>
            )}
            {round.status === "running" && (
              <Button
                color="error"
                sx={{
                  marginBottom: 1,
                }}
                onClick={() => {
                  confirmStartRound(round);
                }}
              >
                Restart
              </Button>
            )}
            {round.status === "running" && (
              <Button
                color="error"
                sx={{
                  marginBottom: 1,
                }}
                onClick={() => {
                  onResetRound(round);
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {round.status === "registering" && (
        <div className="box white">
          <div className="box-label">Players</div>
          <CompetitionPlayers
            round={round}
            playersMap={playersMap}
            roundPlayers={roundPlayers}
          />
        </div>
      )}

      <Dialog open={modalIsOpen} onClose={closeModal} fullWidth={true}>
        <DialogTitle>Add player</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add a new player to the database.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Player name"
            type="email"
            fullWidth
            variant="outlined"
            value={newPlayerName}
            onChange={handlePlayerNameChange}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={closeModal}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              showLoader(true);
              setModalIsOpen(false);
              setNewPlayerName("");
              addPlayer(newPlayerName).then(() => {
                showLoader(false);
              });
            }}
          >
            Add player
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

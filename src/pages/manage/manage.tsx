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
} from "@mui/material";
import "./manage.scss";

import { startRound } from "../../core/competition";

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
      <div className="tools">
        <div className="stats">
          Total players: {Object.keys(playersMap).length} <br />
          Competition players: {Object.keys(roundPlayers).length}
          <br />
          Competition status: {round.status}
        </div>
        <div className="actions">
          <Button
            variant="contained"
            sx={{
              marginBottom: 1,
            }}
            onClick={() => {
              setModalIsOpen(true);
            }}
          >
            Add player
          </Button>
          {round.status === "registering" && (
            <Button
              variant="contained"
              color="success"
              sx={{
                marginLeft: 1,
                marginBottom: 1,
              }}
              onClick={() => {
                startRound(round);
              }}
            >
              Start competition
            </Button>
          )}
          {round.status === "running" && (
            <Button
              variant="contained"
              color="error"
              sx={{
                marginLeft: 1,
                marginBottom: 1,
              }}
              onClick={() => {
                if (
                  // eslint-disable-next-line no-restricted-globals
                  confirm(
                    "Are you sure you want to delete all matches and restart round?"
                  )
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
              }}
            >
              Restart competition
            </Button>
          )}
          {round.status === "running" && (
            <Button
              variant="contained"
              color="error"
              sx={{
                marginLeft: 1,
                marginBottom: 1,
              }}
              onClick={() => {
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
              }}
            >
              Reset competition
            </Button>
          )}
          {round.status === "running" && (
            <Button
              variant="contained"
              color="success"
              sx={{
                marginLeft: 1,
                marginBottom: 1,
              }}
              onClick={() => {
                if (
                  // eslint-disable-next-line no-restricted-globals
                  confirm("Are you sure you want to finish the competition?")
                ) {
                  setRoundStatus(round.round, "completed");
                }
              }}
            >
              Finish competition
            </Button>
          )}
          {round.status === "completed" && (
            <Button
              variant="contained"
              color="error"
              sx={{
                marginLeft: 1,
                marginBottom: 1,
              }}
              onClick={() => {
                if (
                  // eslint-disable-next-line no-restricted-globals
                  confirm("Are you sure you want set competition to running?")
                ) {
                  setRoundStatus(round.round, "running");
                }
              }}
            >
              Set to running
            </Button>
          )}
        </div>
      </div>

      {round.status === "registering" && (
        <CompetitionPlayers
          round={round}
          playersMap={playersMap}
          roundPlayers={roundPlayers}
        />
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

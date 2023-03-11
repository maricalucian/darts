import React, { ReactElement, useState } from "react";

import { addPlayer, startNewRound } from "../../firestore/competition";

import { CompetitionPlayers } from "../../components/competition-players/competition-players";
import { FirestoreRound, TPlayersList } from "../../types";
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
  roundPlayers: string[];
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
      <button
        onClick={() => {
          startNewRound();
        }}
      >
        Start New Round
      </button>
      <br />
      <br />
      <div className="tools">
        <div className="stats">
          Total players: {Object.keys(playersMap).length} <br />
          Competition players: {roundPlayers.length}
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
        </div>
      </div>

      <CompetitionPlayers
        round={round}
        playersMap={playersMap}
        roundPlayers={roundPlayers}
      />

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

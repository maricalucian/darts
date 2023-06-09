import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { FirestoreRound, TPlayersList, TRoundPlayerList } from "../../types";
import { Box } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import ForwardIcon from "@mui/icons-material/Forward";
import Grid from "@mui/material/Unstable_Grid2";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import "./competition-players.scss";
import {
  addPlayerToRound,
  removeRoundPlayer,
} from "../../firestore/competition";

type TCompetitionPlayersProps = {
  round: FirestoreRound;
  playersMap: TPlayersList;
  roundPlayers: TRoundPlayerList;
};

const getAvailablePlayersArray = (
  allPlayers: TPlayersList,
  selectedPlayers: TRoundPlayerList
): string[] => {
  const availablePlayers: string[] = [];
  Object.keys(allPlayers || []).forEach((id) => {
    if (!Object.keys(selectedPlayers || []).includes(id)) {
      availablePlayers.push(id);
    }
  });

  return availablePlayers;
};

export const CompetitionPlayers = ({
  round,
  playersMap,
  roundPlayers,
}: TCompetitionPlayersProps): ReactElement => {
  const [availabllePlayers, setAvailablePlayers] = useState([] as string[]);

  useEffect(() => {
    const availabllePlayers = getAvailablePlayersArray(
      playersMap,
      roundPlayers
    );
    availabllePlayers.sort((a, b) => {
      return playersMap[a].name.localeCompare(playersMap[b].name);
    });
    setAvailablePlayers(availabllePlayers);
  }, [playersMap, roundPlayers]);

  return (
    <div className="competition-players">
      <Box sx={{ flexGrow: 1 }} padding={1}>
        <Grid container spacing={0}>
          <Grid xs={12} sm={5} className="players-list rotate-icons">
            <div
              style={{
                textAlign: "center",
                fontWeight: "bold",
                padding: "12px 0 0",
              }}
            >
              Available players
            </div>
            <div className="list-container">
              <List>
                {availabllePlayers.map((playerId) => {
                  return (
                    <ListItem
                      key={playerId}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => {
                            addPlayerToRound(round.round, playerId);
                          }}
                        >
                          <ArrowCircleRightIcon />
                        </IconButton>
                      }
                      disablePadding
                    >
                      <ListItemButton>
                        <ListItemText primary={playersMap[playerId]?.name} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </div>
          </Grid>
          <Grid
            xs={12}
            sm={2}
            display="flex"
            flexGrow={1}
            textAlign="center"
            justifyContent="center"
            alignItems="center"
            className="rotate-icons"
          >
            <ForwardIcon fontSize="large" color="success" />
          </Grid>
          <Grid xs={12} sm={5} className="players-list">
            <div
              style={{
                textAlign: "center",
                fontWeight: "bold",
                padding: "12px 0 0",
              }}
            >
              Selected players
            </div>
            <div className="list-container">
              <List>
                {Object.keys(roundPlayers)
                  .sort((a, b) =>
                    playersMap[a].name.localeCompare(playersMap[b].name)
                  )
                  .map((playerId) => {
                    return (
                      <ListItem
                        key={playerId}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => {
                              removeRoundPlayer(round.round, playerId);
                            }}
                          >
                            <RemoveCircleIcon />
                          </IconButton>
                        }
                        disablePadding
                      >
                        <ListItemButton>
                          <ListItemText primary={playersMap[playerId]?.name} />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
              </List>
            </div>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

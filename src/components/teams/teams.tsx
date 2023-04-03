import React, { ReactElement, useEffect, useState } from "react";
import "./teams.scss";
import {
  FirestoreRound,
  TPlayersList,
  TRoundPlayerList,
  TTeams,
} from "../../types";
import {
  List,
  ListItem,
  IconButton,
  ListItemButton,
  ListItemText,
  Box,
} from "@mui/material";
import {
  createRoundTeam,
  disbandTeam,
  removeRoundPlayer,
} from "../../firestore/competition";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

type TTeamsProps = {
  round: FirestoreRound;
  playersMap: TPlayersList;
  roundPlayers: TRoundPlayerList;
  teams: TTeams;
};

const getAvailablePlayers = (
  teams: TTeams,
  playersMap: TPlayersList
): string[] => {
  const playersInTeams = Object.values(teams).reduce((acc, team) => {
    acc.push(team.p1);
    acc.push(team.p2);
    return acc;
  }, [] as string[]);
  const noTeamPlayers = [] as string[];

  Object.keys(playersMap).forEach((player) => {
    if (!playersInTeams.includes(player)) {
      noTeamPlayers.push(player);
    }
  });

  return noTeamPlayers;
};

export const Teams = ({
  round,
  playersMap,
  roundPlayers,
  teams,
}: TTeamsProps): ReactElement => {
  const [p1, setP1] = useState("");
  const [availablePlayers, setAvailablePlayers] = useState([] as string[]);

  useEffect(() => {
    setAvailablePlayers(getAvailablePlayers(teams, playersMap));
  }, [playersMap, teams]);

  let i = 1;

  return (
    <div className="teams">
      <Box
        sx={{ flexGrow: 1 }}
        padding={1}
        style={{
          border: "1px solid #e9e9e9",
          marginBottom: "12px",
        }}
      >
        <div className="list-title">Formed teams</div>
        <div className="teams-list-container">
          <List>
            {Object.keys(teams)
              .sort((a, b) =>
                playersMap[teams[a].p1].name.localeCompare(
                  playersMap[teams[b].p1].name
                )
              )
              .map((teamId) => {
                return (
                  <ListItem
                    key={teams[teamId].p1}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => {
                          disbandTeam(round.round, teamId);
                        }}
                      >
                        <RemoveCircleIcon />
                      </IconButton>
                    }
                    disablePadding
                  >
                    <ListItemButton>
                      <ListItemText
                        primary={`${i++}. ${
                          playersMap[teams[teamId].p1].name
                        } / ${playersMap[teams[teamId].p2].name}`}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
          </List>
        </div>
      </Box>
      <Box
        sx={{ flexGrow: 1 }}
        style={{ border: "1px solid #e9e9e9" }}
        padding={1}
      >
        <div className="list-title">Available players</div>
        <div className="list-container">
          <List>
            {availablePlayers
              .sort((a, b) =>
                playersMap[a].name.localeCompare(playersMap[b].name)
              )
              .map((playerId) => {
                return (
                  <ListItem
                    key={playerId}
                    className={`${playerId === p1 && "selected"}`}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => {
                          if (p1 && p1 !== playerId) {
                            createRoundTeam(round.round, p1, playerId);
                            setP1("");
                          } else {
                            setP1(playerId);
                          }
                        }}
                      >
                        {playerId === p1 && (
                          <CircularProgress
                            color="inherit"
                            style={{ width: "24px", height: "24px" }}
                          />
                        )}
                        {!p1 && <AddCircleIcon />}
                        {p1 && playerId !== p1 && <CheckCircleIcon />}
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
      </Box>
    </div>
  );
};

import React, { ReactElement, useEffect, useState } from "react";
import {
  Competition,
  TPlayersList,
  FirestoreRound,
  Match,
  TRoundResults,
  TRoundResult,
  TRoundPlayerList,
  TRoundPlayer,
} from "../../types";

import { ListItemText, List, ListItem, ListItemIcon } from "@mui/material";

import ListItemButton from "@mui/material/ListItemButton";
import IconButton from "@mui/material/IconButton";
import PaidIcon from "@mui/icons-material/Paid";

import "./home.scss";
import { prizeSturcture } from "../../core/competition";
import { HomeRunning } from "./home-running";
import { HomeRegistering } from "./home-registering";
import { setPlayerPaid } from "../../firestore/competition";

type THomePageProps = {
  competition: Competition;
  playersMap: TPlayersList;
  round: FirestoreRound;
  roundPlayers: TRoundPlayerList;
  popupMatchInfo: (round: number, match: Match) => void;
};

export const HomePage = ({
  round,
  competition,
  playersMap,
  popupMatchInfo,
  roundPlayers,
}: THomePageProps): ReactElement => {
  return (
    <div className="home">
      <div className="top">
        <div className={`status ${round.status}`}>{round.status}</div>
        <div className="total-players">
          {Object.keys(roundPlayers).length} players
        </div>
      </div>
      {round.status === "running" || round.status === "completed" && (
        <HomeRunning
          roundPlayers={roundPlayers}
          competition={competition}
          playersMap={playersMap}
          popupMatchInfo={popupMatchInfo}
          round={round}
        />
      )}
      {round.status === "registering" && (
        <HomeRegistering
          roundPlayers={roundPlayers}
          competition={competition}
          playersMap={playersMap}
          popupMatchInfo={popupMatchInfo}
          round={round}
        />
      )}
      <h3>Players</h3>
      <div className="players">
        <List>
          {Object.keys(roundPlayers)
            .sort((a, b) => {
              if ((roundPlayers[a]?.rank || 0) > (roundPlayers[b]?.rank || 0)) {
                return 1;
              } else if (
                (roundPlayers[a]?.rank || 0) < (roundPlayers[b]?.rank || 0)
              ) {
                return -1;
              } else {
                return 0;
              }
            })
            .map((playerId) => {
              return (
                <ListItem
                  key={playerId}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => {
                        if (
                          // eslint-disable-next-line no-restricted-globals
                          confirm(
                            `Set ${playersMap[playerId].name} to ${
                              roundPlayers[playerId].paid ? "NOT" : ""
                            } PAID?`
                          )
                        ) {
                          setPlayerPaid(
                            round.round,
                            playerId,
                            !roundPlayers[playerId].paid
                          );
                        }
                      }}
                    >
                      <PaidIcon
                        style={{
                          fill: roundPlayers[playerId].paid
                            ? "#48b35c"
                            : "#d0d0d0",
                        }}
                      />
                    </IconButton>
                  }
                  disablePadding
                >
                  <ListItemIcon className="rank">
                    {roundPlayers[playerId]?.rank || "-"}
                  </ListItemIcon>
                  <ListItemButton>
                    <ListItemText primary={playersMap[playerId].name} />
                  </ListItemButton>
                </ListItem>
              );
            })}
        </List>
      </div>
    </div>
  );
};

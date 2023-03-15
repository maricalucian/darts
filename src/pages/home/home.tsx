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
  funMode: boolean;
};

export const HomePage = ({
  round,
  competition,
  playersMap,
  popupMatchInfo,
  roundPlayers,
  funMode,
}: THomePageProps): ReactElement => {
  return (
    <div className="home">
      {!round?.round && (
        <div
          style={{ marginTop: "32px", textAlign: "center", fontWeight: "bold" }}
        >
          No game currently running
        </div>
      )}
      {round?.round && (
        <>
          <div className="top">
            <div className={`status ${round.status}`}>
              {funMode && `Friendly game ${round.status}`}
              {!funMode && `Round ${round.round} ${round.status}`}
            </div>
            <div className="total-players">
              {Object.keys(roundPlayers).length} players
            </div>
          </div>
          {(round.status === "running" || round.status === "completed") && (
            <HomeRunning
              roundPlayers={roundPlayers}
              competition={competition}
              playersMap={playersMap}
              popupMatchInfo={popupMatchInfo}
              round={round}
              funMode
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
          <div className="box white">
            <div className="box-label">Players</div>
            <div className="players">
              {Object.keys(roundPlayers)
                .sort((a, b) => {
                  if (
                    (roundPlayers[a]?.rank || 0) > (roundPlayers[b]?.rank || 0)
                  ) {
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
                    <div key={playerId} className="player-row">
                      <div className="rank">
                        {roundPlayers[playerId]?.rank || "-"}
                      </div>
                      <div className="player-name">
                        {playersMap[playerId].name}
                      </div>
                      <div className="player-points">
                        {roundPlayers[playerId]?.points && (
                          <>
                            <b> {roundPlayers[playerId]?.points}p </b>
                            <span className="points-info">
                              {"("}
                              {roundPlayers[playerId]?.basePoints} +{" "}
                              {roundPlayers[playerId]?.bonus}%{")"}
                            </span>
                          </>
                        )}
                      </div>
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
                              ? "#ff9f1e"
                              : "#ccc",
                          }}
                        />
                      </IconButton>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

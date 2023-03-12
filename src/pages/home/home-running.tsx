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
import {
  Box,
  LinearProgress,
  Typography,
  ListItemText,
  Card,
  List,
  ListItem,
  CardContent,
} from "@mui/material";
import { BLANK } from "../../core/constants";

import "./home.scss";
import { prizeSturcture } from "../../core/competition";

type THomeRunningProps = {
  competition: Competition;
  playersMap: TPlayersList;
  round: FirestoreRound;
  roundPlayers: TRoundPlayerList;
  popupMatchInfo: (round: number, match: Match) => void;
};

export const HomeRunning = ({
  round,
  competition,
  playersMap,
  popupMatchInfo,
  roundPlayers,
}: THomeRunningProps): ReactElement => {
  const [progress, setProgress] = useState(0);
  const [hf, setHf] = useState(0);
  const [one80s, setOne80s] = useState(0);
  const [totalOne80s, setTotalOne80s] = useState(0);
  const [rankings, setRankings] = useState(
    [] as { rank: number; name: string }[]
  );
  const [prizes, setPrizes] = useState([] as { rank: number; prize: number }[]);

  useEffect(() => {
    let totalMatches = 0;
    let finishedMatches = 0;
    Object.values(competition).forEach((match: Match) => {
      if (match.player1 !== BLANK && match.player2 !== BLANK) {
        if (match.finished) {
          finishedMatches++;
        }
        totalMatches++;
      }
    });

    if (totalMatches > 0) {
      setProgress(Math.round((100 * finishedMatches) / totalMatches));
    }
  }, [competition]);

  useEffect(() => {
    if (Object.keys(roundPlayers).length < 3) {
      return;
    }
    const players = Object.keys(roundPlayers).length;
    let prizesMap = {};
    Object.keys(prizeSturcture).forEach((k) => {
      if (parseInt(k) < players) {
        // @ts-ignore
        prizesMap = prizeSturcture[k];
      }
    });

    const total = players * 10;

    let prize: any = [];
    Object.keys(prizesMap).forEach((k) => {
      prize.push({
        rank: k,
        // @ts-ignore
        prize: Math.round((prizesMap[k] * 100) / total),
      });
    });

    setPrizes(prize);
  }, [roundPlayers]);

  useEffect(() => {
    if (
      Object.keys(roundPlayers || []).length > 0 &&
      Object.keys(playersMap || []).length > 0
    ) {
      let hf = 0;
      let one80s = 0;
      let total180 = 0;
      Object.values(roundPlayers).forEach((player) => {
        if (player?.hf && player?.hf  > hf) {
          hf = player.hf;
        }
        if (player?.one80s && player?.one80s > one80s) {
          one80s = player.one80s;
        }

        total180 += player.one80s || 0;

      });
      setHf(hf);
      setOne80s(one80s);
      setTotalOne80s(total180);
    }
  }, [roundPlayers, playersMap]);

  return (
    <>
      <h3>Next matches</h3>
      <div className="matches">
        {Object.values(competition)
          .filter((match) => {
            const hasBlanks =
              match.player1 === BLANK || match.player2 === BLANK;
            if (
              match.player1 &&
              match.player2 &&
              !hasBlanks &&
              !match.finished
            ) {
              return true;
            }
            return false;
          })
          .map((match) => (
            <div
              className="match next"
              onClick={() => {
                popupMatchInfo(round.round, match);
              }}
              key={match.number}
            >
              <div className="match-no">{match.number}</div>
              <div className="p1">{playersMap[match.player1 || ""].name}</div>
              <div className="divider">vs</div>
              <div className="p2">{playersMap[match.player2 || ""].name}</div>
            </div>
          ))}
      </div>
      <h3>Competition info</h3>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ minWidth: 35 }}>
          <Typography
            variant="body2"
            color="text.secondary"
          >{`${progress}%`}</Typography>
        </Box>
        <Box sx={{ width: "100%" }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      </Box>
      <div className="competition-info">
        <div className="stats">
          <div className="stat">
            <div className="stat-name">Total players</div>
            <div className="stat-value">{Object.keys(roundPlayers).length}</div>
          </div>
          <div className="stat">
            <div className="stat-name">Most 180s</div>
            <div className="stat-value">{one80s}</div>
          </div>
          <div className="stat">
            <div className="stat-name">Total 180s</div>
            <div className="stat-value">{totalOne80s}</div>
          </div>
          <div className="stat">
            <div className="stat-name">Highest finish</div>
            <div className="stat-value">{hf}</div>
          </div>
        </div>
        <div className="prizes">
          <Card>
            <CardContent>
              Prizes
              <List>
                {prizes.map((prize, i) => {
                  return (
                    <ListItem key={i} disablePadding>
                      <ListItemText
                        primary={`${prize.rank}. ${prize.prize} RON`}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

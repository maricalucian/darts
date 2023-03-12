import React, { ReactElement, useEffect, useState } from "react";
import {
  Competition,
  TPlayersList,
  FirestoreRound,
  Match,
  TRoundResults,
  TRoundResult,
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

type THomePageProps = {
  competition: Competition;
  playersMap: TPlayersList;
  round: FirestoreRound;
  roundPlayers: string[];
  results: TRoundResults;
  popupMatchInfo: (round: number, match: Match) => void;
};

export const HomeRunning = ({
  round,
  competition,
  playersMap,
  popupMatchInfo,
  roundPlayers,
  results,
}: THomePageProps): ReactElement => {
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
    if (roundPlayers.length < 3) {
      return;
    }
    const players = roundPlayers.length;
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
      Object.keys(results || []).length > 0 &&
      Object.keys(playersMap || []).length > 0
    ) {
      let hf = 0;
      let one80s = 0;
      let total180 = 0;
      let rankings: { rank: number; name: string }[] = [];
      Object.keys(results).forEach((k) => {
        if (results[k]?.hf > hf) {
          hf = results[k].hf;
        }
        if (results[k]?.one80s > one80s) {
          one80s = results[k].one80s;
        }

        total180 += results[k].one80s || 0;

        if (results[k]?.rank) {
          rankings.push({
            rank: results[k]?.rank,
            name: playersMap[k]?.name,
          });
        }
      });

      rankings.sort((a, b) => {
        if (a.rank < b.rank) {
          return -1;
        } else if (a.rank > b.rank) {
          return 1;
        } else {
          return 0;
        }
      });

      setHf(hf);
      setOne80s(one80s);
      setRankings(rankings);
      setTotalOne80s(total180);
    }
  }, [results, playersMap]);

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
            <div className="stat-value">{roundPlayers.length}</div>
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
      <h3>Results</h3>
      <div className="rankings">
        <List>
          {rankings.map((ranking, i) => {
            return (
              <ListItem key={i} disablePadding>
                <ListItemText primary={`${ranking.rank}. ${ranking.name}`} />
              </ListItem>
            );
          })}
        </List>
      </div>
    </>
  );
};

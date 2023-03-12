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

import ListItemButton from "@mui/material/ListItemButton";
import IconButton from "@mui/material/IconButton";
import PaidIcon from '@mui/icons-material/Paid';
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

export const HomeRegistering = ({
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
      <h3>Registered players</h3>
      <div className="players">
        <List>
          {roundPlayers
            .map((playerId) => {
              return (
                <ListItem
                  key={playerId}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => {
                        // setPlayerPaid(round.round, playerId);
                      }}
                    >
                      <PaidIcon style={{fill: '#d0d0d0'}} />
                    </IconButton>
                  }
                  disablePadding
                >
                  <ListItemButton>
                    <ListItemText primary={playersMap[playerId].name} />
                  </ListItemButton>
                </ListItem>
              );
            })}
        </List>
      </div>
    </>
  );
};

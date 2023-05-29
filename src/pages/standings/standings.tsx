import { ReactElement, useEffect, useState } from "react";
import {
  Competition,
  TPlayersList,
  FirestoreRound,
  Match,
  TRoundPlayerList,
  TStandings,
} from "../../types";
import "./standings.scss";
import { getCompetition, getStandings } from "../../firestore/competition";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { ListItemText, Card, List, ListItem, CardContent } from "@mui/material";

type TStandingsPageProps = {
  competition: Competition;
  playersMap: TPlayersList;
  round: FirestoreRound;
  roundPlayers: TRoundPlayerList;
  popupMatchInfo: (round: number, match: Match) => void;
};

const bonusStructure = {
  1: 0,
  2: 10,
  3: 20,
  5: 30,
  9: 40,
  17: 60,
};

export const getBonusForRank = (rank: number) => {
  let bonus = 0;
  Object.entries(bonusStructure).find(([i, b]: any) => {
    if (i > rank) {
      return true;
    } else {
      bonus = b;
    }
  }) as any;

  return bonus;
};

const columns: GridColDef[] = [
  { field: "rank", headerName: "", width: 30 },
  { field: "bonus", headerName: "B", width: 30 },
  { field: "name", headerName: "Name", width: 150, flex: 1 },
  { field: "points", headerName: "Pts", width: 70, flex: 0.3 },
  { field: "one80s", headerName: "180", width: 40 },
  { field: "hf", headerName: "HF", width: 40 },
];

export const StandingsPage = ({
  round,
  competition,
  playersMap,
  popupMatchInfo,
  roundPlayers,
}: TStandingsPageProps): ReactElement => {
  const [records, setRecords] = useState({} as any);
  const [standings, setStandings] = useState([] as any);
  const [entries, setEntries] = useState(0);

  useEffect(() => {
    if (Object.keys(playersMap).length < 1) {
      return;
    }
    getCompetition("duminica23").then((data) => {
      setRecords(data.records || {});
      setEntries(data.totalEntries || 0);
    });
    getStandings().then((data: TStandings) => {
      setStandings(
        Object.keys(data).map((playerId) => {
          return {
            id: playerId,
            name: playersMap[playerId].name,
            points: data[playerId].points,
            one80s: data[playerId].one80s,
            hf: data[playerId].hf,
            rank: data[playerId].rank,
            bonus: `${getBonusForRank(data[playerId].rank || 99)}%`,
          };
        })
      );
    });
  }, [playersMap]);

  return (
    <div className="standings">
      <div className="box">
        <div className="box-label">Tournament info</div>
        <div className="stats">
          <div className="info-line-big">
            <div className="val">{records?.one80s}</div>
            <div className="def">
              180's by{" "}
              {(records.one80sPlayers || []).map((player: any) => {
                return playersMap?.[player.player]?.name + ' ';
              })}
            </div>
          </div>
          <div className="info-line-big">
            <div className="val">{records?.hf}</div>
            <div className="def">
              HF by{" "}
              {(records.hfPlayers || []).map((player: any) => {
                return `${playersMap?.[player.player]?.name} (round ${
                  player.round
                })`;
              })}
            </div>
          </div>
          <div className="info-line-big">
            <div className="val">{entries * 5}</div>
            <div className="def">RON masters pool</div>
          </div>
        </div>
      </div>
      <div className="box white">
        <div className="box-label">Standings</div>
        <div className="players">
          <table>
            <tbody>
              <tr className="table-header">
                <td className="rank">#</td>
                <td className="player-bonus">B</td>
                <td className="player-name">Name</td>
                <td style={{ textAlign: "center" }}>P</td>
                <td className="player-one80s">180</td>
                <td className="player-hf">HF</td>
              </tr>
              {standings
                .sort((a: any, b: any) => {
                  if ((a?.rank || 0) > (b?.rank || 0)) {
                    return 1;
                  } else if ((a?.rank || 0) < (b?.rank || 0)) {
                    return -1;
                  } else {
                    return 0;
                  }
                })
                .map((player: any) => {
                  return (
                    <tr key={player.id} className="player-row">
                      <td className="rank">{player?.rank || "-"}</td>
                      <td className="player-bonus">{player.bonus}</td>
                      <td className="player-name">
                        {playersMap[player.id].name}
                      </td>
                      <td className="player-points">{player.points}</td>
                      <td className="player-one80s">
                        {player.one80s ? player.one80s : ""}
                      </td>
                      <td className="player-hf">
                        {player.hf ? player.hf : ""}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

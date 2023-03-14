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

  useEffect(() => {
    if (Object.keys(playersMap).length < 1) {
      return;
    }
    getCompetition().then((data) => {
      setRecords(data.records || {});
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
      <h3>Standings</h3>
      <div className="records">
        <div className="one80s">
          {records?.one80s} 180s{" "}
          {(records.one80sPlayers || []).map((player: any) => {
            return playersMap?.[player.player]?.name;
          })}
        </div>
        <div className="hf">
          {records?.hf} HF{" "}
          {(records.hfPlayers || []).map((player: any) => {
            return `${playersMap?.[player.player]?.name} (round ${
              player.round
            })`;
          })}
        </div>
      </div>
      <div style={{ width: "100%", marginBottom: "24px" }}>
        {standings.length > 0 && (
          <DataGrid
            rows={standings}
            columns={columns}
            autoHeight
            hideFooter={true}
            initialState={{
              sorting: {
                sortModel: [{ field: "points", sort: "desc" }],
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

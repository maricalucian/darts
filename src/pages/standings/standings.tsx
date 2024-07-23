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
import {
  getCompetition,
  getStandings,
  getStandingsAfterRound,
} from "../../firestore/competition";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import {
  ListItemText,
  Card,
  List,
  ListItem,
  CardContent,
  MenuItem,
  Select,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { storage } from "../../core/firebase";
import { ref, getDownloadURL } from "firebase/storage";

type TStandingsPageProps = {
  competition: Competition;
  playersMap: TPlayersList;
  round: FirestoreRound;
  roundPlayers: TRoundPlayerList;
  popupMatchInfo: (round: number, match: Match) => void;
  currendRoundIndex: number;
  compId: string;
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

const Photo = ({ uid }: any) => {
  const [image, setImage] = useState("");
  useEffect(() => {
    if (!uid) {
      return;
    }
    const storageRef = ref(storage, `images/${uid}`);

    getDownloadURL(storageRef)
      .then((res) => {
        setImage(res);
      })
      .catch((e) => {
        setImage("/player.jpeg");
      });
  }, [uid]);
  if (!image) {
    return <></>;
  }
  return (
    <img
      src={image}
      style={{
        borderRadius: "50%",
        width: "38px",
        aspectRatio: 1,
        objectFit: "cover",
        position: "absolute",
        opacity: 1,
        right: 0,
        top: 0,
      }}
    />
  );
};

export const StandingsPage = ({
  round,
  competition,
  playersMap,
  popupMatchInfo,
  roundPlayers,
  currendRoundIndex,
  compId,
}: TStandingsPageProps): ReactElement => {
  const [records, setRecords] = useState({} as any);
  const [standings, setStandings] = useState([] as any);
  const [entries, setEntries] = useState(0);
  const [selectOptions, setSelectOptions] = useState([] as any);
  const [selectedRound, setSelectedRound] = useState(currendRoundIndex);
  const navigate = useNavigate();

  useEffect(() => {
    const selectOptions = [];
    let max = currendRoundIndex;
    if (round.status !== "completed" && max > 1) {
      max = max - 1;
    }
    for (let i = 1; i <= max; i++) {
      selectOptions.push(i);
    }
    setSelectedRound(max);
    setSelectOptions(selectOptions);
  }, [currendRoundIndex]);

  useEffect(() => {
    if (Object.keys(playersMap).length < 1) {
      return;
    }
    getCompetition(compId).then((data) => {
      setRecords(data.records || {});
      setEntries(data.totalEntries || 0);
    });
    getStandings(compId).then((data: TStandings) => {
      const stangings = Object.keys(data).map((playerId) => {
        return {
          id: playerId,
          name: playersMap[playerId].name,
          points: data[playerId].points,
          one80s: data[playerId].one80s,
          hf: data[playerId].hf,
          rank: data[playerId].rank,
          bonus: `${getBonusForRank(data[playerId].rank || 99)}%`,
        };
      });
      setStandings(
        stangings.sort((a: any, b: any) => {
          if ((a?.rank || 0) > (b?.rank || 0)) {
            return 1;
          } else if ((a?.rank || 0) < (b?.rank || 0)) {
            return -1;
          } else {
            return 0;
          }
        })
      );
    });
  }, [playersMap, compId]);

  const selectRound = (round: any) => {
    setSelectedRound(round);
    getStandingsAfterRound(compId, round).then((data: TStandings) => {
      const stangings = Object.keys(data).map((playerId) => {
        return {
          id: playerId,
          name: playersMap[playerId].name,
          points: data[playerId].points,
          one80s: data[playerId].one80s,
          hf: data[playerId].hf,
          rank: data[playerId].rank,
          bonus: `${getBonusForRank(data[playerId].rank || 99)}%`,
        };
      });
      setStandings(
        stangings.sort((a: any, b: any) => {
          if ((a?.rank || 0) > (b?.rank || 0)) {
            return 1;
          } else if ((a?.rank || 0) < (b?.rank || 0)) {
            return -1;
          } else {
            return 0;
          }
        })
      );
    });
  };

  return (
    <div className="standings">
      <div className="box">
        <div className="box-label">
          <div>Tournament info</div>
        </div>
        <div className="stats">
          <div className="info-line-big">
            <div className="val">{standings[0]?.points}</div>
            <div className="def">
              Leader {playersMap[standings[0]?.id]?.name}
            </div>

            <Photo uid={standings[0]?.id} />
          </div>
          <div className="info-line-big">
            <div className="val">{records?.one80s}</div>
            <div className="def">
              180's by{" "}
              {(records.one80sPlayers || []).map((player: any) => {
                return playersMap?.[player.player]?.name + " ";
              })}
            </div>
            {records.one80sPlayers?.[0] && (
              <Photo uid={records?.one80sPlayers[0]?.player} />
            )}
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
              {records.hfPlayers?.[0] && (
                <Photo uid={records?.hfPlayers[0]?.player} />
              )}
            </div>
          </div>
          <div className="info-line-big">
            <div className="val">{entries * 10}</div>
            <div className="def">RON masters pool</div>
          </div>
        </div>
      </div>
      <div className="box white">
        <div className="box-label">
          <div>Standings</div>
          <div className="round-select">
            <Select
              id="demo-simple-select"
              value={selectedRound}
              variant="outlined"
              // defaultValue=""
              onChange={(e) => {
                selectRound(e.target.value);
              }}
              sx={{
                // backgroundColor: "#1976d2",
                // color: "#fff",
                // fontWeight: "bold",
                height: "28px",
                borderRadius: "8px",
                outline: "none",
                //@ts-ignore
                // "& .MuiSvgIcon-root": {
                //   fill: "#fff",
                // },
              }}
            >
              {selectOptions.map((option: any) => {
                return (
                  <MenuItem key={option} value={option}>
                    AFTER ROUND {option}
                  </MenuItem>
                );
              })}
            </Select>
          </div>
        </div>
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
                // .sort((a: any, b: any) => {
                //   if ((a?.rank || 0) > (b?.rank || 0)) {
                //     return 1;
                //   } else if ((a?.rank || 0) < (b?.rank || 0)) {
                //     return -1;
                //   } else {
                //     return 0;
                //   }
                // })
                .map((player: any) => {
                  return (
                    <tr
                      key={player.id}
                      className="player-row"
                      onClick={() => {
                        navigate(`/player/${player.id}`);
                      }}
                    >
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
                        {player.hf && player.hf >= 100 ? player.hf : ""}
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

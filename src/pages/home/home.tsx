import {
  JSXElementConstructor,
  ReactElement,
  ReactFragment,
  useEffect,
  useState,
} from "react";
import {
  Competition,
  TPlayersList,
  FirestoreRound,
  Match,
  TRoundPlayerList,
  TTeams,
  AppUser,
} from "../../types";

import IconButton from "@mui/material/IconButton";
import PaidIcon from "@mui/icons-material/Paid";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import "./home.scss";
import { HomeRunning } from "./home-running";
import {
  getRound,
  getRoundAndPlayers,
  setPlayerPaid,
} from "../../firestore/competition";
import { ADM, API_ENDPOINT } from "../../core/constants";
import { Button, MenuItem, Select } from "@mui/material";
import { funMode } from "../../core/utils";
import { useNavigate } from "react-router-dom";

type THomePageProps = {
  competition: Competition;
  playersMap: TPlayersList;
  round: FirestoreRound;
  roundPlayers: TRoundPlayerList;
  popupMatchInfo: (round: number, match: Match) => void;
  teams: TTeams;
  user: AppUser;
  compId: string;
  currendRoundIndex: number;
};

export const getPlayerNameLong = (
  round: FirestoreRound,
  playersMap: TPlayersList,
  teams: TTeams,
  playerId: string
): string => {
  if (round.type === "teams") {
    return `${playersMap[playerId]?.name} / ${
      playersMap[teams[playerId]?.p2]?.name
    }`;
  }

  return playersMap[playerId].name;
};

export const HomePage = ({
  round,
  competition,
  playersMap,
  popupMatchInfo,
  roundPlayers,
  teams,
  user,
  compId,
  currendRoundIndex,
}: THomePageProps): ReactElement => {
  const [displayRound, setDisplayRound] = useState(round);
  const [displayPlayers, setDisplayPlayers] = useState(roundPlayers);
  const [selectOptions, setSelectOptions] = useState([] as any);
  const navigate = useNavigate();

  useEffect(() => {
    const selectOptions = [];
    for (let i = 1; i <= currendRoundIndex; i++) {
      selectOptions.push(i);
    }
    setSelectOptions(selectOptions);
  }, [currendRoundIndex]);

  useEffect(() => {
    if (
      !displayRound.round ||
      //@ts-ignore
      currendRoundIndex === parseInt(displayRound.round, 10)
    ) {
      setDisplayRound(round);
    }
  }, [currendRoundIndex, displayRound.round, round]);

  useEffect(() => {
    if (
      !displayRound.round ||
      //@ts-ignore
      currendRoundIndex === parseInt(displayRound.round, 10)
    ) {
      setDisplayPlayers(roundPlayers);
    }
  }, [currendRoundIndex, displayRound.round, round.round, roundPlayers]);

  const selectRound = (round: any) => {
    if (round === currendRoundIndex) {
      setDisplayRound(round);
      setDisplayPlayers(roundPlayers);
    } else {
      getRoundAndPlayers(round).then((data) => {
        setDisplayRound(data[0]);
        setDisplayPlayers(data[1]);
      });
    }
  };

  return (
    <div className="home">
      {!displayRound?.round && (
        <div
          style={{ marginTop: "32px", textAlign: "center", fontWeight: "bold" }}
        >
          No game currently running
        </div>
      )}
      {displayRound?.round && (
        <>
          <div className="top">
            <div style={{ display: "flex" }}>
              {funMode(compId) && (
                <div className={`status ${displayRound.status}`}>
                  Friendly game {displayRound.status}
                </div>
              )}
              {!funMode(compId) && selectOptions.length > 0 && (
                <>
                  <Select
                    id="demo-simple-select"
                    value={displayRound.round || ""}
                    variant="outlined"
                    // defaultValue=""
                    onChange={(e) => {
                      selectRound(e.target.value);
                    }}
                    sx={{
                      backgroundColor: "#1976d2",
                      color: "#fff",
                      fontWeight: "bold",
                      height: "36px",
                      borderRadius: "8px",
                      //@ts-ignore
                      "& .MuiSvgIcon-root": {
                        fill: "#fff",
                      },
                    }}
                  >
                    {selectOptions.map((option: any) => {
                      return (
                        <MenuItem key={option} value={option}>
                          ROUND {option}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  <div
                    className={`status ${displayRound.status}`}
                    style={{ marginLeft: "4px" }}
                  >
                    {displayRound.status}
                  </div>
                </>
              )}
            </div>
            {/* <div style={{ display: "flex" }}>
              <div className={`status ${displayRound.status}`}>
                {funMode && `Friendly game ${displayRound.status}`}
                {!funMode &&
                  `Round ${displayRound.round} ${displayRound.status}`}
              </div>
              {!funMode && (
                <div>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{
                      borderRadius: "8px",
                      marginLeft: "4px",
                      // marginBottom: "2px",
                    }}
                  >
                    <ArrowDropDownIcon />
                  </Button>
                </div>
              )}
            </div> */}
            <div className="total-players">
              {Object.keys(roundPlayers).length}{" "}
              {displayRound.type === "teams" ? "teams" : "players"}
            </div>
          </div>
          {user.user?.uid === ADM && displayRound.status === "completed" && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <Button
                variant="contained"
                color="success"
                style={{
                  width: "146px",
                  height: "26px",
                  marginLeft: "4px",
                  marginBottom: "8px",
                }}
                onClick={() => {
                  user.user &&
                    user.user
                      .getIdToken()
                      .then(function (idToken) {
                        fetch(
                          `${API_ENDPOINT}/manualProcess?round=${displayRound.round}`,
                          {
                            headers: {
                              Authorization: `Token ${idToken}`,
                            },
                          }
                        );
                      })
                      .catch(function (error) {
                        console.log("error");
                      });
                }}
              >
                Crunch again
              </Button>
            </div>
          )}
          {(displayRound.status === "running" ||
            displayRound.status === "completed") && (
            <HomeRunning
              roundPlayers={displayPlayers}
              competition={competition}
              playersMap={playersMap}
              popupMatchInfo={popupMatchInfo}
              round={displayRound}
              teams={teams}
              compId={compId}
            />
          )}
          <div className="box white">
            <div className="box-label">
              {displayRound.type === "teams" ? "Teams" : "Players"}
            </div>
            <div className="players">
              {Object.keys(displayPlayers)
                .sort((a, b) => {
                  if (displayPlayers[a]?.rank || displayPlayers[b]?.rank) {
                    if (
                      (displayPlayers[a]?.rank || 0) >
                      (displayPlayers[b]?.rank || 0)
                    ) {
                      return 1;
                    } else if (
                      (displayPlayers[a]?.rank || 0) <
                      (displayPlayers[b]?.rank || 0)
                    ) {
                      return -1;
                    } else {
                      return 0;
                    }
                  }
                  return playersMap[a].name.localeCompare(playersMap[b].name);
                })
                .map((playerId) => {
                  return (
                    <div
                      key={playerId}
                      className="player-row"
                      onClick={() => {
                        navigate(`/player/${playerId}`);
                      }}
                    >
                      <div className="rank">
                        {displayPlayers[playerId]?.rank || "-"}
                      </div>
                      <div className="player-name">
                        {getPlayerNameLong(
                          displayRound,
                          playersMap,
                          teams,
                          playerId
                        )}
                      </div>
                      <div className="player-points">
                        {displayPlayers[playerId]?.points && (
                          <>
                            <b> {displayPlayers[playerId]?.points}p </b>
                            <span className="points-info">
                              {"("}
                              {displayPlayers[playerId]?.basePoints} +{" "}
                              {displayPlayers[playerId]?.bonus}%{")"}
                            </span>
                          </>
                        )}
                      </div>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            // eslint-disable-next-line no-restricted-globals
                            confirm(
                              `Set ${playersMap[playerId].name} to ${
                                displayPlayers[playerId].paid ? "NOT" : ""
                              } PAID?`
                            )
                          ) {
                            setPlayerPaid(
                              displayRound.round,
                              playerId,
                              !displayPlayers[playerId].paid
                            );
                          }
                        }}
                      >
                        <PaidIcon
                          style={{
                            fill: displayPlayers[playerId].paid
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

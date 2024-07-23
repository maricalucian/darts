import { ReactElement, useEffect, useState } from "react";
import {
  Competition,
  TPlayersList,
  FirestoreRound,
  Match,
  TRoundPlayerList,
  TTeams,
} from "../../types";
import { BLANK } from "../../core/constants";

import "./home.scss";
import { hfPrizeStructure, prizeSturcture } from "../../core/competition";
import { funMode } from "../../core/utils";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../../core/firebase";

export const getPlayerNameGame = (
  round: FirestoreRound,
  playersMap: TPlayersList,
  teams: TTeams,
  playerId: string
): ReactElement | string => {
  if (round.type === "teams") {
    return (
      <div>
        <div>{playersMap[playerId].name}</div>
        <div>{playersMap[teams[playerId].p2].name}</div>
      </div>
    );
  }

  return playersMap[playerId].name;
};

type THomeRunningProps = {
  competition: Competition;
  playersMap: TPlayersList;
  round: FirestoreRound;
  roundPlayers: TRoundPlayerList;
  popupMatchInfo: (round: number, match: Match) => void;
  compId: string;
  teams: TTeams;
};

export const getPrizes = (
  totalPlayers: number,
  fee: number,
  places: number = 0
) => {
  let prizesMap = {};
  let hfPrize = 0;
  //@ts-ignore
  if (!places || Object.keys(prizeSturcture[places] || {}) < 1) {
    Object.keys(prizeSturcture).forEach((k) => {
      if (parseInt(k) < totalPlayers) {
        // @ts-ignore
        prizesMap = prizeSturcture[k];
        // @ts-ignore
        hfPrize = hfPrizeStructure[k];
      }
    });
  } else {
    //@ts-ignore
    prizesMap = prizeSturcture[places];
    //@ts-ignore
    hfPrize = hfPrizeStructure[places];
  }

  const total = totalPlayers * fee;

  let prize: any = [];
  Object.keys(prizesMap).forEach((k) => {
    prize.push({
      rank: k,
      // @ts-ignore
      prize: Math.round(total * (prizesMap[k] / 100)),
    });
  });

  prize.push({
    rank: "HF",
    prize: Math.round(total * (hfPrize / 100)),
  });

  return prize;
};

const Photo = ({ uid }: any) => {
  const [image, setImage] = useState("/player.jpeg");
  useEffect(() => {
    const storageRef = ref(storage, `images/${uid}`);

    getDownloadURL(storageRef)
      .then((res) => {
        setImage(res);
      })
      .catch((e) => {
        setImage("/player.jpeg");
      });
  }, [uid]);
  return (
    <img
      src={image}
      style={{
        borderRadius: "50%",
        width: "36px",
        aspectRatio: 1,
        objectFit: "cover",
        opacity: 0.6,
      }}
    />
  );
};

export const HomeRunning = ({
  round,
  competition,
  playersMap,
  popupMatchInfo,
  roundPlayers,
  compId,
  teams,
}: THomeRunningProps): ReactElement => {
  const [progress, setProgress] = useState(0);
  const [hf, setHf] = useState(0);
  const [hfPlayer, setHfPlayer] = useState("");
  const [one80s, setOne80s] = useState(0);
  const [totalOne80s, setTotalOne80s] = useState(0);
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
    const prize = getPrizes(players, round?.fee || 10, round.paid);
    // let prizesMap = {};
    // Object.keys(prizeSturcture).forEach((k) => {
    //   if (parseInt(k) < players) {
    //     // @ts-ignore
    //     prizesMap = prizeSturcture[k];
    //   }
    // });

    // const total = players * 10;

    // let prize: any = [];
    // Object.keys(prizesMap).forEach((k) => {
    //   prize.push({
    //     rank: k,
    //     // @ts-ignore
    //     prize: Math.round(total * (prizesMap[k] / 100)),
    //   });
    // });

    setPrizes(prize);
  }, [roundPlayers]);

  useEffect(() => {
    if (
      Object.keys(roundPlayers || []).length > 0 &&
      Object.keys(playersMap || []).length > 0
    ) {
      let hf = 0;
      let hfPlayer = "";
      let one80s = 0;
      let total180 = 0;
      Object.keys(roundPlayers).forEach((uid) => {
        const player = roundPlayers[uid];
        if (player?.hf && player?.hf >= hf && player?.hf > 1) {
          if (player?.hf == hf) {
            hf = player.hf;
            hfPlayer = hfPlayer + " " + playersMap[uid].name;
          } else {
            hf = player.hf;
            hfPlayer = playersMap[uid].name;
          }
        }
        if (player?.one80s && player?.one80s > one80s) {
          one80s = player.one80s;
        }

        total180 += player.one80s || 0;
      });
      setHf(hf);
      setHfPlayer(hfPlayer);
      setOne80s(one80s);
      setTotalOne80s(total180);
    }
  }, [roundPlayers, playersMap]);

  const nextGames =
    round.status === "running"
      ? Object.values(competition).filter((match) => {
          const hasBlanks = match.player1 === BLANK || match.player2 === BLANK;
          if (match.player1 && match.player2 && !hasBlanks && !match.finished) {
            return true;
          }
          return false;
        })
      : [];

  return (
    <>
      {round.status === "running" && nextGames.length > 0 && (
        <>
          <div className="box">
            <div className="box-label">Next games</div>
            <div className="home-matches">
              {nextGames.map((match) => (
                <div
                  className="match-info next"
                  onClick={() => {
                    popupMatchInfo(round.round, match);
                  }}
                  key={match.number}
                >
                  <div className="match-no">{match.number}</div>
                  {/* <div
                    style={{
                      position: "absolute",
                      top: "6px",
                      left: "10px",
                    }}
                  >
                    <Photo uid={match.player1} />
                  </div> */}
                  <div className="p1">
                    {getPlayerNameGame(
                      round,
                      playersMap,
                      teams,
                      match.player1 || ""
                    )}
                  </div>
                  <div className="divider">vs</div>
                  <div className="p2">
                    {getPlayerNameGame(
                      round,
                      playersMap,
                      teams,
                      match.player2 || ""
                    )}
                  </div>
                  {/* <div
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "6px",
                    }}
                  >
                    <Photo uid={match.player2} />
                  </div> */}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="box">
        <div className="box-label">
          {funMode(compId) && `Game info`}
          {!funMode(compId) && `Round ${round.round} info`}
        </div>
        <div className="box-content competition-info">
          <div className="stats">
            <div className="info-line-big">
              <div className="val">{Object.keys(roundPlayers).length}</div>
              <div className="def">
                {round.type === "teams" ? "teams" : "players"}
              </div>
            </div>
            <div className="info-line-big">
              <div className="val">{one80s}</div>
              <div className="def">
                180s by one {round.type === "teams" ? "team" : "player"}
              </div>
            </div>
            <div className="info-line-big">
              <div className="val">{totalOne80s}</div>
              <div className="def">180s this round</div>
            </div>
            <div className="info-line-big">
              <div className="val">{hf}</div>
              <div className="def">high out</div>
            </div>
            <div className="info-line-big">
              <div style={{ width: "32px" }}></div>
              <div className="def">{hfPlayer}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="progress">
                <svg
                  id="svg"
                  width="80"
                  height="80"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    r="35"
                    cx="40"
                    cy="40"
                    fill="transparent"
                    strokeDasharray="219.91"
                    strokeDashoffset="0"
                  ></circle>
                  <circle
                    id="bar"
                    r="35"
                    cx="40"
                    cy="40"
                    fill="transparent"
                    strokeDasharray="219.91"
                    strokeDashoffset={((100 - progress) * 219.91) / 100}
                  ></circle>
                </svg>
                <div className="progress-text">{progress}%</div>
              </div>
            </div>
          </div>
          <div
            className="box prizes inner"
            style={{ display: "flex", flexDirection: "column" }}
          >
            <div className="box-label">Prize structure</div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flex: 1,
              }}
            >
              {prizes.map((prize, i) => {
                return <div key={i}>{`${prize.rank}. ${prize.prize} RON`}</div>;
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

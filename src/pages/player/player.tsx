import { ReactElement, useEffect, useState } from "react";
import "./player.scss";
import { Bracket } from "../../components/bracket/bracket";
import {
  Competition,
  FirestoreRound,
  TPlayersList,
  TStanding,
  TStat,
  TTeams,
} from "../../types";
import { useParams } from "react-router-dom";
import { getPlayerStats } from "../../firestore/stats";
import {
  getCompetition,
  getplayerStandings,
  getStandings,
} from "../../firestore/competition";
import { getOrdinalSuffix } from "../../core/utils";
import { MedalSvg } from "../../svg/MedalSvg";
import CapturePhoto from "../../components/profile-photo/profile-photo";
import ProfilePhoto from "../../components/profile-photo/profile-photo";
import { ADM } from "../../core/constants";

type TPlayerPage = {
  competition: Competition;
  playersMap: TPlayersList;
  round: FirestoreRound;
  compId: string;
  usersMap: { [key: string]: string };
  authUid: string;
};

export const PlayerPage = ({
  competition,
  playersMap,
  round,
  compId,
  usersMap,
  authUid,
}: TPlayerPage): ReactElement => {
  const [stats, setStats] = useState({} as TStanding);
  const [is180record, setIs180record] = useState(false as any);
  const [isHFrecord, setIsHFrecord] = useState(false as any);
  const params = useParams();

  useEffect(() => {
    getplayerStandings(compId, params.uid || "").then((sts) => {
      setStats(sts);
    });

    getCompetition(compId).then((data) => {
      data.records.hfPlayers.forEach((hf: any) => {
        if (hf.player === params.uid) {
          setIsHFrecord(true);
        }
      });
      data.records.one80sPlayers.forEach((one80: any) => {
        if (one80.player === params.uid) {
          setIs180record(true);
        }
      });
    });
  }, []);

  return (
    <>
      <div className="player-page" id="playerPage">
        <div className="box">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            {params.uid && (
              <div className="box-label">
                {stats.rank && `${stats.rank}${getOrdinalSuffix(stats.rank)}`}{" "}
                {playersMap[params.uid].name}
              </div>
            )}
            <div style={{ fontSize: "24px" }}>{stats.points}p</div>
          </div>
          <div className="top-flex">
            <div className="photo-container">
              <ProfilePhoto
                uid={params.uid}
                canEdit={usersMap[authUid] === params.uid || authUid === ADM}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div className="stats">
                <div className="val">{stats.matches}</div>
                <div className="def">games</div>
                <div
                  className="percent"
                  style={{
                    width: `${
                      ((stats.won || 0) / (stats.matches || 1)) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="stats">
                <div className="val">{stats.legs}</div>
                <div className="def">legs</div>
                <div
                  className="percent"
                  style={{
                    width: `${
                      ((stats.legsWon || 0) / (stats.legs || 1)) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="stats stats-simple">
                <div className="val">{stats.avg?.toFixed(2)}</div>
                <div className="def">average</div>
              </div>
              <div className="stats stats-simple">
                <div className="val">{stats["one80s"] || 0}</div>
                <div className="def">180s</div>

                <div
                  style={{ position: "absolute", top: "-4px", left: "-18px" }}
                >
                  {is180record && <MedalSvg width="36" height="36" />}
                </div>
              </div>
              <div className="stats stats-simple">
                <div className="val">{stats["140s"] || 0}</div>
                <div className="def">140s</div>
              </div>
              <div className="stats stats-simple">
                <div className="val">{stats["100s"] || 0}</div>
                <div className="def">100s</div>
              </div>
              {(stats["hf"] || 0) >= 100 && (
                <div className="stats stats-simple">
                  <div className="val">{stats["hf"] || 0}</div>
                  <div className="def">high finish</div>
                  <div
                    style={{ position: "absolute", top: "-4px", left: "-18px" }}
                  >
                    {isHFrecord && <MedalSvg width="36" height="36" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

import { ReactElement, useEffect, useState } from "react";
import "./player.scss";
import { Bracket } from "../../components/bracket/bracket";
import {
  Competition,
  FirestoreRound,
  TPlayersList,
  TStat,
  TTeams,
} from "../../types";
import { useParams } from "react-router-dom";
import { getPlayerStats } from "../../firestore/stats";

type TPlayerPage = {
  competition: Competition;
  playersMap: TPlayersList;
  round: FirestoreRound;
  compId: string;
};

export const PlayerPage = ({
  competition,
  playersMap,
  round,
  compId,
}: TPlayerPage): ReactElement => {
  const [stats, setStats] = useState({} as TStat);
  const params = useParams();

  useEffect(() => {
    getPlayerStats(compId, params.uid || "").then((sts) => {
      setStats(sts);
    });
  }, []);

  return (
    <>
      <div className="player-page" id="playerPage">
        <div className="box">
          {params.uid && (
            <div className="box-label">{playersMap[params.uid].name}</div>
          )}
          <div className="home-matches">AVG: {stats.avg?.toFixed(2)}</div>
        </div>
      </div>
    </>
  );
};

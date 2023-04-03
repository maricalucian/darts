import { ReactElement } from "react";
import "./bracket.scss";
import { Bracket } from "../../components/bracket/bracket";
import {
  Competition,
  FirestoreRound,
  TPlayersList,
  TTeams,
} from "../../types";

type TBracketPage = {
  competition: Competition;
  playersMap: TPlayersList;
  round: FirestoreRound;
  playerId: string;
  teams: TTeams;
};

export const BracketPage = ({
  competition,
  playersMap,
  round,
  playerId,
  teams
}: TBracketPage): ReactElement => {
  return (
    <>
      <div className="bracket-page" id="bracketPage">
        <div className="bracket-title">
          <div className="title-text">Fixtures</div>
        </div>
        {round.status === "registering" && (
          <div className="info">Round pending</div>
        )}
        {round.status && round.status !== "registering" && (
          <Bracket
            playerId={playerId}
            competition={competition}
            playersMap={playersMap}
            teams={teams}
            isPairs={round.type === 'teams'}
          />
        )}
      </div>
    </>
  );
};

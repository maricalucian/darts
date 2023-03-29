import React, { ReactElement, useState } from "react";
import "./bracket.scss";
import { Bracket } from "../../components/bracket/bracket";
import { getNextMatchOrder } from "../../core/competition";
import {
  AppUser,
  Competition,
  FirestoreRound,
  TPlayersList,
} from "../../types";
import { finished } from "stream";
import { BLANK } from "../../core/constants";

type TBracketPage = {
  competition: Competition;
  playersMap: TPlayersList;
  round: FirestoreRound;
  playerId: string;
};

export const BracketPage = ({
  competition,
  playersMap,
  round,
  playerId,
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
          />
        )}
      </div>
    </>
  );
};

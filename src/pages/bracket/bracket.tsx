import React, { ReactElement, useState } from "react";
import "./bracket.scss";
import { Bracket } from "../../components/bracket/bracket";
import { getNextMatchOrder } from "../../core/competition";
import { Competition, FirestoreRound, TPlayersList } from "../../types";
import { finished } from "stream";
import { BLANK } from "../../core/constants";

type TBracketPage = {
  competition: Competition;
  playersMap: TPlayersList;
  round: FirestoreRound;
};

export const BracketPage = ({
  competition,
  playersMap,
  round,
}: TBracketPage): ReactElement => {
  return (
    <>
      <div className="bracket-page">
        <div className="bracket-title">
          <h3>Bracket</h3>
        </div>
        {round.status === "registering" && (
          <div className="info">Round pending</div>
        )}
        {round.status && round.status !== "registering" && (
          <Bracket competition={competition} playersMap={playersMap} />
        )}
      </div>
    </>
  );
};

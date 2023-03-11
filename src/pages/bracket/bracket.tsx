import React, { ReactElement, useState } from "react";
import "./bracket.scss";
import { Bracket } from "../../components/bracket/bracket";
import { getNextMatchOrder } from "../../core/competition";
import { Competition, TPlayersList } from "../../types";
import { finished } from "stream";
import { BLANK } from "../../core/constants";

type TBracketPage = {
  competition: Competition;
  playersMap: TPlayersList
};


export const BracketPage = ({ competition, playersMap }: TBracketPage): ReactElement => {
  return (
    <>
      <div className="bracket-page">
        <Bracket competition={competition} playersMap={playersMap}/>
      </div>
    </>
  );
};

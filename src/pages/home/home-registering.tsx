import React, { ReactElement, useEffect, useState } from "react";
import {
  Competition,
  TPlayersList,
  FirestoreRound,
  Match,
  TRoundPlayerList,
} from "../../types";
import { BLANK } from "../../core/constants";

import "./home.scss";
import { prizeSturcture } from "../../core/competition";

type THomePageProps = {
  competition: Competition;
  playersMap: TPlayersList;
  round: FirestoreRound;
  roundPlayers: TRoundPlayerList;
  popupMatchInfo: (round: number, match: Match) => void;
};

export const HomeRegistering = ({
  round,
  competition,
  playersMap,
  popupMatchInfo,
  roundPlayers,
}: THomePageProps): ReactElement => {
  return (
    <>
    </>
  );
};

import React, { ReactElement } from "react";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { startNewRound } from "../../firestore/competition";

import "./home.scss";


type HomePageType = {
  round: any;
};

export const HomePage = ({ round }: HomePageType): ReactElement => {
  return (
    <div className="home">
      <button
        onClick={() => {
          startNewRound();
        }}
      >
        Start New Round
      </button>
      <br />
      <br />
    </div>
  );
};

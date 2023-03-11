import React, { ReactElement, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../core/firebase";
import { Link } from "react-router-dom";
import { FirestoreRound } from "../../types";
import "./header.scss";
import { processCompetition } from "../../firestore/competition";

type HeaderProps = {
  round: FirestoreRound;
};

export const Header = ({ round }: HeaderProps): ReactElement => {
  const [currentEdition, setCurrentEdition] = useState(0);

  useEffect(() => {
    onSnapshot(doc(db, "test", "currentCompetition"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCurrentEdition(data.et);
      }
    });
    // getCurrentCompetition().then((data) => {
    //   setCurrentEdition(data);
    // });
  });
  return (
    <div className="header">
      Current round: {round.round} &nbsp; &nbsp; &nbsp; Status : {round.status}
      <br />
      <Link to="/">Home</Link> &nbsp; &nbsp;
      <Link to="/bracket">Bracket</Link> &nbsp; &nbsp;
      <Link to="/matches">Matches</Link>&nbsp; &nbsp;
      <Link to="/manage">Manage</Link>
      <button
        onClick={() => {
          processCompetition(round.round);
        }}
      >
        process competition
      </button>
    </div>
  );
};

import React, { ReactElement } from "react";
import { Competition, FirestoreRound, Match, TPlayersList } from "../../types";
import { BLANK } from "../../core/constants";
import "./matches.scss";

type TMatchesPageProps = {
  competition: Competition;
  playersMap: TPlayersList;
  round: FirestoreRound;
  popupMatchInfo: (round: number, match: Match) => void;
};

// const hasBlanks = match.player1 === BLANK || match.player2 === BLANK;
export const MatchesPage = ({
  competition,
  playersMap,
  round,
  popupMatchInfo,
}: TMatchesPageProps): ReactElement => {
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
    <div className="matches">
      {nextGames.length > 0 && (
        <div className="box">
          <div className="box-label">Next games</div>
          <div className="pending-matches">
            {Object.values(competition)
              .filter((match) => {
                const hasBlanks =
                  match.player1 === BLANK || match.player2 === BLANK;
                if (
                  match.player1 &&
                  match.player2 &&
                  !hasBlanks &&
                  !match.finished
                ) {
                  return true;
                }
                return false;
              })
              .map((match) => (
                <div
                  className="match-info next"
                  onClick={() => {
                    popupMatchInfo(round.round, match);
                  }}
                  key={match.number}
                >
                  <div className="match-no">{match.number}</div>
                  <div className="p1">
                    {playersMap[match.player1 || ""].name}
                  </div>
                  <div className="divider">vs</div>
                  <div className="p2">
                    {playersMap[match.player2 || ""].name}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      <div className="box white">
        <div className="box-label">Games completed</div>
        <div className="finished-matches">
          {Object.values(competition)
            .filter((match) => {
              const hasBlanks =
                match.player1 === BLANK || match.player2 === BLANK;
              if (
                match.player1 &&
                match.player2 &&
                !hasBlanks &&
                match.finished
              ) {
                return true;
              }
              return false;
            })
            .sort((a, b) => {
              if (a.number > b.number) {
                return -1;
              } else if (a.number < b.number) {
                return 1;
              } else {
                return 0;
              }
            })
            .map((match) => (
              <div
                className="match-info finished"
                onClick={() => {
                  popupMatchInfo(round.round, match);
                }}
                key={match.number}
              >
                <div className="match-no">{match.number}</div>
                <div className="p1">
                  {playersMap[match.player1 || ""].name} &nbsp;{" "}
                  <b>{match.score1}</b>
                </div>
                <div className="divider">-</div>
                <div className="p2">
                  <b>{match.score2}</b> &nbsp;{" "}
                  {playersMap[match.player2 || ""].name}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

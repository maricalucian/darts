import React, { ReactElement, useState } from "react";
import * as d3 from "d3";
import { Match, MatchLocation, Competition, TPlayersList } from "../../types";

import "./bracket.scss";
import { getNextMatchOrder } from "../../core/competition";
import { BLANK } from "../../core/constants";

type IBracketType = {
  competition: Competition;
  playersMap: TPlayersList;
};

type ICoords = { x: number; y: number };
type IMatchPositions = { [key: number]: ICoords };

const matchWidth = 200;
const matchHorizontalSpacing = 30;
const matchHeight = 60;
const matchVerticalSpacing = 40;
const margin = 20;

const scoreBoxWidth = 30;

const lineColor = "#a6a6a6";
const matchFill = "#ffffff";
const scoreNeutral = "#cccccc";
const scoreWin = "#32834b";
const scoreLoose = "#a53f3f";
const scorePending = "#e4d86b";

const drawMatchLine = (matchPositions: IMatchPositions, match: Match) => {
  if (!match.winnerMatch) {
    return;
  }
  const sourceCoords = matchPositions[match.number];
  const targetCoords = matchPositions[match.winnerMatch];
  return (
    <React.Fragment key={match.number}>
      <line
        x1={sourceCoords.x + matchWidth / 2}
        y1={sourceCoords.y}
        x2={sourceCoords.x + (targetCoords.x - sourceCoords.x) / 2}
        y2={sourceCoords.y}
        stroke={lineColor}
        strokeWidth={0.5}
      />
      <line
        x1={sourceCoords.x + (targetCoords.x - sourceCoords.x) / 2}
        y1={sourceCoords.y}
        x2={sourceCoords.x + (targetCoords.x - sourceCoords.x) / 2}
        y2={targetCoords.y}
        stroke={lineColor}
        strokeWidth={0.5}
      />
      <line
        x1={sourceCoords.x + (targetCoords.x - sourceCoords.x) / 2}
        y1={targetCoords.y}
        x2={targetCoords.x}
        y2={targetCoords.y}
        stroke={lineColor}
        strokeWidth={0.5}
      />
    </React.Fragment>
  );
};

const drawMatch = (
  matchPositions: IMatchPositions,
  match: Match,
  playersMap: TPlayersList
) => {
  const hasBlanks = match.player1 === BLANK || match.player2 === BLANK;
  const { x, y } = matchPositions[match.number];
  let topScoreBackground =
    match.finished && !hasBlanks
      ? match.score1 && match.score1 > (match.score2 || 0)
        ? scoreWin
        : scoreLoose
      : scoreNeutral;
  let bottomScoreBackground =
    match.finished && !hasBlanks
      ? match.score2 && match.score2 > (match.score1 || 0)
        ? scoreWin
        : scoreLoose
      : scoreNeutral;

  if (!match.finished && match.player1 && match.player2) {
    topScoreBackground = scorePending;
    bottomScoreBackground = scorePending;
  }
  return (
    <React.Fragment key={match.number}>
      {drawMatchLine(matchPositions, match)}

      <rect
        x={x - matchWidth / 2}
        y={y - matchHeight / 2}
        width={matchWidth}
        height={matchHeight}
        rx="6"
        style={{ fill: matchFill, strokeWidth: 0.5, stroke: lineColor }}
      />
      <path
        d={`M${x + matchWidth / 2 - scoreBoxWidth},${y - matchHeight / 2} h${
          scoreBoxWidth - 6
        } q6,0 6,6 v${matchHeight / 2 - 6} h${-scoreBoxWidth} z`}
        style={{
          fill: topScoreBackground,
          strokeWidth: 0.5,
          stroke: "#ffffff00",
        }}
      />
      <path
        d={`M${x + matchWidth / 2 - scoreBoxWidth},${y} h${scoreBoxWidth} v${
          matchHeight / 2 - 6
        } q0,6 -6,6 h${-scoreBoxWidth + 6} z`}
        style={{
          fill: bottomScoreBackground,
          strokeWidth: 0.5,
          stroke: "#ffffff00",
        }}
      />
      <line
        x1={x - matchWidth / 2 + scoreBoxWidth}
        y1={y - matchHeight / 2}
        x2={x - matchWidth / 2 + scoreBoxWidth}
        y2={y + matchHeight / 2}
        stroke={lineColor}
        strokeWidth={0.5}
      />
      <line
        x1={x - matchWidth / 2 + scoreBoxWidth}
        y1={y}
        x2={x + matchWidth / 2 - scoreBoxWidth}
        y2={y}
        stroke={lineColor}
        strokeWidth={0.5}
      />
      <text x={x - matchWidth / 2 + scoreBoxWidth / 2} y={y}>
        {match.number}
      </text>
      {match.player1 && (
        <text
          x={x}
          y={y - matchHeight / 4 + 2}
          className={`${match.player1 === BLANK && "info"} ${
            match.winner === match.player1 &&
            match.player1 !== BLANK &&
            "winner"
          }`}
        >
          {match.player1 === BLANK ? BLANK : playersMap[match.player1]?.name}
        </text>
      )}
      {!match.player1 && match.info1 && (
        <text x={x} y={y - matchHeight / 4 + 2} className="info">
          {match.info1}
        </text>
      )}
      {match.player2 && (
        <text
          x={x}
          y={y + matchHeight / 4}
          className={`${match.player2 === BLANK && "info"} ${
            match.winner === match.player2 &&
            match.player2 !== BLANK &&
            "winner"
          }`}
        >
          {match.player2 === BLANK ? BLANK : playersMap[match.player2]?.name}
        </text>
      )}
      {!match.player2 && match.info2 && (
        <text x={x} y={y + matchHeight / 4} className="info">
          {match.info2}
        </text>
      )}
      {match.finished && !hasBlanks && (
        <>
          <text
            x={x + matchWidth / 2 - scoreBoxWidth / 2}
            y={y - matchHeight / 4 + 2}
            className="score"
          >
            {match.score1 || 0}
          </text>
          <text
            x={x + matchWidth / 2 - scoreBoxWidth / 2}
            y={y + matchHeight / 4}
            className="score"
          >
            {match.score2 || 0}
          </text>
        </>
      )}
    </React.Fragment>
  );
};

const getHorizontalSpace = (rounds: number): number =>
  rounds * 2 * (matchWidth + matchHorizontalSpacing) + margin * 2;

const getRoundXPositions = (roundsTotal: number): any => {
  const rounds: any = {};
  // const leftColumns = (roundsTotal - 1) * 2;
  const leftAfterSeeds = margin + matchWidth + matchHorizontalSpacing;
  const columnSpace = 2 * (matchWidth + matchHorizontalSpacing);

  rounds[0] = {
    seed: margin + matchWidth / 2,
  };
  for (let i = 1; i <= roundsTotal; i++) {
    rounds[i] = {
      right:
        leftAfterSeeds +
        (i - 1) * columnSpace +
        matchWidth +
        matchHorizontalSpacing / 2,
      left: leftAfterSeeds + (i - 1) * columnSpace + matchWidth / 2,
      newcomers:
        leftAfterSeeds +
        (i - 1) * columnSpace +
        matchWidth * 1.5 +
        matchHorizontalSpacing,
      final: leftAfterSeeds + (i - 1) * columnSpace + matchWidth / 2,
    };
  }
  return rounds;
};

const getMatchYPos = (match: Match, seedMatches: number): number => {
  const bracketHeight =
    margin +
    seedMatches * (matchHeight + matchVerticalSpacing) -
    matchVerticalSpacing +
    margin;
  const leftBracketHeight =
    margin +
    (seedMatches / 2) * (matchHeight + matchVerticalSpacing) -
    matchVerticalSpacing +
    margin;
  switch (match.location) {
    case "seed":
      return (
        margin +
        match.indexInColumn * (matchHeight + matchVerticalSpacing) +
        matchHeight / 2
      );
    case "right":
      return (
        (bracketHeight * (match.indexInColumn * 2 + 1)) /
        (match.totalInColumn * 2)
      );
    case "left":
      return (
        bracketHeight +
        (leftBracketHeight * (match.indexInColumn * 2 + 1)) /
          (match.totalInColumn * 2)
      );
    case "newcomers":
      return (
        bracketHeight +
        (leftBracketHeight * (match.indexInColumn * 2 + 1)) /
          (match.totalInColumn * 2)
      );
    case "final":
      return margin + (bracketHeight + leftBracketHeight) / 2;
  }
  return 0;
};

const calculateMatchPositions = (
  structure: Competition,
  rounds: number
): IMatchPositions => {
  const roundPositions = getRoundXPositions(rounds);
  const positions: IMatchPositions = {};
  Object.values(structure).map((match) => {
    positions[match.number] = {
      x: roundPositions[match.round][match.location],
      y: getMatchYPos(match, Math.pow(2, rounds - 1)),
    };
  });
  return positions;
};

const drawBracket = (
  competition: Competition,
  rounds: number,
  playersMap: TPlayersList
) => {
  const matchPositions = calculateMatchPositions(competition, rounds);

  // populate aditional info
  Object.values(competition).map((match) => {
    if (
      match.looserMatch &&
      competition[match.looserMatch].round === 1 &&
      competition[match.looserMatch].location === "left"
    ) {
      const order = getNextMatchOrder(match);
      if (order.looserTop) {
        competition[match.looserMatch].info1 = `Looser of ${match.number}`;
      } else {
        competition[match.looserMatch].info2 = `Looser of ${match.number}`;
      }
    }
    if (
      match.looserMatch &&
      competition[match.looserMatch].location === "newcomers"
    ) {
      const order = getNextMatchOrder(match);
      if (order.looserTop) {
        competition[match.looserMatch].info1 = `Looser of ${match.number}`;
      } else {
        competition[match.looserMatch].info2 = `Looser of ${match.number}`;
      }
    }
  });
  return (
    <>
      {Object.values(competition).map((match) => {
        return drawMatch(matchPositions, match, playersMap);
      })}
    </>
  );
};

export const Bracket = ({
  competition,
  playersMap,
}: IBracketType): ReactElement => {
  const rounds = Math.floor(Math.log2(Object.keys(competition).length));
  const horizontalSpace = getHorizontalSpace(rounds);
  const width = horizontalSpace;
  const seedMatches = Math.pow(2, rounds - 1);
  const bracketHeight =
    margin +
    seedMatches * (matchHeight + matchVerticalSpacing) -
    matchVerticalSpacing +
    margin;
  const leftBracketHeight =
    margin +
    (seedMatches / 2) * (matchHeight + matchVerticalSpacing) -
    matchVerticalSpacing +
    margin;

  const height = bracketHeight + leftBracketHeight;

  return (
    <>
      {Object.keys(competition).length > 0 &&
        Object.keys(playersMap).length > 0 && (
          <svg width={width} height={height} className="bracket-svg">
            {drawBracket(competition, rounds, playersMap)}
          </svg>
        )}
    </>
  );
};

import React, { ReactElement, useEffect, useState } from "react";
import { Match, Competition, TPlayersList, TTeams } from "../../types";

import "./bracket.scss";
import { getNextMatchOrder } from "../../core/competition";
import { BLANK } from "../../core/constants";
import { IconButton } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";

type IBracketType = {
  competition: Competition;
  playersMap: TPlayersList;
  playerId: string;
  teams: TTeams;
  isPairs: boolean;
};

type ICoords = { x: number; y: number };
type IMatchPositions = { [key: number]: ICoords };

let playerPosition = [0, 0];

const goToPosition = () => {
  window.scrollTo({
    top: playerPosition[1] - window.innerHeight / 2 + 100,
    behavior: "smooth",
  });
  document.getElementById("bracketPage")?.scrollTo({
    left: playerPosition[0] - window.innerWidth / 2,
    behavior: "smooth",
  });
};

const scales = [
  {
    matchWidth: 160,
    matchHorizontalSpacing: 10,
    matchHeight: 40,
    matchVerticalSpacing: 10,
    gameNoWidth: 16,
    scoreBoxWidth: 16,
    averageWidh: 32,
  },
  {
    matchWidth: 220,
    matchHorizontalSpacing: 20,
    matchHeight: 50,
    matchVerticalSpacing: 20,
    gameNoWidth: 20,
    scoreBoxWidth: 20,
    averageWidh: 40,
  },
  {
    matchWidth: 240,
    matchHorizontalSpacing: 30,
    matchHeight: 60,
    matchVerticalSpacing: 40,
    gameNoWidth: 30,
    scoreBoxWidth: 30,
    averageWidh: 60,
  },
];

// const matchWidth = 200;
// const matchHorizontalSpacing = 30;
// const matchHeight = 60;
// const matchVerticalSpacing = 40;
// const scoreBoxWidth = 30;
const margin = 20;

const lineColor = "#a6a6a6";
const matchFill = "#ffffff";
const scoreNeutral = "#cccccc";
const scoreWin = "#32834b";
const scoreLoose = "#a53f3f";
const scorePending = "#e4d86b";

const drawMatchLine = (
  matchPositions: IMatchPositions,
  match: Match,
  highlight: boolean,
  matchWidth: number
) => {
  if (!match.winnerMatch) {
    return;
  }
  const sourceCoords = matchPositions[match.number];
  const targetCoords = matchPositions[match.winnerMatch];
  const strokeColor = highlight ? "#666" : lineColor;
  const strokeWidth = highlight ? 1.4 : 0.5;
  return (
    <React.Fragment key={match.number}>
      <line
        x1={sourceCoords.x + matchWidth / 2}
        y1={sourceCoords.y}
        x2={sourceCoords.x + (targetCoords.x - sourceCoords.x) / 2}
        y2={sourceCoords.y}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <line
        x1={sourceCoords.x + (targetCoords.x - sourceCoords.x) / 2}
        y1={sourceCoords.y}
        x2={sourceCoords.x + (targetCoords.x - sourceCoords.x) / 2}
        y2={targetCoords.y}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <line
        x1={sourceCoords.x + (targetCoords.x - sourceCoords.x) / 2}
        y1={targetCoords.y}
        x2={targetCoords.x - matchWidth / 2}
        y2={targetCoords.y}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </React.Fragment>
  );
};

const getShortenedName = (name: string): string => {
  const parts = name.split(" ");
  return `${parts[1]} ${parts[0][0]}`;
};

const getPlayerName = (
  playersMap: TPlayersList,
  teams: TTeams,
  playerId: string,
  isPairs: boolean
): string => {
  if (playerId === BLANK) {
    return BLANK;
  }
  if (isPairs) {
    return `${getShortenedName(
      playersMap[playerId]?.name
    )} / ${getShortenedName(playersMap[teams[playerId]?.p2]?.name)}`;
  }

  return playersMap[playerId]?.name;
};

const drawMatch = (
  matchPositions: IMatchPositions,
  match: Match,
  playersMap: TPlayersList,
  selected: string,
  setSelected: (s: string) => void,
  dimensions: any,
  teams: TTeams,
  isPairs: boolean
) => {
  const { matchWidth, matchHeight, scoreBoxWidth, gameNoWidth, averageWidh } = dimensions;
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

  const isInGame = match.player1 === selected || match.player2 === selected;

  const strokeColor = isInGame ? "#000" : lineColor;
  const strokeWidth = isInGame ? 1 : 0.5;

  return (
    <React.Fragment key={match.number}>
      {drawMatchLine(
        matchPositions,
        match,
        !!selected && match.winner === selected,
        matchWidth
      )}

      {/* top score */}
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

      {/* bottom score */}
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

      {/* top player background (and highlight color) */}
      <g
        onClick={() => {
          if (match.player1 !== BLANK) {
            setSelected(match.player1 || "");
          }
        }}
      >
        <rect
          x={x - matchWidth / 2 + gameNoWidth}
          y={y - matchHeight / 2}
          width={matchWidth - scoreBoxWidth - gameNoWidth}
          height={matchHeight / 2}
          style={{
            fill:
              selected && match.player1 === selected ? "#fff0cf" : matchFill,
            strokeWidth: 0,
          }}
        />
        {/* top player text */}
        {match.player1 && (
          <text
            x={x - (scoreBoxWidth - gameNoWidth) / 2 - averageWidh / 2}
            y={y - matchHeight / 4 + 2}
            className={`${match.player1 === BLANK && "info"} ${
              match.winner === match.player1 &&
              match.player1 !== BLANK &&
              "winner"
            }`}
          >
            {getPlayerName(playersMap, teams, match.player1, isPairs)}
          </text>
        )}
        {!match.player1 && match.info1 && (
          <text x={x} y={y - matchHeight / 4 + 2} className="info">
            {match.info1}
          </text>
        )}
      </g>

      {/* bottom player background (and highlight color) */}
      <g
        onClick={() => {
          if (match.player2 !== BLANK) {
            setSelected(match.player2 || "");
          }
        }}
      >
        <rect
          x={x - matchWidth / 2 + gameNoWidth}
          y={y}
          width={matchWidth - scoreBoxWidth - gameNoWidth}
          height={matchHeight / 2}
          style={{
            fill:
              selected && match.player2 === selected ? "#fff0cf" : matchFill,
            strokeWidth: 0,
          }}
        ></rect>
        {/* bottom player text */}
        {match.player2 && (
          <text
            x={x - (scoreBoxWidth - gameNoWidth) / 2 - averageWidh / 2}
            y={y + matchHeight / 4}
            className={`${match.player2 === BLANK && "info"} ${
              match.winner === match.player2 &&
              match.player2 !== BLANK &&
              "winner"
            }`}
          >
            {getPlayerName(playersMap, teams, match.player2, isPairs)}
          </text>
        )}
        {!match.player2 && match.info2 && (
          <text x={x} y={y + matchHeight / 4} className="info">
            {match.info2}
          </text>
        )}
      </g>

      {/* vertical match number line */}
      <line
        x1={x - matchWidth / 2 + gameNoWidth}
        y1={y - matchHeight / 2}
        x2={x - matchWidth / 2 + gameNoWidth}
        y2={y + matchHeight / 2}
        stroke={lineColor}
        strokeWidth={0.5}
      />

      {/* vertical average number line */}
      <line
        x1={x + matchWidth / 2 - scoreBoxWidth - averageWidh}
        y1={y - matchHeight / 2}
        x2={x + matchWidth / 2 - scoreBoxWidth - averageWidh}
        y2={y + matchHeight / 2}
        stroke={lineColor}
        strokeWidth={0.5}
      />

      {/* horizontal line */}
      <line
        x1={x - matchWidth / 2 + gameNoWidth}
        y1={y}
        x2={x + matchWidth / 2 - scoreBoxWidth}
        y2={y}
        stroke={lineColor}
        strokeWidth={0.5}
      />

      {/* match big rectangle */}
      <rect
        x={x - matchWidth / 2}
        y={y - matchHeight / 2}
        width={matchWidth}
        height={matchHeight}
        rx="6"
        style={{ fill: "none", strokeWidth: strokeWidth, stroke: strokeColor }}
        filter="url(#shadow)"
      />

      {/* match number */}
      <text x={x - matchWidth / 2 + gameNoWidth / 2} y={y}>
        {match.number}
      </text>

      {/* score text */}
      {match.finished && !hasBlanks && (
        <>
          <text
            x={x + matchWidth / 2 - scoreBoxWidth / 2}
            y={y - matchHeight / 4 + 2}
            className="score"
          >
            {match.score1 || 0}
          </text>
          {/* top avg */}
          <text
            x={x + matchWidth / 2 - scoreBoxWidth - averageWidh / 2}
            y={y - matchHeight / 4 + 2}
            className="average"
          >
            {match.player1avg || ''}
          </text>

          <text
            x={x + matchWidth / 2 - scoreBoxWidth / 2}
            y={y + matchHeight / 4}
            className="score"
          >
            {match.score2 || 0}
          </text>
          {/* bottom avg */}
          <text
            x={x + matchWidth / 2 - scoreBoxWidth - averageWidh / 2}
            y={y + matchHeight / 4}
            className="average"
          >
            {match.player2avg || ''}
          </text>
        </>
      )}
      {/* game position info */}
      {match.location === "right" && match.totalInColumn === 4 && (
        <text
          x={x - matchWidth / 2 + 4}
          y={y - matchHeight / 2 - 4}
          className="round-info"
        >
          Quarterfinal on right
        </text>
      )}
      {match.location === "right" && match.totalInColumn === 2 && (
        <text
          x={x - matchWidth / 2 + 4}
          y={y - matchHeight / 2 - 4}
          className="round-info"
        >
          Semifinal on right
        </text>
      )}
      {match.location === "right" && match.totalInColumn === 1 && (
        <text
          x={x - matchWidth / 2 + 4}
          y={y - matchHeight / 2 - 4}
          className="round-info"
        >
          Final on right
        </text>
      )}
      {match.location === "final" && (
        <text
          x={x - matchWidth / 2 + 4}
          y={y - matchHeight / 2 - 4}
          className="round-info"
        >
          Final
        </text>
      )}
      {(match.location === "left" || match.location === "newcomers") && (
        <text
          x={x - matchWidth / 2 + 4}
          y={y - matchHeight / 2 - 4}
          className="round-info"
        >
          {match.looserPosition}
          {match.looserPosition === 3 ? "rd" : "th"}
        </text>
      )}
    </React.Fragment>
  );
};

const getHorizontalSpace = (rounds: number, dimensions: any): number =>
  rounds * 2 * (dimensions.matchWidth + dimensions.matchHorizontalSpacing) +
  margin * 2;

const getRoundXPositions = (roundsTotal: number, dimensions: any): any => {
  const { matchWidth, matchHorizontalSpacing } = dimensions;
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

const getMatchYPos = (
  match: Match,
  seedMatches: number,
  dimensions: any
): number => {
  const { matchHeight, matchVerticalSpacing } = dimensions;
  const gameBracketHeight = seedMatches * (matchHeight + matchVerticalSpacing);
  const bracketHeight = 2 * margin + gameBracketHeight - matchVerticalSpacing;
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
        margin +
        (gameBracketHeight * (match.indexInColumn + 0.5)) /
          match.totalInColumn -
        matchVerticalSpacing / 2
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
  rounds: number,
  dimensions: any
): IMatchPositions => {
  const roundPositions = getRoundXPositions(rounds, dimensions);
  const positions: IMatchPositions = {};
  Object.values(structure).map((match) => {
    positions[match.number] = {
      x: roundPositions[match.round][match.location],
      y: getMatchYPos(match, Math.pow(2, rounds - 1), dimensions),
    };
  });
  return positions;
};

const drawBracket = (
  competition: Competition,
  rounds: number,
  playersMap: TPlayersList,
  selected: string,
  setSelected: (s: string) => void,
  dimensions: any,
  playerId: string,
  teams: TTeams,
  isPairs: boolean
) => {
  const matchPositions = calculateMatchPositions(
    competition,
    rounds,
    dimensions
  );

  // const gameBracketHeight =
  //   Math.pow(2, rounds - 1) *
  //   (dimensions.matchHeight + dimensions.matchVerticalSpacing);
  // const rightbracketHeight =
  //   2 * margin + gameBracketHeight - dimensions.matchVerticalSpacing;

  // populate aditional info an calculate last match for player
  Object.values(competition).forEach((match) => {
    if (
      playerId &&
      (match.player1 === playerId || match.player2 === playerId)
    ) {
      playerPosition = [
        matchPositions[match.number].x,
        matchPositions[match.number].y,
      ];
    }

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
        return drawMatch(
          matchPositions,
          match,
          playersMap,
          selected,
          setSelected,
          dimensions,
          teams,
          isPairs
        );
      })}
    </>
  );
};

export const Bracket = ({
  competition,
  playersMap,
  playerId,
  teams,
  isPairs,
}: IBracketType): ReactElement => {
  const [selected, setSelected] = useState(playerId);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setSelected(playerId);
  }, [playerId]);

  const dimensions = scales[scale];
  const { matchHeight, matchVerticalSpacing } = dimensions;

  const rounds = Math.floor(Math.log2(Object.keys(competition).length));
  const horizontalSpace = getHorizontalSpace(rounds, dimensions);
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
    <div className="bracket-comp">
      {Object.keys(competition).length > 0 &&
        Object.keys(playersMap).length > 0 && (
          <>
            <svg
              key={scale}
              width={width}
              height={height + 60}
              className={`bracket-svg scale-${scale}`}
              // viewBox={`0 0 ${width} ${height}`}
            >
              {drawBracket(
                competition,
                rounds,
                playersMap,
                selected,
                (selected: string) => {
                  setSelected(selected);
                },
                dimensions,
                playerId,
                teams,
                isPairs
              )}
            </svg>
            <div className="action-button">
              <div className="scale">
                <IconButton
                  onClick={() => {
                    if (scale > 0) {
                      setScale(scale - 1);
                    }
                  }}
                >
                  <ZoomOutIcon
                    style={{
                      fontSize: "42px",
                      color: "#555",
                      marginRight: "-14px",
                      marginTop: "8px",
                    }}
                  />
                </IconButton>
                <div className="scale-line">
                  <div
                    className="scale-option scale-first"
                    onClick={() => {
                      setScale(0);
                    }}
                  >
                    {scale === 0 && <div className="selected" />}
                  </div>
                  <div
                    className="scale-option scale-middle"
                    onClick={() => {
                      setScale(1);
                    }}
                  >
                    {scale === 1 && <div className="selected" />}
                  </div>
                  <div
                    className="scale-option scale-last"
                    onClick={() => {
                      setScale(2);
                    }}
                  >
                    {scale === 2 && <div className="selected" />}
                  </div>
                </div>
                <IconButton
                  onClick={() => {
                    if (scale < 2) {
                      setScale(scale + 1);
                    }
                  }}
                >
                  <ZoomInIcon
                    style={{
                      fontSize: "42px",
                      color: "#555",
                      marginLeft: "-6px",
                      marginTop: "8px",
                    }}
                  />
                </IconButton>
              </div>
            </div>
            <div className="locate">
              <div className="locate-button">
                <IconButton
                  onClick={() => {
                    setSelected(playerId);
                    goToPosition();
                  }}
                >
                  <GpsFixedIcon
                    style={{
                      fontSize: "36px",
                      color: "#555",
                      marginLeft: "-4px",
                      marginTop: "-4px",
                    }}
                  />
                </IconButton>
              </div>
            </div>
          </>
        )}
    </div>
  );
};

/*
const getRoundXPositions = (roundsTotal: number): any => {
  const rounds: any = {};
  const leftColumns = (roundsTotal - 1) * 2;
  rounds[0] = {
    seed:
      margin +
      leftColumns * (matchWidth + matchHorizontalSpacing) +
      matchWidth / 2,
  };
  for (let i = 1; i <= roundsTotal; i++) {
    rounds[i] = {
      right:
        margin +
        (leftColumns + i) * (matchWidth + matchHorizontalSpacing) +
        matchWidth / 2,
      left:
        margin +
        ((roundsTotal - i) * 2 - 1) * (matchWidth + matchHorizontalSpacing) +
        matchWidth / 2,
      newcomers:
        margin +
        ((roundsTotal - i) * 2 - 2) * (matchWidth + matchHorizontalSpacing) +
        matchWidth / 2,
      final:
        margin +
        (leftColumns + i) * (matchWidth + matchHorizontalSpacing) +
        matchWidth / 2,
    };
  }
  return rounds;
};


const getHorizontalSpace = (rounds: number): number =>
  ((rounds - 1) * 2 + 1 + rounds) * (matchWidth + matchHorizontalSpacing) +
  margin * 2;

  const getMatchYPos = (match: Match, seedMatches: number): number => {
  console.log(seedMatches);
  return (
    margin +
    match.indexInColumn * (matchHeight + matchVerticalSpacing) +
    matchHeight / 2
  );
};

*/

export {}
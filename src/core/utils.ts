export const funMode = (competition: string) => {
  return competition === "friendly";
};

export const getOrdinalSuffix = (number: number) => {
  // Get ones digit of number
  const onesDigit = number % 10;

  // Handle special cases for 11, 12, 13
  if ((number % 100) >= 11 && (number % 100) <= 13) {
    return "th"; 
  }

  // Pick suffix based on ones digit
  switch(onesDigit) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}
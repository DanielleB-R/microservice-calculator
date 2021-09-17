export const tokenizeRpn = (expression: string): (string | number)[] => {
  return expression.split(/\s+/).map((word) => {
    const parsed = parseFloat(word);
    return isNaN(parsed) ? word : parsed;
  });
};

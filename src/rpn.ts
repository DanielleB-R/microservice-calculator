export const evaluateRpn = (tokens: (string | number)[]): number => {
  const stack: number[] = [];
  for (const token of tokens) {
    if (typeof token === "number") {
      stack.push(token);
    } else {
      const op2 = stack.pop();
      const op1 = stack.pop();

      if (op1 === undefined || op2 === undefined) {
        throw "Stack underflow";
      }

      switch (token) {
        case "+":
          stack.push(op1 + op2);
          break;
        case "-":
          stack.push(op1 - op2);
          break;
        case "*":
          stack.push(op1 * op2);
          break;
        default:
          throw "Unknown operator";
      }
    }
  }
  return stack[0];
};

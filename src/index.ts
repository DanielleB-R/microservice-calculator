const evaluateRpn = (tokens: (string | number)[]): number => {
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
        default:
          throw "Unknown operator";
      }
    }
  }
  return stack[0];
};

// We're reading our command line here so tokenize doesn't take arguments yet
const tokenize = (): (string | number)[] => {
  const expression = [...process.argv];
  // Clear out the program name
  expression.shift();
  expression.shift();
  return expression.map((item) => {
    const parsed = parseInt(item);
    return isNaN(parsed) ? item : parsed;
  });
};

function main() {
  console.log(evaluateRpn(tokenize()));
}

main();

import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from "aws-lambda";
import { evaluateRpn } from "./rpn";
import * as z from "myzod";

const InputSchema = z.object({
  expression: z.array(z.string().or(z.number())),
});
type Input = z.Infer<typeof InputSchema>;

type Output = {
  result: number;
};

export const handler: APIGatewayProxyHandlerV2<Output> = async (
  event: APIGatewayProxyEventV2
): Promise<Output> => {
  const body: Input = InputSchema.parse(JSON.parse(event.body ?? ""));

  const result = evaluateRpn(body.expression);

  return { result };
};

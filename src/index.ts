import {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { evaluateRpn } from "./rpn";
import * as z from "myzod";

const InputSchema = z.object({
  expression: z.array(z.string().or(z.number())),
});
type Input = z.Infer<typeof InputSchema>;

type Output = {
  result: number;
};

const make400 = (message: string): APIGatewayProxyStructuredResultV2 => {
  return {
    statusCode: 400,
    body: message,
  };
};

export const handler: APIGatewayProxyHandlerV2<Output> = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2<Output>> => {
  if (!event.body) {
    return make400("Missing JSON body");
  }

  try {
    const body: Input = InputSchema.parse(JSON.parse(event.body));

    const result = evaluateRpn(body.expression);
    return { result };
  } catch (err: unknown) {
    console.log("Error in evaluation", err);
    return make400("Error in evaluating");
  }
};

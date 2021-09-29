import {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyResultV2,
  SQSHandler,
  SQSEvent,
} from "aws-lambda";
import { sqsForeachHandler } from "./handlers";
import { getDocument, putDocument } from "./dynamo";
import {
  ResultMessageSchema,
  RPNMessageSchema,
  sendResultMessage,
  sendRPNMessage,
} from "./message";
import { evaluateRpn } from "./rpn";
import { tokenizeRpn } from "./tokenize";
import { v4 as uuidv4 } from "uuid";
import * as z from "myzod";

const InputSchema = z
  .object({
    expression: z.string(),
  })
  .or(z.object({ id: z.string() }));
type Input = z.Infer<typeof InputSchema>;

type Output = {
  id: string;
  expression: string;
  result?: number;
};

const make400 = (message: string): APIGatewayProxyStructuredResultV2 => {
  return {
    statusCode: 400,
    body: message,
  };
};

export const entry: APIGatewayProxyHandlerV2<Output> = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2<Output>> => {
  if (!event.body) {
    return make400("Missing JSON body");
  }

  try {
    const body: Input = InputSchema.parse(JSON.parse(event.body));

    if ("expression" in body) {
      const id = uuidv4();

      const document = {
        id,
        expression: body.expression,
        tokens: tokenizeRpn(body.expression),
      };
      await sendRPNMessage(document);

      return { id, expression: body.expression };
    }

    const dynamoDocument = await getDocument(body.id);
    if (!dynamoDocument) {
      return { statusCode: 404 };
    }
    return dynamoDocument;
  } catch (err: unknown) {
    console.log("Error in evaluation", err);
    return make400("Error in evaluating");
  }
};

export const calculateRpn = sqsForeachHandler(async (record) => {
  const messageBody = JSON.parse(record.body) as unknown;
  const message = RPNMessageSchema.try(messageBody);
  if (message instanceof z.ValidationError) {
    console.error("Invalid message format", message);
    return;
  }
  const result = evaluateRpn(message.tokens);

  await sendResultMessage({
    id: message.id,
    expression: message.expression,
    result,
  });
});

export const storeResult: SQSHandler = async (
  event: SQSEvent
): Promise<void> => {
  await Promise.all(
    event.Records.map(async (record) => {
      const messageBody = JSON.parse(record.body) as unknown;
      const message = ResultMessageSchema.try(messageBody);
      if (message instanceof z.ValidationError) {
        console.error("Invalid message format", message);
        return;
      }
      await putDocument(message);
    })
  );
};

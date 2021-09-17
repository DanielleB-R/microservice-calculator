import {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyResultV2,
  SQSHandler,
  SQSEvent,
} from "aws-lambda";
import { getDocument, putDocument } from "./dynamo";
import { ResultMessageSchema, sendResultMessage } from "./message";
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
  result: number;
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
      const result = evaluateRpn(tokenizeRpn(body.expression));

      const document = {
        id,
        expression: body.expression,
        result,
      };
      await sendResultMessage(document);

      return document;
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

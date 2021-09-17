import { SQS } from "aws-sdk";
import * as z from "myzod";

const sqs = new SQS();

export const ResultMessageSchema = z.object({
  id: z.string(),
  expression: z.string(),
  result: z.number(),
});
export type ResultMessage = z.Infer<typeof ResultMessageSchema>;

export const sendResultMessage = async (
  message: ResultMessage
): Promise<void> => {
  await sqs
    .sendMessage({
      QueueUrl: process.env.RESULTS_QUEUE_URL ?? "",
      MessageBody: JSON.stringify(message),
    })
    .promise();
};

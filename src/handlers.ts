import { SQSHandler, SQSEvent, SQSRecord } from "aws-lambda";

export const sqsForeachHandler =
  (recordHandler: (record: SQSRecord) => Promise<void>): SQSHandler =>
  async (event: SQSEvent) => {
    await Promise.all(event.Records.map(recordHandler));
  };

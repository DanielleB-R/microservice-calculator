import { DynamoDB } from "aws-sdk";
import * as z from "myzod";

const docClient = new DynamoDB.DocumentClient();
const TableName = process.env.DYNAMO_TABLE ?? "";

const DocumentSchema = z.object({
  id: z.string(),
  expression: z.string(),
  result: z.number(),
});

export type Document = z.Infer<typeof DocumentSchema>;

export const getDocument = async (id: string): Promise<Document | null> => {
  const queryResult = await docClient
    .get({
      TableName,
      Key: { id },
    })
    .promise();

  if (!queryResult.Item) {
    return null;
  }

  const document = DocumentSchema.try(queryResult.Item);
  return document instanceof z.ValidationError ? null : document;
};

export const putDocument = async (document: Document): Promise<void> => {
  await docClient
    .put({
      TableName,
      Item: document,
    })
    .promise();
};

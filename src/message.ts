import * as z from "myzod";

export const ResultMessageSchema = z.object({
  id: z.string(),
  expression: z.string(),
  result: z.number(),
});
export type ResultMessage = z.Infer<typeof ResultMessageSchema>;

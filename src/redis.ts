import Redis from "ioredis";

const redis = new Redis(6379, process.env.REDIS_ENDPOINT ?? "127.0.0.1");

export async function getResult(expression: string): Promise<number | null> {
  const result = await redis.get(expression);
  if (result === null) {
    return null;
  }

  return parseInt(result, 10);
}

export async function setResult(
  expression: string,
  result: number
): Promise<void> {
  await redis.set(expression, result);
}

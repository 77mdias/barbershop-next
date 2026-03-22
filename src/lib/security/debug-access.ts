import { timingSafeEqual } from "node:crypto";

type HeaderValue = string | string[] | undefined;
type HeaderBag = Headers | Record<string, HeaderValue>;

function readHeader(headers: HeaderBag, name: string): string | undefined {
  if (headers instanceof Headers) {
    const value = headers.get(name);
    return value?.trim() || undefined;
  }

  const value = headers[name.toLowerCase()] ?? headers[name];

  if (Array.isArray(value)) {
    return value[0]?.trim();
  }

  return typeof value === "string" ? value.trim() : undefined;
}

function safeEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function canAccessDebugEndpoints(headers: HeaderBag): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const expectedToken = process.env.DEBUG_API_TOKEN;
  if (!expectedToken) {
    return false;
  }

  const providedToken = readHeader(headers, "x-debug-token") ?? readHeader(headers, "x-debug-auth");
  if (!providedToken) {
    return false;
  }

  return safeEquals(expectedToken, providedToken);
}

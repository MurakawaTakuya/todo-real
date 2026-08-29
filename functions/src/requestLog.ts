import { Request } from "express";

const REDACTED_HEADERS = new Set([
  "authorization",
  "x-firebase-appcheck",
  "token",
]);

export const getRequestData = (req: Request) => {
  const headers = { ...req.headers };
  for (const header of REDACTED_HEADERS) {
    if (header in headers) {
      headers[header] = "[REDACTED]";
    }
  }

  return {
    headers,
    parameters: {
      query: req.query,
      params: req.params,
    },
    body: req.body,
  };
};

export const getHttpRequestData = (req: Request) => {
  const statusCode = req.statusCode || 202;
  return {
    requestMethod: req.method,
    requestUrl: `${req.method} ${statusCode}: ${req.protocol}://${req.get(
      "host"
    )}${req.originalUrl}`,
    status: statusCode,
    userAgent: req.get("User-Agent"),
    remoteIp: req.ip,
    protocol: req.httpVersion ? `HTTP/${req.httpVersion}` : req.protocol,
  };
};

import type { Request } from "express";

export interface TypedRequestQuery<T> extends Request {
  query: T;
}
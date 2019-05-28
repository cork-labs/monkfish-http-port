import express from 'express';

export type IHttpErrorHandler = (
  req: express.Request,
  res: express.Response,
  error: Error
) => Promise<void>;

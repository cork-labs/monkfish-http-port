import express from 'express';

import { ApplicationError, IContext } from '@cork-labs/monkfish';

export type IHttpErrorMiddleware = (
  req: express.Request,
  res: express.Response,
  error: ApplicationError,
  context: IContext
) => Promise<void>;

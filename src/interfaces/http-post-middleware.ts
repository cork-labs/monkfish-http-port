import express from 'express';

import { ICommandResult, IContext } from '@cork-labs/monkfish';

export type IHttpPostMiddleware = (
  req: express.Request,
  res: express.Response,
  result: ICommandResult,
  context: IContext
) => Promise<void>;

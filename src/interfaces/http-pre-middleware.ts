import express from 'express';

import { ICommand, IContext } from '@cork-labs/monkfish';

export type IHttpPreMiddleware = (
  req: express.Request,
  res: express.Response,
  command: ICommand,
  context: IContext
) => Promise<void>;

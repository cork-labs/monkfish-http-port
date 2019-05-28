import express from 'express';

import { Timing } from '@cork-labs/class-timing';
import { ILogger } from '@cork-labs/monkfish-logger';

export interface IReqLogger extends express.Request {
  logger: ILogger;
  timing: Timing;
  [key: string]: any;
}

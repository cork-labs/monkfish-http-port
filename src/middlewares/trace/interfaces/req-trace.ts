import express from 'express';

import { ITrace } from './trace';

export interface IReqTrace extends express.Request {
  trace: ITrace;
}

import express from 'express';

import { IHttpRouter } from './http-router';

export interface IHttpPort {
  middleware (middleware: express.RequestHandler): void;
  route (path: string, router: IHttpRouter): void;
  default (notFoundFn: express.RequestHandler): void;
  catch (errorHandler: express.ErrorRequestHandler): void;
  start (): Promise<void>;
}

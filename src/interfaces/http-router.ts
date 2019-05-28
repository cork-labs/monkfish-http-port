import express from 'express';

import { IHttpPostMiddleware } from './http-post-middleware';
import { IHttpPreMiddleware } from './http-pre-middleware';
import { IHttpRouteOptions } from './http-route-options';

export interface IHttpRouter {
  pre (middÂleware: IHttpPreMiddleware): void;
  post (middleware: IHttpPostMiddleware): void;
  route (method: string, path: string, options: IHttpRouteOptions): void;
  sub (path: string, router: IHttpRouter): void;
  build (pre?: IHttpPreMiddleware[], post?: IHttpPostMiddleware[]): express.Router;
}

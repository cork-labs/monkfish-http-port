import { IHttpErrorMiddleware } from './http-error-middleware';
import { IHttpPostMiddleware } from './http-post-middleware';
import { IHttpPreMiddleware } from './http-pre-middleware';

export interface IHttpRouteOptions {
  command: string;
  method?: string;
  path?: string;
  pre?: IHttpPreMiddleware[];
  request?: IHttpPreMiddleware;
  response?: IHttpPostMiddleware;
  post?: IHttpPostMiddleware[];
  error?: IHttpErrorMiddleware;
}

import { IHttpRouter } from './http-router';

export interface IHttpSubRouterOptions {
  path: string;
  router: IHttpRouter;
}

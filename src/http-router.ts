import * as express from 'express';

import { ICommandBus } from '@cork-labs/monkfish';

import { IHttpPostMiddleware } from './interfaces/http-post-middleware';
import { IHttpPreMiddleware } from './interfaces/http-pre-middleware';
import { IHttpRouteOptions } from './interfaces/http-route-options';
import { IHttpRouter } from './interfaces/http-router';
import { IHttpSubRouterOptions } from './interfaces/http-sub-router-options';

import { HttpRouteHandler } from './http-route-handler';

export class HttpRouter implements IHttpRouter {
  private preMiddlewares: IHttpPreMiddleware[] = [];
  private postMiddlewares: IHttpPostMiddleware[] = [];
  private routes: Array<IHttpRouteOptions | IHttpSubRouterOptions> = [];

  private bus: ICommandBus;

  constructor (bus: ICommandBus) {
    this.bus = bus;
  }

  public pre (middleware: IHttpPreMiddleware): void {
    this.preMiddlewares.push(middleware);
  }

  public post (middleware: IHttpPostMiddleware): void {
    this.postMiddlewares.push(middleware);
  }

  public route (method: string, path: string, options: IHttpRouteOptions) {
    const $o = options || {};
    $o.method = method || $o.method || 'get';
    $o.path = path;
    $o.pre = options.pre || [];
    $o.post = options.post || [];

    this.routes.push(options);
  }

  public sub (path: string, router: IHttpRouter) {
    this.routes.push({path, router});
  }

  public build (pre?: IHttpPreMiddleware[], post?: IHttpPostMiddleware[]): express.Router {
    const expressRouter = express.Router();
    this.routes.forEach((options: IHttpRouteOptions | IHttpSubRouterOptions) => {
      this.registerHandler(expressRouter, options, pre || [], post || []);
    });
    return expressRouter;
  }

  // -- private

  private registerHandler (
    expressRouter: express.Router,
    options: IHttpRouteOptions | IHttpSubRouterOptions,
    pre: IHttpPreMiddleware[],
    post: IHttpPostMiddleware[]
  ) {
    const routeOptions = options as IHttpRouteOptions;
    if (routeOptions.command) {
      routeOptions.pre = pre.slice(0).concat(this.preMiddlewares).concat(routeOptions.pre || []);
      routeOptions.post = post.slice(0).concat(this.postMiddlewares).concat(routeOptions.post || []);
      const route = new HttpRouteHandler(routeOptions, this.bus);
      ((expressRouter as any )[route.method || 'get'])(route.path, route.handler);
    } else {
      const subRouter = options as IHttpSubRouterOptions;
      const subPath = subRouter.path;
      const subPre = pre.slice(0).concat(this.preMiddlewares);
      const subPost = post.slice(0).concat(this.postMiddlewares);
      expressRouter.use(subPath, subRouter.router.build(subPre, subPost));
    }
  }

}

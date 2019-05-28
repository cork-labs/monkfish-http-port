import express from 'express';

import { ICommand, ICommandBus, ICommandResult, IContext } from '@cork-labs/monkfish';
import { Command, Context } from '@cork-labs/monkfish';

import { IHttpErrorMiddleware } from './interfaces/http-error-middleware';
import { IHttpPostMiddleware } from './interfaces/http-post-middleware';
import { IHttpPreMiddleware } from './interfaces/http-pre-middleware';
import { IHttpRouteOptions } from './interfaces/http-route-options';
import { IReqLogger } from './middlewares/logger/interfaces/req-logger';
import { IReqTrace } from './middlewares/trace/interfaces/req-trace';

export class HttpRouteHandler {

  public readonly method: string;
  public readonly path: string;

  private bus: ICommandBus;
  private command: string;
  private pre: IHttpPreMiddleware[];
  private request?: IHttpPreMiddleware;
  private response?: IHttpPostMiddleware;
  private post: IHttpPostMiddleware[];
  private error?: IHttpErrorMiddleware;

  constructor (options: IHttpRouteOptions, bus: ICommandBus) {
    this.method = options.method || 'get';
    this.path = options.path || '/';

    this.bus = bus;
    this.command = options.command;
    this.pre = options.pre || [];
    this.request = options.request;
    this.response = options.response;
    this.post = options.post || [];
    this.error = options.error;
  }

  get handler (): express.RequestHandler {
    return async (req: express.Request, res: express.Response, next: any) => {

      const rTiming = req as IReqLogger; // @xx ReqTiming
      rTiming.timing.add('routed');

      const command = new Command(this.command, {}, {}, rTiming.timing.get);

      const rTrace = req as unknown as IReqTrace;
      const context = new Context({ trace: rTrace.trace });

      const rLogger = req as unknown as IReqLogger;

      try {
        await this.preRequest(req, res, command, context, (this.pre || []).slice(0));
        if (this.request) {
          await this.request(req, res, command, context);
        }
        const result = await this.bus.handle(command, context, rLogger.logger);
        rTiming.timing.add('handled');
        if (this.response) {
          this.response(req, res, result, context);
        }
        await this.postRequest(req, res, result, context, (this.post || []).slice(0));
        next();
      } catch (err) {
        rTiming.timing.add('handled');
        if (this.error) {
          await this.error(req, res, err, context);
        }
        next(); // @xx?
      }
    };
  }

  private async preRequest (
    req: express.Request,
    res: express.Response,
    command: ICommand,
    context: IContext,
    pipeline: IHttpPreMiddleware[]
  ): Promise<void> {
    const middleware = pipeline.shift();
    if (!middleware) {
      return;
    }
    await middleware(req, res, command, context);
    await this.preRequest(req, res, command, context, pipeline);
  }

  private async postRequest (
    req: express.Request,
    res: express.Response,
    result: ICommandResult,
    context: IContext,
    pipeline: IHttpPostMiddleware[]
  ): Promise<void> {
    const middleware = pipeline.shift();
    if (!middleware) {
      return;
    }
    try {
      await middleware(req, res, result, context);
      await this.postRequest(req, res, result, context, pipeline);
    } catch (err) {
      const request = req as unknown as IReqLogger;
      request.logger.error('monkfish.port.http.router.post-request', { middleware: middleware.name }, err);
    }
  }

}

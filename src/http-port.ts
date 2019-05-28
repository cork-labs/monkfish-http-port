import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import _ from 'lodash';

import { ILogger } from '@cork-labs/monkfish-logger';

import { IHttpPort } from './interfaces/http-port';
import { IHttpPortConfig } from './interfaces/http-port-config';
import { IHttpRouter } from './interfaces/http-router';
import { IReqLogger } from './middlewares/logger/interfaces/req-logger';
import { IResResponses } from './middlewares/responses/interfaces/res-responses';

import { middlewareCookies } from './middlewares/cookies/cookies';
import { middlewareLogger } from './middlewares/logger/logger';
import { middlewareResponses } from './middlewares/responses/responses';
import { middlewareTrace } from './middlewares/trace/trace';

import { IHttpServer } from './interfaces/http-server';
import { middlewareCors } from './middlewares/cors/cors';

const defaults: IHttpPortConfig = {
  name: 'monkfish.port.http',
  hostname: 'localhost',
  cors: {},
  cookies: {},
  logger: {},
  responses: {},
  trace: {}
};

export class HttpPort implements IHttpPort {

  private express: express.Application;
  private server: IHttpServer;
  private logger: ILogger;
  private config: IHttpPortConfig;
  private name: string;

  private notFoundFn?: express.RequestHandler;
  private errorHandlers: express.ErrorRequestHandler[] = [];

  constructor (exp: express.Application, server: IHttpServer, logger: ILogger, config?: any) {
    this.express = exp;
    this.server = server;
    this.logger = logger;
    this.config = _.merge({}, defaults, config);
    this.name = this.config.name;

    this.server.on('error', this.onError.bind(this));
    this.server.on('listening', this.onListening.bind(this));

    this.express.use(bodyParser.json());
    this.express.use(cookieParser());
    this.express.use(middlewareCors(this.config.cors));
    this.express.use(middlewareCookies(this.config.cookies));
    this.express.use(middlewareResponses(this.config.responses));
    this.express.use(middlewareTrace(this.config.trace));
    this.express.use(middlewareLogger(this.config.logger, logger));
  }

  // -- public

  public middleware (middleware: express.RequestHandler): void {
    this.express.use(middleware);
  }

  public route (path: string, router: IHttpRouter): void {
    this.express.use(path, router.build());
  }

  public default (notFoundFn: express.RequestHandler): void {
    this.notFoundFn = notFoundFn;
  }

  public catch (errorHandler: express.ErrorRequestHandler): void {
    this.errorHandlers.push(errorHandler);
  }

  public async start (): Promise<void> {
    this.registerNotFound();
    this.registerErrorHandler();
    return this.server.start();
  }

  private registerNotFound () {
    this.express.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (this.notFoundFn) {
        await this.notFoundFn(req, res, next);
      }
    });
  }

  private registerErrorHandler () {
    this.express.use(async (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      const request = req as unknown as IReqLogger;
      const response = res as unknown as IResResponses;
      try {
        await this.handleError(err, req, res, this.errorHandlers.slice(0));
      } catch (err) {
        request.logger.error('monkfish.port.http.unhandled', { api: this.name }, err);
        if (!res.headersSent) {
          response.response.internalServerError('hum');
        }
      }
    });
  }

  private async handleError (
    err: Error,
    req: express.Request,
    res: express.Response,
    handlers: express.ErrorRequestHandler[]
  ) {
    const errorHandler = handlers.shift();
    if (!errorHandler) {
      throw err;
    }
    try {
      const next = () => true;
      await errorHandler(err, req, res, next); // @xx next?
    } catch (_) {
      // not handled
      this.handleError(err, req, res, handlers);
    }
  }

  private get logDetails () {
    return this.logger.flat('port', {
      port: this.name,
      host: this.config.hostname,
      server: this.server.settings
    });
  }

  private onError (err: any) {
    switch (err.code) {
      case 'EACCES':
        this.logger.error('monkfish.port.http.privileges-required', this.logDetails, err);
        break;
      case 'EADDRINUSE':
        this.logger.error('monkfish.port.http.already-in-use', this.logDetails, err);
        break;
      default:
        throw err;
    }
  }

  private onListening () {
    this.logger.info('monkfish.port.http.listening', this.logDetails);
  }
}

import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';

import express from 'express';
import _ from 'lodash';

import { EventEmitter,  ListenerCallback } from '@cork-labs/interface-emitter';

import { IHttpServer } from './interfaces/http-server';
import { IHttpServerConfig } from './interfaces/http-server-config';

const defaults: IHttpServerConfig = {
  port: 9080,
  https: {
    key: './key.pem',
    cert: './key.pem'
  }
};

export class HttpServer implements IHttpServer {
  private events: EventEmitter;
  private server: http.Server | https.Server;
  private config: IHttpServerConfig;
  private port: number;

  constructor (exp: express.Application, config: IHttpServerConfig) {
    this.events = new EventEmitter();
    this.config = _.merge({}, defaults, config);
    this.port = this.config.port!;

    if (this.config.https) {
      const options = {
        key: fs.readFileSync(this.config.https.key),
        cert: fs.readFileSync(this.config.https.cert)
      };
      this.server = https.createServer(options, exp);
    } else {
      this.server = http.createServer(exp);
    }
  }

  public async start (): Promise<void> {
    return new Promise((resolve: (any)) => {
      this.server.listen(this.port);
      this.server.on('error', (err: Error) => {
        this.events.emit('error', err);
      });
      this.server.on('listening', () => {
        this.events.emit('listening');
        resolve();
      });
    });
  }

  get settings () {
    const obj = this.server.address();
    const address = typeof obj === 'object' ? obj.address + ':' + obj.port : obj;
    return {
      address,
      https: !!this.config.https
    };
  }

  public on (event: any, listener: ListenerCallback): void {
    this.events.on(event, listener);
  }

  public off (event: any, listener: ListenerCallback): void {
    this.events.on(event, listener);
  }

  public once (event: any, listener: ListenerCallback): void {
    this.events.on(event, listener);
  }
}

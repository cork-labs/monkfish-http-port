'use strict';

const http = require('http');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const onHeaders = require('on-headers');

const httpCookies = require('@cork-labs/http-middleware-cookies');
const httpLogger = require('@cork-labs/http-middleware-logger');
const httpResponses = require('@cork-labs/http-middleware-responses');
const httpTrace = require('@cork-labs/http-middleware-trace');

class Port {
  constructor (logger, config) {
    this._logger = logger;
    this._config = config;
    this._port = this._normalizePort(this._config.port);
    this._name = config.name || 'Port';

    this._errorMiddlewares = [];

    this._express = express();
    this._server = http.createServer(this._express);

    this._express.use(cors(config.cors));
    this._express.use(bodyParser.json());
    this._express.use(cookieParser());

    this._express.use(httpCookies(config.cookies));
    this._express.use(httpResponses(config.responses));
    this._express.use(httpTrace(config.trace));
    this._express.use(httpLogger(config.logger, logger));
    this._express.use((req, res, next) => {
      onHeaders(res, () => res.log());
      next();
    });
  }

  _handleError (error, req, res, middlewares) {
    if (!middlewares.length) {
      throw error;
    }
    const middleware = middlewares.shift();
    return Promise.resolve()
      .then(() => {
        middleware(req, res, error);
      })
      .catch((error) => {
        return this._handleError(error, req, res, middlewares);
      });
  }

  _onError (err) {
    const address = this._express.address();
    switch (err.code) {
      case 'EACCES':
        this._logger.error({ err, address }, this._name + '::onListening() privileges required');
        process.exit(1);
      case 'EADDRINUSE':
        this._logger.error({ err, address }, this._name + '::onListening() already in use');
        process.exit(1);
      default:
        throw err;
    }
  }

  _onListening () {
    const address = this._server.address();
    this._logger.info({ address: address.address, port: address.port }, this._name + '::onListening()');
  }

  _normalizePort (value) {
    const port = parseInt(value, 10);
    if (isNaN(port)) {
      return value;
    } else if (port >= 0) {
      return port;
    }
    return false;
  }

  // -- public

  use (middleware) {
    this._express.use(middleware);
  }

  errorMap (middleware) {
    this._errorMiddlewares.push(middleware);
  }

  route (path, router) {
    this._express.use(path, router);
  }

  notFound (notFoundFn) {
    this._notFoundFn = notFoundFn;
  }

  start () {
    // not found
    this._express.use(this._notFoundFn);
    // errors
    this._express.use((err, req, res, next) => {
      this._handleError(err, req, res, this._errorMiddlewares.slice(0))
        .catch((err) => {
          req.logger.error({ err }, this._name + '::unhandled()');
          if (!res.headersSent) {
            res.response.internalServerError();
          }
        });
    });

    return new Promise((resolve, reject) => {
      this._logger.info({ port: this._port }, this._name + '::start()');
      this._server.listen(this._port);
      this._server.on('error', this._onError.bind(this));
      this._server.on('listening', () => {
        this._onListening(this);
        resolve();
      });
    });
  }
}

module.exports = Port;

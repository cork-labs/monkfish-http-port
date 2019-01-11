'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');

const _ = require('lodash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const onHeaders = require('on-headers');

const httpCookies = require('@cork-labs/http-middleware-cookies');
const httpLogger = require('@cork-labs/http-middleware-logger');
const httpResponses = require('@cork-labs/http-middleware-responses');
const httpTrace = require('@cork-labs/http-middleware-trace');

const Interceptor = require('./interceptor');

const defaults = {
  port: null,
  name: 'monkfish.port.http',
  https: {
    key: './key.pem',
    cert: './key.pem'
  },
  hostname: 'localhost',
  cors: {},
  cookies: {},
  responses: {},
  trace: {},
  error: {
    map: {}
  }
};

const corsEchoOrigin = (origin, cb) => cb(null, origin);

class Port {
  constructor (logger, config) {
    this._logger = logger;
    this._config = _.merge({}, defaults, config);
    this._port = this._normalizePort(this._config.port);
    this._name = this._config.name;

    this._pre = [];
    this._post = [];
    this._interceptors = {};

    if (this._config.cors.origin === 'echo') {
      this._config.cors.origin = corsEchoOrigin;
    }

    this._express = express();

    if (this._config.https) {
      const options = {
        key: fs.readFileSync(this._config.https.key),
        cert: fs.readFileSync(this._config.https.cert)
      };
      this._server = https.createServer(options, this._express);
    } else {
      this._server = http.createServer(this._express);
    }

    this._express.use(bodyParser.json());
    this._express.use(cookieParser());

    this._express.use(httpCookies(this._config.cookies));
    this._express.use(httpResponses(this._config.responses));
    this._express.use(httpTrace(this._config.trace));
    this._express.use(httpLogger(this._config.logger, logger));
    this._express.use((req, res, next) => {
      onHeaders(res, () => res.log());
      next();
    });

    this._express.use(cors(this._config.cors));

    this._errorHandlers = [(req, res, error) => {
      const handler = this._config.error.map[error.name];
      if (handler) {
        let details = null;
        if (handler.details === true) {
          details = error.details;
        } else if (handler.details) {
          details = handler.details;
        }
        return res.response[handler.response](error.name, details);
      }
      throw error;
    }];
  }

  _handleError (error, req, res, errorHandlers) {
    return Promise.resolve()
      .then(() => {
        if (!errorHandlers.length) {
          throw error;
        }
        const errorHandler = errorHandlers.shift();
        return Promise.resolve()
          .then(() => errorHandler(req, res, error))
          .catch((error) => this._handleError(error, req, res, errorHandlers));
      });
  }

  _info () {
    return {
      api: this._name,
      https: !!this._config.https,
      host: this._config.hostname
    };
  }

  _onError (err) {
    switch (err.code) {
      case 'EACCES':
        this._logger.error('monkfish.port.http.privileges-required', this._info(), err);
        process.exit(1);
      case 'EADDRINUSE':
        this._logger.error('monkfish.port.http.already-in-use', this._info(), err);
        process.exit(1);
      default:
        throw err;
    }
  }

  _onListening () {
    const obj = this._server.address();
    const address = obj.address + ':' + obj.port;
    this._logger.info('monkfish.port.http.listening', { http_address: address });
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

  interceptor (interceptor) {
    if (!Interceptor.isInterceptor(interceptor)) {
      throw new Error(`Invalid interceptor.`);
    }
    if (this._interceptors[interceptor.constructor.name]) {
      throw new Error(`Duplicate interceptor ${interceptor.constructor.name}.`);
    }
    this._interceptors[interceptor.constructor.name] = interceptor;
  }

  errorHandler (errorHandler) {
    this._errorHandlers.push(errorHandler);
  }

  pre (interceptor) {
    if (typeof interceptor !== 'function' || !interceptor.name) {
      throw new Error(`Invalid pre interceptor in ${this._name} router.`);
    }
    this._pre.push(interceptor);
  }

  post (interceptor) {
    if (typeof interceptor !== 'function' || !interceptor.name) {
      throw new Error(`Invalid post interceptor in ${this._name} router.`);
    }
    this._post.push(interceptor);
  }

  route (path, router) {
    this._express.use(path, router.build(this._interceptors, this._pre, this._post));
  }

  notFound (notFoundFn) {
    this._notFoundFn = notFoundFn;
  }

  // -- execute

  start () {
    // not found
    this._express.use(this._notFoundFn);
    // errors
    this._express.use((err, req, res, next) => {
      this._handleError(err, req, res, this._errorHandlers.slice(0))
        .catch((err) => {
          req.logger.error('monkfish.port.http.unhandled', { api: this._name }, err);
          if (!res.headersSent) {
            if (this._config.error.debug) {
              return res.response.internalServerError(err.name, err.details);
            } else {
              res.response.internalServerError();
            }
          }
        });
    });

    return new Promise((resolve, reject) => {
      this._logger.info('monkfish.port.http.start', this._info());
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

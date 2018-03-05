'use strict';

const express = require('express');

class HttpRouter {
  constructor (name, middlewares, service, logger) {
    this._name = name;
    this._middlewares = middlewares;
    this._service = service;
    this._logger = logger;
    this._routes = [];
    this._expressRouter = express.Router();
  }

  _resolveMiddleware (middleware) {
    if (typeof middleware === 'string') {
      const name = middleware;
      if (!this._middlewares[name]) {
        throw new Error(`Unknown middleware ${name} in ${this._name} router`);
      }
      middleware = this._middlewares[name];
    }

    if (typeof middleware !== 'function') {
      throw new Error(`Invalid middleware ${middleware} in ${this._name} router`);
    }

    return middleware;
  }

  _getRouteFn (options) {
    return (req, res, next) => {
      req.timing.add('routed');

      const event = this._service.newEvent(options.event);

      Promise.resolve(options.request(req, res, event))
        .then(() => this._service.handle(event, req.context, req.logger))
        .then((result) => {
          req.timing.add('handled');
          options.response(req, res, result);
        })
        .catch((err) => {
          req.timing.add('handled');
          options.error(req, res, err);
        })
        .catch(next);
    };
  }

  _addRoute (verb, path, options) {
    options = options || {};
    options.verb = verb;
    options.path = path;
    options.middlewares = options.middlewares || [];

    if (!options.request) {
      options.request = (req, res, event) => (event.params = req.params);
    } else if (typeof options.request !== 'function') {
      throw new Error(`Option "request" must be a function in ${this._name} ${options.verb}:${options.path}`);
    }

    if (!options.response) {
      options.response = (req, res, result) => res.response.ok(result && result.data, result && result.meta);
    } else if (typeof options.response !== 'function') {
      throw new Error(`Option "response" must be a function in ${this._name} ${options.verb}:${options.path}`);
    }

    if (!options.error) {
      options.error = (req, res, error) => {
        throw error;
      };
    } else if (typeof options.error !== 'function') {
      throw new Error(`Option "error" must be a function in ${this._name} ${options.verb}:${options.path}`);
    }

    const routeMiddlewares = options.middlewares.map((middleware) => {
      return this._resolveMiddleware(middleware);
    });

    this._expressRouter[options.verb](options.path, routeMiddlewares, this._getRouteFn(options));
  }

  use (middleware) {
    this._expressRouter.use(this._resolveMiddleware(middleware));
  }

  get (path, options) {
    this._addRoute('get', path, options);
  }

  put (path, options) {
    this._addRoute('put', path, options);
  }

  post (path, options) {
    this._addRoute('post', path, options);
  }

  delete (path, options) {
    this._addRoute('delete', path, options);
  }

  expressRouter () {
    return this._expressRouter;
  }
}

module.exports = HttpRouter;

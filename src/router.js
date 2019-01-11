'use strict';

const _ = require('lodash');
const express = require('express');

const defaults = {
  name: 'monkfish.port.http.router'
};

class HttpRouter {
  constructor (port, app, logger, config) {
    this._port = port;
    this._app = app;
    this._logger = logger;
    this._config = _.merge({}, defaults, config);
    this._name = this._config.name;

    this._pre = [];
    this._post = [];
    this._routes = [];
  }

  // -- private

  _resolveInterceptor (interceptors, interceptor) {
    const name = interceptor.name;
    if (!interceptors[name]) {
      throw new Error(`Unknown interceptor ${name} in ${this._name} router.`);
    }
    return interceptors[interceptor.name];
  }

  _preRequest (req, res, event, context, interceptors, pipeline) {
    if (!pipeline.length) {
      return Promise.resolve();
    }
    const interceptor = pipeline.shift();
    return Promise.resolve()
      .then(() => interceptor.handle(req, res, event, context))
      .then(() => this._preRequest(req, res, event, context, interceptors, pipeline));
  }

  _postRequest (req, res, result, context, interceptors, pipeline) {
    if (!pipeline.length) {
      return Promise.resolve();
    }
    const interceptor = pipeline.shift();
    return Promise.resolve()
      .then(() => interceptor.handle(req, res, result, context))
      .catch((err) => req.logger.error('monkfish.port.http.router.post-request', { interceptor: interceptor.name }, err))
      .then(() => this._postRequest(req, res, result, context, interceptors, pipeline));
  }

  _getRouteFn (options, interceptors) {
    return (req, res, next) => {
      req.timing.add('routed');

      const event = this._app.newEvent(options.event);
      const context = this._app.newContext({ trace: req.trace });

      Promise.resolve()
        .then(() => this._preRequest(req, res, event, context, interceptors, options.pre.slice(0)))
        .then(() => options.request(req, res, event, context))
        .then(() => this._app.handle(event, context, req.logger))
        .then((result) => {
          req.timing.add('handled');
          options.response(req, res, result, context);
          return result;
        })
        .then((result) => this._postRequest(req, res, result, context, interceptors, options.post.slice(0)))
        .catch((err) => {
          req.timing.add('handled');
          options.error(req, res, err, context);
        })
        .catch(next);
    };
  }

  _addRoute (verb, path, options) {
    options = options || {};
    options.verb = verb;
    options.path = path;
    options.pre = options.pre || [];
    options.post = options.post || [];

    if (!options.request) {
      options.request = (req, res, event, context) => (event.params = req.params);
    } else if (typeof options.request !== 'function') {
      throw new Error(`Option "request" must be a function in ${this._name} ${options.verb}:${options.path}`);
    }

    if (!options.response) {
      options.response = (req, res, result, context) => res.response.ok(result && result.data, result && result.meta);
    } else if (typeof options.response !== 'function') {
      throw new Error(`Option "response" must be a function in ${this._name} ${options.verb}:${options.path}`);
    }

    if (!options.error) {
      options.error = (req, res, error, context) => {
        throw error;
      };
    } else if (typeof options.error !== 'function') {
      throw new Error(`Option "error" must be a function in ${this._name} router, route ${options.verb}:${options.path}`);
    }

    if (!Array.isArray(options.pre)) {
      throw new Error(`Option "pre" must be an array in ${this._name} router, route ${options.verb}:${options.path}.`);
    }

    if (!Array.isArray(options.post)) {
      throw new Error(`Option "post" must be an array in ${this._name} router, route ${options.verb}:${options.path}.`);
    }

    options.pre.forEach(interceptor => {
      if (typeof interceptor !== 'function' || !interceptor.name) {
        throw new Error(`Invalid pre interceptor in ${this._name} router, route ${options.verb}:${options.path}.`);
      }
    });

    options.post.forEach(interceptor => {
      if (typeof interceptor !== 'function' || !interceptor.name) {
        throw new Error(`Invalid post interceptor in ${this._name} router, route ${options.verb}:${options.path}.`);
      }
    });

    this._routes.push(options);
  }

  // -- setup

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

  route (method, path, options) {
    this._addRoute(method, path, options);
  }

  // -- getters

  build (interceptors, pre, post) {
    const expressRouter = express.Router();
    this._routes.forEach((options) => {
      pre = pre.slice(0).concat(this._pre).concat(options.pre);
      options.pre = pre.map(interceptor => this._resolveInterceptor(interceptors, interceptor));
      post = post.slice(0).concat(this._post).concat(options.post);
      options.post = post.map(interceptor => this._resolveInterceptor(interceptors, interceptor));
      expressRouter[options.verb](options.path, this._getRouteFn(options, interceptors));
    });
    return expressRouter;
  }
}

module.exports = HttpRouter;

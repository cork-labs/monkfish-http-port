'use strict';

const _ = require('lodash');

class Interceptor {
  constructor (config) {
    this._config = _.cloneDeep(config);
  }
}

Interceptor.isInterceptor = (instance) => {
  return (typeof instance === 'object' && typeof instance.handle === 'function');
};

module.exports = Interceptor;

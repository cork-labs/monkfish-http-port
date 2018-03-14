'use strict';

const chai = require('chai');
const expect = chai.expect;
// const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const Interceptor = require('../src/interceptor');

describe('Interceptor', function () {
  it('should be a function', function () {
    expect(Interceptor).to.be.a('function');
  });

  describe('isInterceptor()', function () {
    it('given a module-ish object', function () {
      it('should return true', function () {
        expect(Interceptor.isInterceptor({ handle: () => {} })).to.equal(true);
      });
    });

    it('given a non object', function () {
      it('should return false', function () {
        expect(Interceptor.isInterceptor('foo')).to.equal(false);
      });
    });

    it('given an non-module-ish object', function () {
      it('should return false', function () {
        expect(Interceptor.isInterceptor({ })).to.equal(false);
      });
    });
  });

  describe('api', function () {
    beforeEach(function () {
      this.port = new Interceptor(null, {https: false});
    });

    it('should...', function () {
      expect(true).to.equal(true);
    });
  });
});

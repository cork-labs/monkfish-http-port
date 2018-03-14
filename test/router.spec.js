'use strict';

const chai = require('chai');
const expect = chai.expect;
// const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const Router = require('../src/router');

describe('Router', function () {
  it('should be a function', function () {
    expect(Router).to.be.a('function');
  });

  describe('api', function () {
    beforeEach(function () {
      this.router = new Router();
    });

    it('should...', function () {
      expect(true).to.equal(true);
    });
  });
});

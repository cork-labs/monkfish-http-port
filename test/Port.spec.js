'use strict';

const chai = require('chai');
const expect = chai.expect;
// const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const Port = require('../src/Port');

describe('Port', function () {
  it('should be a function', function () {
    expect(Port).to.be.a('function');
  });

  describe('api', function () {
    beforeEach(function () {
      this.port = new Port();
    });

    it('should...', function () {
      expect(true).to.equal(true);
    });
  });
});

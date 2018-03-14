'use strict';

const chai = require('chai');
const expect = chai.expect;
// const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const Port = require('../src/port');

describe('Port', function () {
  it('should be a function', function () {
    expect(Port).to.be.a('function');
  });

  describe('api', function () {
    beforeEach(function () {
      this.port = new Port(null, {https: false});
    });

    it('should...', function () {
      expect(true).to.equal(true);
    });
  });
});

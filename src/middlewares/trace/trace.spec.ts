import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(sinonChai);

import * as express from 'express';

import { middlewareTrace } from './trace';

describe('middlewareTrace()', function t () {
  let middleware: express.RequestHandler;

  describe('when invoked', function t () {
    beforeEach(function t () {
      middleware = middlewareTrace();
    });

    it('should return a middleware function', function t () {
      expect(middleware).to.be.a('function');
      expect(middleware.length).to.equal(3);
    });
  });

  describe('middleware(req, res, next)', function t () {
    beforeEach(function t () {
      middleware = middlewareTrace();
    });

    describe('when invoked', function t () {
      beforeEach(function t () {
        this.req = {
          headers: {
            'x-cork-labs-req-parent-id': 'foo',
            'x-cork-labs-client-ip': 'bar'
          }
        };
        this.res = {};
        this.nextSpy = sinon.spy();
        middleware(this.req, this.res, this.nextSpy);
      });

      it('should invoke the next() argument', function t () {
        expect(this.nextSpy).to.have.callCount(1);
      });

      it('should expose the "trace" object in req', function t () {
        expect(this.req.trace).to.be.an('object');
      });

      it('should generate a "uuid"', function t () {
        expect(this.req.trace.uuid).to.match(/^[\w]{8}-[\w]{4}-[\w]{4}-[\w]{4}-[\w]{12}$/);
      });

      it('should generate a "current"', function t () {
        expect(this.req.trace.current).to.match(/^[\w]{8}-[\w]{4}-[\w]{4}-[\w]{4}-[\w]{12}$/);
      });

      it('should carry over the "parent"', function t () {
        expect(this.req.trace.parent).to.equal('foo');
      });

      it('should carry over the "ip"', function t () {
        expect(this.req.trace.ip).to.equal('bar');
      });
    });

    describe('when "req.headers" contains an id', function t () {
      beforeEach(function t () {
        this.req = {
          headers: {
            'x-cork-labs-req-trace-id': 'foobar'
          }
        };
        this.res = {};
        this.nextSpy = sinon.spy();
      });

      describe('and the middleware function is invoked', function t () {
        beforeEach(function t () {
          middleware(this.req, this.res, this.nextSpy);
        });

        it('should expose the "trace" object in req', function t () {
          expect(this.req.trace.uuid).to.equal('foobar');
        });
      });
    });
  });

  describe('middleware configuration', function t () {
    beforeEach(function t () {
      this.req = {};
      this.res = {
        status: sinon.spy(),
        header: sinon.spy(),
        json: sinon.spy()
      };
      this.nextSpy = sinon.spy();
    });

    describe('when the configuration contains custom headers', function t () {
      beforeEach(function t () {
        this.config = {
          headers: {
            uuid: 'x-foo',
            parent: 'x-bar',
            ip: 'x-baz'
          }
        };
        middleware = middlewareTrace(this.config);
      });

      describe('and "req.headers" is populated accordingly', function t () {
        beforeEach(function t () {
          this.req = {
            headers: {
              'x-foo': '11',
              'x-bar': '22',
              'x-baz': '33'
            }
          };
          this.res = {};
          this.nextSpy = sinon.spy();
        });

        describe('and the middleware function is invoked', function t () {
          beforeEach(function t () {
            middleware(this.req, this.res, this.nextSpy);
          });

          it('should read from the custom headers', function t () {
            expect(this.req.trace.uuid).to.equal('11');
            expect(this.req.trace.parent).to.equal('22');
            expect(this.req.trace.ip).to.equal('33');
          });
        });
      });
    });
  });
});

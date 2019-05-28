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

import { ILogger } from '@cork-labs/monkfish-logger';

import { IReqTrace } from '../trace/interfaces/req-trace';
import { IReqLogger } from './interfaces/req-logger';

import { middlewareLogger } from './logger';

describe('middlewareLogger()', function t () {
  let middleware: express.RequestHandler;

  describe('when invoked', function t () {
    let logger: ILogger;

    beforeEach(function t () {
      logger = {} as ILogger;
      middleware = middlewareLogger({}, logger);
    });

    it('should return a middleware function', function t () {
      expect(middleware).to.be.a('function');
      expect(middleware.length).to.equal(3);
    });
  });

  describe('middleware(req, res, next)', function t () {
    let logger: ILogger;
    let childLogger: ILogger;

    beforeEach(function t () {
      childLogger = {
        info: sinon.spy(),
        error: sinon.spy()
      } as unknown as ILogger;
      logger = {
        child: sinon.stub().returns(childLogger)
      } as unknown as ILogger;
      middleware = middlewareLogger({}, logger);
    });

    describe('when invoked', function t () {
      let req: express.Request;
      let res: express.Response;
      let next: sinon.SinonSpy;

      beforeEach(function t () {
        req = {
          method: 'PUT',
          path: '/foo/bar',
        } as express.Request;
        (req as IReqTrace).trace = {
            uuid: '1f2',
            current: '3d1',
            parent: '31a',
            ip: '123'
        };
        res = {} as express.Response;
        next = sinon.spy();
        middleware(req, res, next);
      });

      it('should invoke the next() argument', function t () {
        expect(next).to.have.callCount(1);
      });

      it('should create a child logger', function t () {
        const expectedTrace = {
          trace: {
            current: '3d1',
            uuid: '1f2'
          }
        };
        const request = req as IReqLogger;
        expect(logger.child).to.have.been.calledWithExactly(expectedTrace);
        expect(request.logger).to.equal(childLogger);
      });

      it('should create a timing object', function t () {
        const request = req as IReqLogger;
        expect(request.timing).to.be.an('object');
        expect(request.timing.constructor.name).to.equal('Timing');
      });

      it('should log the request"', function t () {
        const expectedLog = {
          request: {
            method: 'PUT',
            path: '/foo/bar'
          }
        };
        expect(childLogger.info).to.have.been.calledWithExactly('monkfish.port.http.request', expectedLog);
      });

      it('should expose log() in the res object"', function t () {
        const request = req as IReqLogger;
        expect(request.log).to.be.a('function');
      });

      describe('when res.log() is invoked', function t () {
        beforeEach(function t () {
          const request = req as IReqLogger;
          request.statusCode = 333;
          request.errorCode = 999;
          request.log({ foo: 'bar' });
        });

        it('should log the response"', function t () {
          const expectedLog = {
            response: {
              status: 333,
              code: 999
            },
            timing: {
              total: 0
            }
          };
          expect(childLogger.error).to.have.been.calledWithExactly('monkfish.port.http.response', expectedLog);
        });
      });
    });
  });

  describe('middleware configuration', function t () {
    beforeEach(function t () {
      childLogger = {
        info: sinon.spy(),
        error: sinon.spy()
      };
      logger = {
        child: sinon.stub()
      };
      logger.child.returns(childLogger);
    });

    describe('when configuration is custom', function t () {
      beforeEach(function t () {
        this.config = {
          requestMessage: 'foobar.request',
          requestKey: 'foo',
          requestFields: {
            method: 'bar'
          },
          responseMessage: 'foobar.response',
          repsonseKey: 'baz',
          repsonseFields: {
            statusCode: 'qux'
          },
          responseTiming: true,
          traceKey: 'quux',
          traceFields: {
            uuid: 'quuux'
          }
        };
        middleware = middlewareLogger(this.config, logger);
      });

      describe('and the middleware function is invoked', function t () {
        beforeEach(function t () {
          req = {
            method: 'PUT',
            path: '/foo/bar',
            trace: {
              uuid: '1f2',
              current: '3d1'
            }
          };
          res = {};
          next = sinon.spy();
          middleware(req, res, next);
        });

        it('should pass the custom data to the child logger', function t () {
          const expectedTrace = {
            quux: {
              quuux: '1f2'
            }
          };
          expect(logger.child).to.have.been.calledWithExactly(expectedTrace);
        });

        it('should log custom fields"', function t () {
          const expectedLog = {
            foo: {
              bar: 'PUT'
            }
          };
          expect(childLogger.info).to.have.been.calledWithExactly('foobar.request', expectedLog);
        });
      });
    });
  });
});

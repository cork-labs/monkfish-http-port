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

import { IResResponses } from './interfaces/res-responses';
import { middlewareResponses } from './responses';

describe('middlewareResponses()', function t () {
  let middleware: express.RequestHandler;

  describe('when invoked', function t () {
    beforeEach(function t () {
      middleware = middlewareResponses();
    });

    it('should return a middleware function', function t () {
      expect(middleware).to.be.a('function');
      expect(middleware.length).to.equal(3);
    });
  });

  describe('middleware(req, res, next)', function t () {

    beforeEach(function t () {
      const config = {
        ns: 'x-namespace'
      };
      middleware = middlewareResponses(config);
      middleware = middlewareResponses();
    });

    describe('when invoked', function t () {
      let req: express.Request;
      let res: express.Response;
      let next: sinon.SinonSpy;

      beforeEach(function t () {
        req = {} as express.Request;
        res = {} as express.Response;
        res.status = sinon.spy();
        res.header = sinon.spy();
        res.json = sinon.spy();
        next = sinon.spy();
        middleware(req, res, next);
      });

      it('should invoke the next() argument', function t () {
        expect(next).to.have.callCount(1);
      });

      it('should expose the "meta" function in res', function t () {
        const response = res as IResResponses;
        expect(response.meta).to.be.a('function');
        expect(response.meta.length).to.equal(2);
      });

      it('should expose the "response" object in res', function t () {
        const response = res as IResResponses;
        expect(response.response).to.be.an('object');
        expect(response.response.constructor.name).to.equal('Response');
      });

      it('should expose the "ok" function in res.response', function t () {
        const response = res as IResResponses;
        expect(response.response.ok).to.be.a('function');
      });

      it('should expose the "noContent" function in res.response', function t () {
        const response = res as IResResponses;
        expect(response.response.noContent).to.be.a('function');
      });

      it('should expose the "badRequest" function in res.response', function t () {
        const response = res as IResResponses;
        expect(response.response.badRequest).to.be.a('function');
      });

      describe('when meta() is invoked with two strings', function t () {
        beforeEach(function t () {
          const response = res as IResResponses;
          response.meta('foo', 'bar');
        });

        it('should set the header in the response', function t () {
          const response = res as IResResponses;
          expect(response.header).to.have.been.calledWithExactly('x-namespace-foo', 'bar');
        });
      });

      describe('when meta() is invoked with an object', function t () {
        beforeEach(function t () {
          const response = res as IResResponses;
          response.meta('foo', 'bar');
        });

        it('should set the header in the response', function t () {
          const response = res as IResResponses;
          expect(response.header).to.have.been.calledWithExactly('x-namespace-foo', 'bar');
        });
      });

      describe('when ok() is invoked', function t () {
        let data: any;

        beforeEach(function t () {
          data = {};
          const response = res as IResResponses;
          response.response.ok(data);
        });

        it('should set "res.severity"', function t () {
          const response = res as IResResponses;
          expect(response.severity).to.equal('info');
        });

        it('should invoke "res.status()"', function t () {
          const response = res as IResResponses;
          expect(response.status).to.have.been.calledWithExactly(200);
        });

        it('should invoke "res.json()"', function t () {
          const response = res as IResResponses;
          expect(response.json).to.have.been.calledWithExactly(data);
        });
      });

      describe('when noContent() is invoked', function t () {
        beforeEach(function t () {
          const response = res as IResResponses;
          response.response.noContent();
        });

        it('should set "res.severity"', function t () {
          const response = res as IResResponses;
          expect(response.severity).to.equal('info');
        });

        it('should invoke "res.status()"', function t () {
          const response = res as IResResponses;
          expect(response.status).to.have.been.calledWithExactly(204);
        });

        it('should invoke "res.json()"', function t () {
          const response = res as IResResponses;
          expect(response.json).to.have.been.calledWithExactly();
        });
      });

      describe('when notFound() is invoked', function t () {
        let code: string;
        let details: any;

        beforeEach(function t () {
          const response = res as IResResponses;
          code = 'foobar';
          details = { foo: 'bar' };
          response.response.notFound(code, details);
        });

        it('should set "res.severity"', function t () {
          const response = res as IResResponses;
          expect(response.severity).to.equal('warn');
        });

        it('should invoke "res.status()"', function t () {
          const response = res as IResResponses;
          expect(response.status).to.have.been.calledWithExactly(404);
        });

        it('should invoke "res.json()"', function t () {
          const expectedPayload = {
            error: 'NotFound',
            code: 'foobar',
            details: {
              foo: 'bar'
            }
          };
          const response = res as IResResponses;
          expect(response.json).to.have.been.calledWithExactly(expectedPayload);
        });
      });

      describe('when internalServerError() is invoked', function t () {
        let code: string;
        let details: any;

        beforeEach(function t () {
          code = 'foobar';
          details = { foo: 'bar' };
          const response = res as IResResponses;
          response.response.internalServerError(code, details);
        });

        it('should set "res.severity"', function t () {
          const response = res as IResResponses;
          expect(response.severity).to.equal('error');
        });

        it('should set "res.errorCode"', function t () {
          const response = res as IResResponses;
          expect(response.errorCode).to.equal('foobar');
        });

        it('should invoke "res.status()"', function t () {
          const response = res as IResResponses;
          expect(response.status).to.have.been.calledWithExactly(500);
        });

        it('should invoke "res.json()"', function t () {
          const expectedPayload = {
            error: 'InternalServerError',
            code: 'foobar',
            details: {
              foo: 'bar'
            }
          };
          const response = res as IResResponses;
          expect(response.json).to.have.been.calledWithExactly(expectedPayload);
        });
      });

      describe('when severity() is invoked before response', function t () {
        let code: string;
        let details: any;

        beforeEach(function t () {
          code = 'foobar';
          details = { foo: 'bar' };
          const response = res as IResResponses;
          response.response.severity('warn');
          response.response.internalServerError(code, details);
        });

        it('should preserve the previous severity', function t () {
          const response = res as IResResponses;
          expect(response.severity).to.equal('warn');
        });
      });

      describe('when code() is invoked before response', function t () {
        let code: string;
        let details: any;

        beforeEach(function t () {
          code = 'foobar';
          details = { foo: 'bar' };
          const response = res as IResResponses;
          response.response.code('baz');
          response.response.internalServerError(code, details);
        });

        it('should preserve the previous code', function t () {
          const response = res as IResResponses;
          expect(response.errorCode).to.equal('baz');
        });
      });
    });
  });

  describe('middleware configuration', function t () {
    let req: express.Request;
    let res: express.Response;
    let next: sinon.SinonSpy;

    beforeEach(function t () {
      req = {} as express.Request;
      res = {} as express.Response;
      res.status = sinon.spy();
      res.header = sinon.spy();
      res.json = sinon.spy();
      next = sinon.spy();
    });

    describe('when "config.keys" is set', function t () {
      beforeEach(function t () {
        const config = {
          keys: {
            error: 'e',
            code: 'c',
            details: 'd'
          }
        };
        middleware = middlewareResponses(config);
        middleware(req, res, next);
      });

      describe('and internalServerError() is invoked', function t () {
        let code: string;
        let details: any;

        beforeEach(function t () {
          code = 'foobar';
          details = { foo: 'bar' };
          const response = res as IResResponses;
          response.response.internalServerError(code, details);
        });

        it('should invoke "res.json()" with the modified key', function t () {
          const expectedPayload = {
            e: 'InternalServerError',
            c: 'foobar',
            d: {
              foo: 'bar'
            }
          };
          const response = res as IResResponses;
          expect(response.json).to.have.been.calledWithExactly(expectedPayload);
        });
      });
    });

    describe('when "config.methods" overrides an existing data method', function t () {
      beforeEach(function t () {
        const config = {
          methods: {
            ok: {
              type: 'data',
              status: 299
            }
          }
        };
        middleware = middlewareResponses(config);
        middleware(this.req, res, next);
      });

      describe('and that error method is invoked', function t () {
        let data: any;

        beforeEach(function t () {
          data = { foo: 'bar' };
          const response = res as IResResponses;
          response.response.ok(data);
        });

        it('should invoke "res.status()"', function t () {
          const response = res as IResResponses;
          expect(response.status).to.have.been.calledWithExactly(299);
        });

        it('should invoke "res.json()" with the modified key', function t () {
          const response = res as IResResponses;
          expect(response.json).to.have.been.calledWithExactly(data);
        });
      });
    });

    describe('when "config.methods" overrides an existing noContent method', function t () {
      beforeEach(function t () {
        const config = {
          methods: {
            noContent: {
              type: 'no-content',
              status: 299
            }
          }
        };
        middleware = middlewareResponses(config);
        middleware(this.req, res, next);
      });

      describe('and that noContent method is invoked', function t () {

        beforeEach(function t () {
          const response = res as IResResponses;
          response.response.noContent();
        });

        it('should invoke "res.status()"', function t () {
          const response = res as IResResponses;
          expect(response.status).to.have.been.calledWithExactly(299);
        });

        it('should invoke "res.json()" with the modified key', function t () {
          const response = res as IResResponses;
          expect(response.json).to.have.been.calledWithExactly();
        });
      });
    });

    describe('when "config.methods" overrides an existing error method', function t () {
      beforeEach(function t () {
        const config = {
          methods: {
            internalServerError: {
              type: 'server-error',
              status: 599,
              text: 'foobar'
            }
          }
        };
        middleware = middlewareResponses(config);
        middleware(req, res, next);
      });

      describe('and that error method is invoked', function t () {
        let code: string;

        beforeEach(function t () {
          code = 'foobar';
          const response = res as IResResponses;
          response.response.internalServerError(code);
        });

        it('should invoke "res.status()"', function t () {
          const response = res as IResResponses;
          expect(response.status).to.have.been.calledWithExactly(599);
        });

        it('should invoke "res.json()" with the modified key', function t () {
          const expectedPayload = {
            error: 'foobar'
          };
          const response = res as IResResponses;
          expect(response.json).to.have.been.calledWithExactly(expectedPayload);
        });
      });
    });

    describe('when "config.methods" supplies a method factory', function t () {
      beforeEach(function t () {
        this.method = sinon.spy();
        const config = {
          methods: {
            internalServerError: this.method
          }
        };
        middleware = middlewareResponses(config);
        middleware(this.req, res, next);
      });

      describe('and the exposed method is invoked', function t () {
        beforeEach(function t () {
          const response = res as IResResponses;
          response.response.internalServerError('foo', 'bar');
        });

        it('should invoke the method returned by the factory', function t () {
          expect(this.method).to.have.been.calledWithExactly('foo', 'bar');
        });
      });
    });

    describe('when "config.methods" supplies an invalid method definition', function t () {
      let config: any;

      beforeEach(function t () {
        config = {
          methods: {
            internalServerError: {}
          }
        };
      });

      it('should throw an error', function t () {
        const fn = () => {
          middleware = middlewareResponses(config);
        };
        expect(fn).to.throw('Invalid method definition');
      });
    });
  });
});

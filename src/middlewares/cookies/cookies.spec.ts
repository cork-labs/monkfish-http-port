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

import { IResCookies } from './interfaces/res-cookies';

import { middlewareCookies } from './cookies';

describe('middlewareCookies()', function t () {
  let middleware: express.RequestHandler;

  describe('when invoked', function t () {
    beforeEach(function t () {
      middleware = middlewareCookies();
    });

    it('should return a middleware function', function t () {
      expect(middleware).to.be.a('function');
      expect(middleware.length).to.equal(3);
    });
  });

  describe('middleware(req, res, next)', function t () {

    beforeEach(function t () {
      middleware = middlewareCookies();
    });

    describe('when invoked', function t () {
      let req: express.Request;
      let res: express.Response;
      let next: sinon.SinonSpy;

      beforeEach(function t () {
        req = {} as express.Request;
        res = {} as express.Response;
        (res as IResCookies).cookie = sinon.spy();
        next = sinon.spy();
        middleware(req, res, next);
      });

      it('should invoke the next() argument', function t () {
        expect(next).to.have.callCount(1);
      });

      it('should expose the "setSessionCookie" function in res', function t () {
        const response = res as IResCookies;
        expect(response.setSessionCookie).to.be.a('function');
      });

      it('should expose the "setCookie" function in res', function t () {
        const response = res as IResCookies;
        expect(response.setSessionCookie).to.be.a('function');
      });

      describe('when setSessionCookie() is invoked', function t () {
        beforeEach(function t () {
          const response = res as IResCookies;
          response.setSessionCookie('name', 'value');
        });

        it('should invoke res.cookie()', function t () {
          const response = res as IResCookies;
          expect(response.cookie).to.have.callCount(1);
        });

        it('should forward the arguments and the configured domain to res.cookie()', function t () {
          const expected = {
            domain: this.config.domain,
            secure: true,
            httpOnly: true
          };
          const response = res as IResCookies;
          expect(response.cookie).to.have.been.calledWithExactly('name', 'value', expected);
        });
      });

      describe('when setCookie() is invoked', function t () {
        beforeEach(function t () {
          middleware(req, res, next);
          const response = res as IResCookies;
          response.setCookie('name', 'value', 3600);
        });

        it('should invoke res.cookie()', function t () {
          expect(res.cookie).to.have.callCount(1);
        });

        it('should forward the arguments and configured maxAge and domain to res.cookie()', function t () {
          const expected = {
            domain: this.config.domain,
            maxAge: this.config.maxAge,
            secure: true,
            httpOnly: true
          };
          expect(res.cookie).to.have.been.calledWithExactly('name', 'value', expected);
        });
      });

      describe('when setCookie() is invoked with a maxAge', function t () {
        beforeEach(function t () {
          this.maxAge = 1;
          middleware(this.req, this.res, next);
          this.res.setCookie('name', 'value', this.maxAge);
        });

        it('should invoke res.cookie()', function t () {
          expect(res.cookie).to.have.callCount(1);
        });

        it('should forward the arguments, including maxAge, to res.cookie()', function t () {
          const expected = {
            domain: this.config.domain,
            maxAge: this.maxAge,
            secure: true,
            httpOnly: true
          };
          expect(res.cookie).to.have.been.calledWithExactly('name', 'value', expected);
        });
      });
    });

    describe('given a custom configuration', function t () {
      let req: express.Request;
      let res: express.Response;
      let next: sinon.SinonSpy;

      beforeEach(function t () {
        const config = {
          domain: 'foo.bar',
          maxAge: 42,
          secure: false
        };
        middleware = middlewareCookies(config);
      });

      describe('when invoked, followed by setCookie()', function t () {
        beforeEach(function t () {
          req = {} as express.Request;
          res = {} as express.Response;
          (res as IResCookies).cookie = sinon.spy();
          next = sinon.spy();
          middleware(req, res, next);
          const response = res as IResCookies;
          response.setCookie('name', 'value', this.maxAge);
        });

        it('should forward the custom arguments to res.cookie()', function t () {
          const expected = {
            domain: this.config.domain,
            maxAge: this.config.maxAge,
            secure: false,
            httpOnly: true
          };
          expect(res.cookie).to.have.been.calledWithExactly('name', 'value', expected);
        });
      });
    });
  });
});

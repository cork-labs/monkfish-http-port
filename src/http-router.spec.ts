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

import { CommandBus } from '@cork-labs/monkfish';
import { NextFunction } from 'connect';
import { HttpRouter } from './http-router';

describe('Router', function t () {
  let subject: HttpRouter;

  describe('build()', function t () {
    let commandBus: CommandBus;
    let router: express.Router;

    beforeEach(function t () {
      commandBus = new CommandBus();
      subject = new HttpRouter(commandBus);
      router = subject.build();
    });

    it('should return an express router', function t () {
      expect(typeof router).to.equal('function');
    });

    describe('when the router is invoked', function t () {
      let req: express.Request;
      let res: express.Response;
      let next: sinon.SinonSpy;
      let result: any;

      beforeEach(async function t () {
        req = {} as express.Request;
        res = {} as express.Response;
        next = sinon.spy();
        result = router(req, res, next as NextFunction);
        return await new Promise(function p (resolve: () => void) {
          setImmediate(resolve);
        });
      });

      it('should return undefined', function t () {
        expect(typeof result).to.equal('undefined');
      });

      it('should invoke the next function', function t () {
        expect(next.callCount).to.equal(1);
      });
    });
  });
});

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

import { HttpPort } from './http-port';
import { IHttpServer } from './interfaces/http-server';

describe('Port', function t () {
  let subject: HttpPort;

  describe('start()', function t () {
    let exp: express.Application;
    let server: IHttpServer;
    let serverStart: sinon.SinonStub;
    let logger: ILogger;
    let result: Promise<void>;

    beforeEach(async function t () {
      exp = {} as express.Application;
      exp.use = sinon.stub();

      server = {} as IHttpServer;
      server.on = sinon.stub();
      serverStart = sinon.stub();
      server.start = serverStart;

      logger = {} as ILogger;
      logger.info = sinon.stub();

      subject = new HttpPort(exp, server, logger);
      result = subject.start();
    });

    it('when server starts', function t () {
      beforeEach(function t () {
        serverStart.returns(Promise.resolve());
      });

      it('should resolve', function t () {
        expect(result).to.eventually.equal(undefined);
      });
    });
  });
});

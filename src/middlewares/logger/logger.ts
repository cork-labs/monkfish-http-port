import express from 'express';

import { Timing } from '@cork-labs/class-timing';
import { ILogger, LoggerLevel } from '@cork-labs/monkfish-logger';

import { IReqLogger } from './interfaces/req-logger';
import { IResLogger } from './interfaces/res-logger';

const onHeaders = require('on-headers');

const defaults = {
  fields: {},
  requestMessage: 'monkfish.port.http.request',
  requestKey: 'request',
  requestFields: {
    method: 'method',
    path: 'path'
  },
  responseMessage: 'monkfish.port.http.response',
  responseKey: 'response',
  responseTimingKey: 'timing',
  responseFields: {
    statusCode: 'status',
    errorCode: 'code'
  },
  traceKey: 'trace',
  traceFields: {
    uuid: 'uuid',
    current: 'current'
  },
  severityMap: {}
};

interface IDict { [key: string]: any; }

export const middlewareLogger = (config: any = {}, logger: ILogger) => {
  const $c = Object.assign({}, defaults, config);

  const mapSeverity = (res: express.Response): string => {
    return $c.severityMap[res.statusCode] || 'error';
  };

  const initLogger = (req: IReqLogger) => {
    const fields = Object.assign({}, $c.fields);

    const trace: IDict = {};
    for (const key of Object.keys($c.traceFields)) {
      trace[$c.traceFields[key]] = req.trace[key];
    }

    logger.flat($c.traceKey, trace, fields);
    req.logger = logger.child(fields);
  };

  const initRequestData = (req: IReqLogger) => {

    const requestData: IDict = {};
    requestData[$c.requestKey] = {};
    for (const key of Object.keys($c.requestFields)) {
      requestData[$c.requestKey][$c.requestFields[key]] = req[key] as string;
    }

    req.logger.info($c.requestMessage, requestData);

    req.timing = new Timing();
  };

  // -- middleware

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const request = res as IReqLogger;
    const response = res as IResLogger;

    initLogger(request);

    initRequestData(request);

    const responseLog = () => {

      const responseData: IDict = {};
      responseData[$c.responseKey] = {};

      for (const key of Object.keys($c.responseFields)) {
        responseData[$c.responseKey][$c.responseFields[key]] = response[key];
      }

      if ($c.responseTimingKey) {
        responseData[$c.responseTimingKey] = request.timing.elapsed();
      }

      const severity: LoggerLevel = response.severity || mapSeverity(res);
      request.logger[severity]($c.responseMessage, responseData);
    };

    onHeaders(res, () => responseLog);

    next();
  };
};

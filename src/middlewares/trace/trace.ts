import express from 'express';
import { v4 as uuidV4 } from 'uuid';

import { IReqTrace } from './interfaces/req-trace';

const defaults = {
  headers: {}
};

const defaultHeaders = {
  uuid: 'req-trace-id',
  parent: 'req-parent-id',
  ip: 'client-ip'
};

export const middlewareTrace = (config?: any) => {
  const $c = Object.assign({}, defaults, config);
  $c.headers = Object.assign({}, defaultHeaders, $c.headers);

  const getHeader = (req: express.Request, key: string): string => {
    const value = req.headers[key];
    if (Array.isArray(value)) {
      return value[0] || '';
    } else {
      return value || '';
    }
  };

  // -- middleware

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const request = req as IReqTrace;

    request.trace = {
      uuid: getHeader(req, $c.headers.uuid) || uuidV4(),
      current: uuidV4(),
      parent: getHeader(req, $c.headers.parent),
      ip: getHeader(req, $c.headers.ip)
    };

    next();
  };
};

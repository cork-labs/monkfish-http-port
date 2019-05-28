import express from 'express';

import { IResResponses } from './interfaces/res-responses';

import { HttpResponse } from './http-response';

const defaults = {
  ns: 'x-cork-labs',
  keys: {}
};

const defaultKeys = {
  error: 'error',
  code: 'code',
  details: 'details'
};

export const middlewareResponses = (config?: any): express.RequestHandler => {
  const $c = Object.assign({}, defaults, config);
  $c.keys = Object.assign({}, defaultKeys, $c.keys);

  const meta = (res: IResResponses, key: string, value: string) => {
    const name = $c.ns + '-' + key;
    res.header(name, value);
  };

  // -- middleware

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const r = res as IResResponses;

    r.meta = (key: string, value: string) => {
      meta(r, key, value);
    };

    r.response = new HttpResponse($c, res as IResResponses);

    next();
  };
};

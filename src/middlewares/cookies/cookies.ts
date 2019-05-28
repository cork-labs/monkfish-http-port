import express from 'express';

import { IResCookies } from './interfaces/res-cookies';

const defaults = {
  domain: null,
  maxAge: null,
  secure: true
};

export const middlewareCookies = (config?: any): express.RequestHandler => {
  const $c = Object.assign({}, defaults, config);

  // -- middleware

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const r = res as IResCookies;

    r.setSessionCookie = (name: string, value: string) => {
      r.cookie(name, value, { httpOnly: true, secure: $c.secure, domain: $c.domain });
    };

    r.setCookie = (name: string, value: string, maxAge: number) => {
      const max  = maxAge || $c.maxAge;
      r.cookie(name, value, { maxAge: max, httpOnly: true, secure: $c.secure, domain: $c.domain });
    };

    r.unsetCookie = (name: string) => {
      r.cookie(name, null, { maxAge: 0, httpOnly: true, secure: $c.secure, domain: $c.domain });
    };

    next();
  };
};

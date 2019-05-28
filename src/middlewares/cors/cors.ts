import cors from 'cors';
import express from 'express';

import { ICorsConfig } from './interfaces/cors-config';

export const defaults: ICorsConfig = {
  origin: 'echo'
};

const corsEchoOrigin = (origin: any, cb: any) => cb(null, origin);

export const middlewareCors = (config?: any): express.RequestHandler => {
  const $c = Object.assign({}, defaults, config);

  const corsOptions: any = $c.cors;
  if (corsOptions && corsOptions.origin === 'echo') {
    corsOptions.origin = corsEchoOrigin;
  }

  return cors(corsOptions);
};

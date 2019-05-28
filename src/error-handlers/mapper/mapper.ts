import express from 'express';

import { IResResponses } from '../../middlewares/responses/interfaces/res-responses';

// @xx I
const defaults = {
  map: {}
};

export const errorHandlerMapper = (config?: any): express.ErrorRequestHandler => {
  const $c = Object.assign({}, defaults, config);

  // -- middleware

  return (error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {

    const response = res as IResResponses;
    const errorOptions = $c.map[error.name];
    if (errorOptions) {
      let details = null;
      if (errorOptions.details === true) {
        // details = error.details; // @xx
      } else if (errorOptions.details) {
        details = errorOptions.details;
      }
      // @ts-ignore
      // @xx
      return response.response[handler.response](error.name, details);
    }
    throw error;
  };
};

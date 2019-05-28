import express from 'express';

import { HttpResponse } from '../http-response';

export interface IResResponses extends express.Response {
  response: HttpResponse;
  meta: (key: string, value: string) => void;
  severity: string;
  errorCode: string;
}
